import { getDb } from './_lib/db.js';
import { handleCors } from './_lib/cors.js';
import { handleError, notFound } from './_lib/errors.js';

/**
 * GET /api/cost-categories
 * Returns cost categories with spending AND utilization data
 *
 * Query params:
 * - periodKey (optional): 'ytd', 'last_12_months', 'last_quarter'
 * - slug (optional): Get specific category with drill-down data
 * - status (optional): Filter by performance_status ('red', 'yellow', 'green')
 */
export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getDb();
    const { periodKey, slug, status } = req.query;

    // Get the period
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
        message: 'Please run seed data to create periods.'
      });
    }

    // GET /api/cost-categories?slug=xyz - Get specific category with drill-down
    if (slug) {
      const categories = await sql`
        SELECT
          id,
          slug,
          category_name as "categoryName",
          period_id as "periodId",
          spending_pmpm_actual as "spendingPmpmActual",
          spending_pmpm_benchmark as "spendingPmpmBenchmark",
          spending_variance_amount as "spendingVarianceAmount",
          spending_variance_percent as "spendingVariancePercent",
          utilization_actual as "utilizationActual",
          utilization_benchmark as "utilizationBenchmark",
          utilization_variance_percent as "utilizationVariancePercent",
          utilization_unit as "utilizationUnit",
          performance_status as "performanceStatus",
          is_opportunity as "isOpportunity",
          is_strength as "isStrength",
          aco_rank as "acoRank",
          total_categories as "totalCategories",
          description,
          display_order as "displayOrder"
        FROM cost_categories
        WHERE slug = ${slug} AND period_id = ${period.id}
        LIMIT 1
      `;

      const category = categories[0];

      if (!category) {
        return notFound(res, 'Cost category');
      }

      // Get recommendations for this category
      const recommendations = await sql`
        SELECT
          r.id,
          r.title,
          r.description,
          r.status,
          r.priority,
          r.estimated_savings as "estimatedSavings",
          r.affected_lives as "affectedLives",
          r.patient_cohort as "patientCohort",
          r.has_program_details as "hasProgramDetails",
          r.can_convert_to_workflow as "canConvertToWorkflow",
          rcc.impact_amount as "impactAmount"
        FROM recommendations r
        JOIN recommendation_cost_categories rcc ON r.id = rcc.recommendation_id
        WHERE rcc.cost_category_id = ${category.id}
          AND r.status != 'rejected'
        ORDER BY
          CASE r.priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
          END,
          r.estimated_savings DESC NULLS LAST
      `;

      // Get hospital data
      const hospitals = await sql`
        SELECT
          id,
          cost_category_id as "costCategoryId",
          hospital_name as "hospitalName",
          discharges,
          avg_los as "avgLos",
          spend,
          readmission_rate as "readmissionRate",
          display_order as "displayOrder"
        FROM cost_category_hospitals
        WHERE cost_category_id = ${category.id}
        ORDER BY display_order ASC, spend DESC
      `;

      // Get DRG data
      const drgs = await sql`
        SELECT
          id,
          cost_category_id as "costCategoryId",
          drg_code as "drgCode",
          drg_description as "drgDescription",
          patient_count as "patientCount",
          total_spend as "totalSpend",
          avg_spend_per_patient as "avgSpendPerPatient",
          benchmark_avg as "benchmarkAvg",
          percent_above_benchmark as "percentAboveBenchmark",
          display_order as "displayOrder"
        FROM cost_category_drgs
        WHERE cost_category_id = ${category.id}
        ORDER BY display_order ASC, total_spend DESC
      `;

      // Get discharging hospitals
      const dischargingHospitals = await sql`
        SELECT
          id,
          cost_category_id as "costCategoryId",
          hospital_name as "hospitalName",
          discharges,
          percent_discharged_to_irf as "percentDischargedToIrf",
          percent_discharged_to_irf_benchmark as "percentDischargedToIrfBenchmark",
          display_order as "displayOrder"
        FROM cost_category_discharging_hospitals
        WHERE cost_category_id = ${category.id}
        ORDER BY display_order ASC, discharges DESC
      `;

      return res.status(200).json({
        category,
        recommendations,
        hospitals: hospitals.length > 0 ? hospitals : undefined,
        drgs: drgs.length > 0 ? drgs : undefined,
        dischargingHospitals: dischargingHospitals.length > 0 ? dischargingHospitals : undefined
      });
    }

    // GET /api/cost-categories - Get all categories (optionally filtered)
    let query = sql`
      SELECT
        id,
        slug,
        category_name as "categoryName",
        period_id as "periodId",
        spending_pmpm_actual as "spendingPmpmActual",
        spending_pmpm_benchmark as "spendingPmpmBenchmark",
        spending_variance_amount as "spendingVarianceAmount",
        spending_variance_percent as "spendingVariancePercent",
        utilization_actual as "utilizationActual",
        utilization_benchmark as "utilizationBenchmark",
        utilization_variance_percent as "utilizationVariancePercent",
        utilization_unit as "utilizationUnit",
        performance_status as "performanceStatus",
        is_opportunity as "isOpportunity",
        is_strength as "isStrength",
        aco_rank as "acoRank",
        total_categories as "totalCategories",
        description,
        display_order as "displayOrder"
      FROM cost_categories
      WHERE period_id = ${period.id}
    `;

    // Apply status filter if provided
    if (status) {
      query = sql`
        SELECT
          id,
          slug,
          category_name as "categoryName",
          period_id as "periodId",
          spending_pmpm_actual as "spendingPmpmActual",
          spending_pmpm_benchmark as "spendingPmpmBenchmark",
          spending_variance_amount as "spendingVarianceAmount",
          spending_variance_percent as "spendingVariancePercent",
          utilization_actual as "utilizationActual",
          utilization_benchmark as "utilizationBenchmark",
          utilization_variance_percent as "utilizationVariancePercent",
          utilization_unit as "utilizationUnit",
          performance_status as "performanceStatus",
          is_opportunity as "isOpportunity",
          is_strength as "isStrength",
          aco_rank as "acoRank",
          total_categories as "totalCategories",
          description,
          display_order as "displayOrder"
        FROM cost_categories
        WHERE period_id = ${period.id}
          AND performance_status = ${status}
      `;
    }

    const categories = await query;

    // Sort by display order, then by variance (worst first)
    categories.sort((a, b) => {
      if (a.displayOrder !== null && b.displayOrder !== null) {
        return a.displayOrder - b.displayOrder;
      }
      // If no display order, sort by absolute variance
      const aVariance = Math.abs(a.spendingVarianceAmount || 0);
      const bVariance = Math.abs(b.spendingVarianceAmount || 0);
      return bVariance - aVariance;
    });

    return res.status(200).json({
      period: {
        id: period.id,
        periodKey: period.period_key,
        periodLabel: period.period_label
      },
      categories
    });

  } catch (error) {
    return handleError(res, error, 'fetch cost categories');
  }
}
