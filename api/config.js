import { getDb, testConnection } from './_lib/db.js';
import { handleCors } from './_lib/cors.js';
import { handleError } from './_lib/errors.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Only allow GET requests
  if (req.method !== 'GET') {
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
