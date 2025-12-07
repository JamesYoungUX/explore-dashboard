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

        // Read the seed SQL file (using v2 to bypass Vercel cache)
        const seedPath = resolve(process.cwd(), 'db/seed-v2.sql');
        console.log('🔧 Reading seed file from:', seedPath);
        const seedSQL = readFileSync(seedPath, 'utf-8');

        // Log a snippet to verify correct file
        const hasIPSurgical = seedSQL.includes('ip-surgical');
        const hasAvoidableED = seedSQL.includes('avoidable-ed-visits');
        const hasSpecialtyDrugs = seedSQL.includes('specialty-drugs');
        console.log('🔍 File verification:', { hasIPSurgical, hasAvoidableED, hasSpecialtyDrugs });

        console.log('📊 Executing database reset...');

        try {
          // Step 1: Manually truncate tables in correct order
          console.log('🗑️  Truncating tables...');
          await sql`TRUNCATE TABLE cost_category_discharging_hospitals RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE cost_category_drgs RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE cost_category_hospitals RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE cost_opportunities RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE efficiency_kpis RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE program_resources RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE recommendation_cost_categories RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE recommendations RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE cost_categories RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE performance_metrics RESTART IDENTITY CASCADE`;
          await sql`TRUNCATE TABLE performance_periods RESTART IDENTITY CASCADE`;
          console.log('✅ Tables truncated');

          // Step 2: Insert performance periods
          console.log('📥 Inserting performance periods...');
          await sql`INSERT INTO performance_periods (period_key, period_label, start_date, end_date, is_active) VALUES
            ('ytd', 'Year to Date', '2025-01-01', '2025-12-31', true),
            ('last_12_months', 'Last 12 Months', '2024-01-01', '2024-12-31', false),
            ('last_quarter', 'Last Quarter', '2024-10-01', '2024-12-31', false)`;

          const ytdPeriod = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
          const periodId = ytdPeriod[0].id;

          // Step 3: Insert cost categories for YTD
          console.log('📥 Inserting cost categories...');
          const categories = [
            ['acute-rehab', 'Acute Rehabilitation', 160.00, 145.00, 229500, 25.0, 6.5, 9.8, 9.0, 8.9, 'admits_per_k', 'red', true, false, 20, 20, '25.0% above benchmark', 1],
            ['op-surgical', 'OP Surgical', 194.62, 179.10, 236130, 22.0, 5.8, 22.5, 19.8, 13.6, 'procedures_per_k', 'red', true, false, 12, 20, '22.0% above benchmark', 2],
            ['ip-surgical', 'IP Surgical', 225.54, 214.00, 175620, 19.5, 4.5, 15.2, 14.5, 4.8, 'admits_per_k', 'red', true, false, 7, 20, '19.5% above benchmark', 3],
            ['inpatient-medical', 'Inpatient Medical', 237.18, 234.00, 48400, 20.7, 5.2, 58.5, 55.0, 6.4, 'admits_per_k', 'yellow', false, false, 11, 20, '20.7% above benchmark', 5],
            ['radiology', 'Radiology', 78.00, 80.00, -30440, -2.5, 2.3, 125, 128, -2.3, 'studies_per_k', 'yellow', false, false, 10, 20, 'Within 3% of benchmark', 6],
            ['lab-services', 'Lab Services', 34.00, 35.00, -15220, -2.9, -3.5, 450, 460, -2.2, 'tests_per_k', 'yellow', false, false, 9, 20, 'Within 3% of benchmark', 7],
            ['op-radiology', 'OP Radiology', 75.00, 78.00, -45660, -3.8, 1.2, 125, 135, -7.4, 'studies_per_k', 'green', false, true, 5, 20, '3.8% below benchmark', 8],
            ['avoidable-ed-visits', 'Avoidable ED visits', 85.00, 90.00, -76100, -5.6, -4.8, 180, 195, -7.7, 'visits_per_k', 'green', false, true, 1, 20, '5.6% below benchmark', 9],
            ['skilled-nursing', 'Skilled Nursing', 120.00, 128.50, -129370, -6.6, -7.2, 45, 52, -13.5, 'admits_per_k', 'green', false, true, 3, 20, '6.6% below benchmark', 10],
            ['preventive-care', 'Preventive Care', 47.20, 52.00, -73056, -3.1, 2.6, 2.8, 3.1, -9.7, 'services_per_member', 'green', false, false, 6, 20, '3.1% below benchmark', 11],
            ['generic-drugs', 'Generic Drugs', 105.73, 108.00, -31960, -2.1, -5.1, 85.2, 78.5, 8.5, 'percent_generic', 'green', false, false, 2, 20, '2.1% below benchmark', 12],
            ['primary-care', 'Primary Care', 206.01, 210.00, -60730, -1.9, 1.8, 4.2, 4.5, -6.7, 'visits_per_member', 'green', false, false, 8, 20, '1.9% below benchmark', 13],
          ];

          for (const cat of categories) {
            await sql`
              INSERT INTO cost_categories (
                slug, category_name, period_id,
                spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent, trend_percent,
                utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
                performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
              ) VALUES (
                ${cat[0]}, ${cat[1]}, ${periodId},
                ${cat[2]}, ${cat[3]}, ${cat[4]}, ${cat[5]}, ${cat[6]},
                ${cat[7]}, ${cat[8]}, ${cat[9]}, ${cat[10]},
                ${cat[11]}, ${cat[12]}, ${cat[13]}, ${cat[14]}, ${cat[15]}, ${cat[16]}, ${cat[17]}
              )
            `;
          }
          console.log(`✅ Inserted ${categories.length} cost categories`);

          // Step 4: Populate cost_opportunities from cost_categories
          console.log('🔄 Populating cost_opportunities...');

          // Get categories that are opportunities or strengths
          const oppCategories = await sql`
            SELECT * FROM cost_categories
            WHERE (is_opportunity = true OR is_strength = true)
            AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
          `;

          for (const cat of oppCategories) {
            const opportunityType = cat.is_opportunity ? 'overspending' : 'efficient';
            await sql`
              INSERT INTO cost_opportunities (
                period_id, cost_category_id, opportunity_type,
                amount_variance, percent_variance, aco_rank,
                display_order, show_on_dashboard
              ) VALUES (
                ${cat.period_id}, ${cat.id}, ${opportunityType},
                ${cat.spending_variance_amount}, ${cat.spending_variance_percent}, ${cat.aco_rank},
                ${cat.display_order}, true
              )
            `;
          }
          console.log(`✅ Created ${oppCategories.length} cost opportunities`);

          // Step 5: Insert efficiency KPIs for YTD
          console.log('📥 Inserting efficiency KPIs...');
          const kpis = [
            ['readmission_rate', 'Readmission Rate', 8.2, 6.5, 6.1, 26.2, 'warning', 'percent', 1],
            ['ed_rate', 'ED Visits per 1,000', 520, 440, 425, 18.2, 'warning', 'per_thousand', 2],
            ['preventable_ed', 'Preventable ED Visits', 34.5, 28.0, null, 23.2, 'warning', 'percent', 3],
            ['avoidable_ed_visits', 'Avoidable ED visits per 1000', 20.1, 21.97, null, -8.5, 'good', 'per_thousand', 4],
            ['imaging_lower_back', 'Imaging for lower back per 1000', 7.7, 8.5, null, -9.41, 'good', 'per_thousand', 5],
            ['annual_wellness_visits', 'Annual wellness visits per 1000', 802, 794, null, 1.01, 'good', 'per_thousand', 6],
          ];

          for (const kpi of kpis) {
            await sql`
              INSERT INTO efficiency_kpis (
                period_id, kpi_type, kpi_label,
                actual_value, aco_benchmark, milliman_benchmark,
                variance_percent, performance_status, display_format, display_order
              ) VALUES (
                ${periodId}, ${kpi[0]}, ${kpi[1]},
                ${kpi[2]}, ${kpi[3]}, ${kpi[4]},
                ${kpi[5]}, ${kpi[6]}, ${kpi[7]}, ${kpi[8]}
              )
            `;
          }
          console.log(`✅ Inserted ${kpis.length} KPIs`);

          // Step 6: Insert performance metrics for YTD
          console.log('📥 Inserting performance metrics...');
          const metrics = [
            ['total_cost', 4980760, 4840000, 2.9, 'up', 1450000, true, 'currency'],
            ['patient_count', 1522, 1485, 2.5, 'up', 1522, false, 'number'],
            ['risk_score', 1.08, 1.085, -0.5, 'down', 1.0, true, 'number'],
            ['cost_pmpm', 1080, 1053, 2.6, 'up', 950, true, 'currency'],
            ['cost_savings_opportunity', 750000, 765000, 5.5, 'up', 500000, true, 'currency'],
          ];

          for (const metric of metrics) {
            await sql`
              INSERT INTO performance_metrics (
                period_id, metric_type, current_value, previous_value, change_percent,
                change_direction, benchmark_value, is_above_benchmark, display_format
              ) VALUES (
                ${periodId}, ${metric[0]}, ${metric[1]}, ${metric[2]}, ${metric[3]},
                ${metric[4]}, ${metric[5]}, ${metric[6]}, ${metric[7]}
              )
            `;
          }
          console.log(`✅ Inserted ${metrics.length} performance metrics`);

          // Step 7: Insert basic recommendations
          console.log('📥 Inserting recommendations...');
          const recs = [
            ['Implement a care management program', 'Deploy intensive care management program targeting high-risk patients to reduce avoidable admissions and improve care coordination.', 'not_started', 'high', 350000, 39, 'medium', 'High need patients', 39],
            ['Refer patients with dementia to GUIDE program', 'Enroll eligible dementia patients in the GUIDE program for comprehensive care management and caregiver support.', 'not_started', 'high', 120000, 87, 'low', 'Patients with dementia', 87],
          ];

          for (const rec of recs) {
            await sql`
              INSERT INTO recommendations (
                title, description, status, priority,
                estimated_savings, affected_lives, implementation_complexity,
                patient_cohort, cohort_size
              ) VALUES (
                ${rec[0]}, ${rec[1]}, ${rec[2]}, ${rec[3]},
                ${rec[4]}, ${rec[5]}, ${rec[6]},
                ${rec[7]}, ${rec[8]}
              )
            `;
          }
          console.log(`✅ Inserted ${recs.length} recommendations`);

          // Verify categories were created
          const categoriesInDb = await sql`
            SELECT slug, category_name
            FROM cost_categories
            WHERE period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
            ORDER BY display_order
          `;

          console.log('✅ Database reset complete!');

          return res.status(200).json({
            success: true,
            message: 'Database reset to initial state',
            statementsExecuted: categories.length,
            errorCount: 0,
            successCount: categories.length,
            costOpportunitiesCreated: oppCategories.length,
            verification: {
              hasIPSurgical,
              hasAvoidableED,
              hasSpecialtyDrugs
            },
            categoriesInDb,
            timestamp: new Date().toISOString()
          });
        } catch (execError) {
          console.error('❌ Error executing seed file:', execError);
          throw execError;
        }
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
