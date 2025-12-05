import { getDb } from './_lib/db.js';
import { handleCors } from './_lib/cors.js';
import { handleError } from './_lib/errors.js';

/**
 * GET /api/performance-insights
 * Returns ACO Cost Performance Insights data including:
 * - Current period info
 * - Top-level performance metrics with trending
 * - Cost opportunities (overspending + efficient areas)
 * - Efficiency KPIs
 * - Top recommendations
 *
 * Query params:
 * - periodKey (optional): 'ytd', 'last_12_months', 'last_quarter'. Defaults to active period.
 */
export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Disable caching to ensure fresh data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getDb();
    const { periodKey } = req.query;

    // Get the period (either specified or the active one)
    let period;
    if (periodKey) {
      const periods = await sql`
        SELECT * FROM performance_periods
        WHERE period_key = ${periodKey}
        LIMIT 1
      `;
      period = periods[0];
    } else {
      const periods = await sql`
        SELECT * FROM performance_periods
        WHERE is_active = true
        ORDER BY created_at DESC
        LIMIT 1
      `;
      period = periods[0];
    }

    if (!period) {
      return res.status(404).json({
        error: 'No performance period found',
        message: periodKey
          ? `Period '${periodKey}' not found`
          : 'No active period found. Please run seed data to create periods.'
      });
    }

    // Get performance metrics for this period
    const metrics = await sql`
      SELECT
        id,
        period_id as "periodId",
        metric_type as "metricType",
        current_value as "currentValue",
        previous_value as "previousValue",
        change_percent as "changePercent",
        change_direction as "changeDirection",
        benchmark_value as "benchmarkValue",
        is_above_benchmark as "isAboveBenchmark",
        display_format as "displayFormat"
      FROM performance_metrics
      WHERE period_id = ${period.id}
      ORDER BY id ASC
    `;

    // Get cost opportunities with category details
    const costOpportunities = await sql`
      SELECT
        co.id,
        co.period_id as "periodId",
        co.cost_category_id as "costCategoryId",
        co.opportunity_type as "opportunityType",
        co.amount_variance as "amountVariance",
        co.percent_variance as "percentVariance",
        co.aco_rank as "acoRank",
        co.display_order as "displayOrder",
        cc.slug as "categorySlug",
        cc.category_name as "categoryName",
        cc.performance_status as "performanceStatus",
        cc.spending_pmpm_actual as "spendingPmpmActual",
        cc.spending_pmpm_benchmark as "spendingPmpmBenchmark"
      FROM cost_opportunities co
      JOIN cost_categories cc ON co.cost_category_id = cc.id
      WHERE co.period_id = ${period.id}
        AND co.show_on_dashboard = true
      ORDER BY co.display_order ASC, ABS(co.amount_variance) DESC
    `;

    // Debug logging
    console.log('📊 Cost Opportunities returned:', costOpportunities.length);
    if (costOpportunities.length > 0) {
      console.log('First 3 categories:', costOpportunities.slice(0, 3).map(co => co.categoryName));
    }

    // Get efficiency KPIs for this period
    const efficiencyKpis = await sql`
      SELECT
        id,
        period_id as "periodId",
        kpi_type as "kpiType",
        kpi_label as "kpiLabel",
        actual_value as "actualValue",
        aco_benchmark as "acoBenchmark",
        milliman_benchmark as "millimanBenchmark",
        variance_percent as "variancePercent",
        performance_status as "performanceStatus",
        display_format as "displayFormat",
        display_order as "displayOrder",
        aco_rank as "acoRank"
      FROM efficiency_kpis
      WHERE period_id = ${period.id}
      ORDER BY display_order ASC, id ASC
    `;

    // Get top recommendations (high priority, not rejected)
    const topRecommendations = await sql`
      SELECT
        id,
        title,
        description,
        status,
        priority,
        estimated_savings as "estimatedSavings",
        affected_lives as "affectedLives",
        implementation_complexity as "implementationComplexity",
        patient_cohort as "patientCohort",
        cohort_size as "cohortSize",
        has_program_details as "hasProgramDetails",
        can_convert_to_workflow as "canConvertToWorkflow",
        workflow_type as "workflowType"
      FROM recommendations
      WHERE status != 'rejected'
        AND priority = 'high'
      ORDER BY
        CASE priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        estimated_savings DESC NULLS LAST
      LIMIT 2
    `;

    // For each recommendation, get affected categories
    for (const rec of topRecommendations) {
      const categories = await sql`
        SELECT
          cc.id as "categoryId",
          cc.category_name as "categoryName",
          cc.slug as "categorySlug",
          rcc.impact_amount as "impactAmount"
        FROM recommendation_cost_categories rcc
        JOIN cost_categories cc ON rcc.cost_category_id = cc.id
        WHERE rcc.recommendation_id = ${rec.id}
      `;
      rec.affectedCategories = categories;
    }

    // Format period for response
    const formattedPeriod = {
      id: period.id,
      periodKey: period.period_key,
      periodLabel: period.period_label,
      startDate: period.start_date,
      endDate: period.end_date,
      isActive: period.is_active
    };

    // Return combined response
    return res.status(200).json({
      period: formattedPeriod,
      metrics,
      costOpportunities,
      efficiencyKpis,
      topRecommendations
    });

  } catch (error) {
    return handleError(res, error, 'fetch performance insights');
  }
}
