import { getDb, testConnection } from './_lib/db.js';
import { handleCors } from './_lib/cors.js';
import { handleError } from './_lib/errors.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Allow GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getDb();
    const { type } = req.query;

    // GET /api/config?type=health - Health check
    if (type === 'health') {
      const dbHealthy = await testConnection();
      if (!dbHealthy) {
        return res.status(503).json({
          status: 'unhealthy',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(200).json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    }

    // GET /api/config?type=practice - Practice config
    if (type === 'practice') {
      const [config] = await sql`
        SELECT panel_size, total_quality_bonus
        FROM practice_config
        LIMIT 1
      `;
      return res.status(200).json(config || { panel_size: 1522, total_quality_bonus: 350000 });
    }

    // GET /api/config?type=gap-metrics - Gap type metrics
    if (type === 'gap-metrics') {
      const metrics = await sql`
        SELECT
          gtm.*,
          COALESCE(
            json_agg(
              json_build_object('text', gi.intervention_text, 'sort_order', gi.sort_order)
              ORDER BY gi.sort_order
            ) FILTER (WHERE gi.id IS NOT NULL),
            '[]'
          ) as interventions
        FROM gap_type_metrics gtm
        LEFT JOIN gap_interventions gi ON gi.gap_type_id = gtm.id
        GROUP BY gtm.id
        ORDER BY gtm.bonus_weight DESC
      `;

      const result = {};
      for (const m of metrics) {
        result[m.gap_type] = {
          qualityMeasure: m.quality_measure,
          currentRate: Number(m.current_rate),
          targetRate: Number(m.target_rate),
          topPerformerRate: Number(m.top_performer_rate),
          bonusWeight: Number(m.bonus_weight),
          eligiblePercent: Number(m.eligible_percent),
          revenuePerClosure: Number(m.revenue_per_closure),
          expectedROI: m.expected_roi,
          interventions: m.interventions.map(i => i.text)
        };
      }
      return res.status(200).json(result);
    }

    // GET /api/config?type=suggestions - Dashboard suggestions
    if (type === 'suggestions') {
      const suggestions = await sql`
        SELECT category, suggestion_text, sort_order
        FROM dashboard_suggestions
        WHERE is_active = true
        ORDER BY category, sort_order
      `;

      const grouped = suggestions.reduce((acc, s) => {
        if (!acc[s.category]) {
          acc[s.category] = [];
        }
        acc[s.category].push(s.suggestion_text);
        return acc;
      }, {});
      return res.status(200).json(grouped);
    }

    // POST /api/config?type=reset - Reset database to initial state
    if (type === 'reset' && req.method === 'POST') {
      try {
        // Import the seed file dynamically
        const { readFileSync } = await import('fs');
        const { resolve } = await import('path');

        // Read the seed SQL file
        const seedPath = resolve(process.cwd(), 'db/seed-new-data.sql');
        console.log('🔧 Reading seed file from:', seedPath);
        const seedSQL = readFileSync(seedPath, 'utf-8');

        // Log a snippet to verify correct file
        const hasIPSurgical = seedSQL.includes('ip-surgical');
        const hasAvoidableED = seedSQL.includes('avoidable-ed-visits');
        const hasSpecialtyDrugs = seedSQL.includes('specialty-drugs');
        console.log('🔍 File verification:', { hasIPSurgical, hasAvoidableED, hasSpecialtyDrugs });

        // Remove comment-only lines first, then split into statements
        const cleanSQL = seedSQL
          .split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && !trimmed.startsWith('--');
          })
          .join('\n');

        // Split into individual statements and execute
        const statements = cleanSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        console.log(`📊 Executing ${statements.length} SQL statements...`);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < statements.length; i++) {
          try {
            const stmt = statements[i];
            const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');
            console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);
            await sql.unsafe(stmt);
            successCount++;
            console.log(`[${i + 1}/${statements.length}] ✓ Success`);
          } catch (error) {
            errorCount++;
            const errorMsg = `Statement ${i + 1} failed: ${error.message}`;
            console.error(`[${i + 1}/${statements.length}] ✗ FAILED:`, errorMsg);
            errors.push(errorMsg);
          }
        }

        console.log(`✅ Database reset completed: ${successCount} succeeded, ${errorCount} failed`);

        // Verify what's actually in the database now
        const categoriesInDb = await sql`
          SELECT slug, category_name FROM cost_categories
          WHERE period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
          ORDER BY display_order
          LIMIT 10
        `;
        console.log('📋 Categories in DB after reset:', categoriesInDb.map(c => c.slug));

        return res.status(200).json({
          success: true,
          message: 'Database reset successfully',
          statementsExecuted: statements.length,
          successCount,
          errorCount,
          errors: errors.slice(0, 5), // First 5 errors only
          verification: { hasIPSurgical, hasAvoidableED, hasSpecialtyDrugs },
          categoriesInDb: categoriesInDb.map(c => ({ slug: c.slug, name: c.category_name }))
        });
      } catch (error) {
        console.error('Reset error:', error);
        return res.status(500).json({
          success: false,
          message: `Reset failed: ${error.message}`
        });
      }
    }

    // GET /api/config - Return all config
    const [practiceConfig] = await sql`
      SELECT panel_size, total_quality_bonus FROM practice_config LIMIT 1
    `;

    res.status(200).json({
      practice: practiceConfig || { panel_size: 1522, total_quality_bonus: 350000 }
    });
  } catch (error) {
    return handleError(res, error, 'fetch config');
  }
}
