import { getDb } from './_lib/db.js';
import { handleCors } from './_lib/cors.js';
import { handleError, notFound } from './_lib/errors.js';

/**
 * GET /api/recommendations
 * Returns unified recommendations with status tracking
 *
 * Query params:
 * - id (optional): Get specific recommendation with details
 * - status (optional): Filter by status ('not_started', 'accepted', 'rejected', 'already_doing')
 * - priority (optional): Filter by priority ('high', 'medium', 'low')
 *
 * POST /api/recommendations (future)
 * Create a new recommendation
 *
 * PATCH /api/recommendations (future)
 * Update recommendation status
 */
export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Handle GET requests
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  // Handle POST requests (future implementation)
  if (req.method === 'POST') {
    return res.status(501).json({
      error: 'Not implemented',
      message: 'POST /api/recommendations will be implemented in future'
    });
  }

  // Handle PATCH requests
  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Handle GET requests for recommendations
 */
async function handleGet(req, res) {
  try {
    const sql = getDb();
    const { id, status, priority } = req.query;

    // GET /api/recommendations?id=123 - Get specific recommendation with full details
    if (id) {
      const recommendations = await sql`
        SELECT
          id,
          title,
          description,
          status,
          priority,
          is_measurable as "isMeasurable",
          estimated_savings as "estimatedSavings",
          affected_lives as "affectedLives",
          implementation_complexity as "implementationComplexity",
          patient_cohort as "patientCohort",
          cohort_size as "cohortSize",
          has_program_details as "hasProgramDetails",
          program_overview as "programOverview",
          video_url as "videoUrl",
          can_convert_to_workflow as "canConvertToWorkflow",
          workflow_type as "workflowType",
          created_at as "createdAt",
          updated_at as "updatedAt",
          status_changed_at as "statusChangedAt",
          status_changed_by as "statusChangedBy"
        FROM recommendations
        WHERE id = ${id}
        LIMIT 1
      `;

      const recommendation = recommendations[0];

      if (!recommendation) {
        return notFound(res, 'Recommendation');
      }

      // Get affected categories
      const categories = await sql`
        SELECT
          cc.id as "categoryId",
          cc.category_name as "categoryName",
          cc.slug as "categorySlug",
          cc.performance_status as "performanceStatus",
          rcc.impact_amount as "impactAmount"
        FROM recommendation_cost_categories rcc
        JOIN cost_categories cc ON rcc.cost_category_id = cc.id
        WHERE rcc.recommendation_id = ${id}
        ORDER BY rcc.impact_amount DESC NULLS LAST
      `;
      recommendation.affectedCategories = categories;

      // Get program resources if available
      if (recommendation.hasProgramDetails) {
        const resources = await sql`
          SELECT
            id,
            recommendation_id as "recommendationId",
            resource_type as "resourceType",
            title,
            content,
            display_order as "displayOrder",
            author,
            author_role as "authorRole"
          FROM program_resources
          WHERE recommendation_id = ${id}
          ORDER BY display_order ASC, id ASC
        `;

        // Group resources by type
        recommendation.programResources = {
          bestPractices: resources.filter(r => r.resourceType === 'best_practice'),
          testimonials: resources.filter(r => r.resourceType === 'testimonial'),
          implementationSteps: resources.filter(r => r.resourceType === 'implementation_step')
        };
      }

      return res.status(200).json(recommendation);
    }

    // GET /api/recommendations - Get all recommendations (with optional filters)
    let whereConditions = [];
    let params = {};

    // Build WHERE conditions
    if (status) {
      whereConditions.push('status = ${status}');
      params.status = status;
    }

    if (priority) {
      whereConditions.push('priority = ${priority}');
      params.priority = priority;
    }

    // Construct query
    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Note: Neon SQL doesn't support dynamic WHERE clauses well, so we'll handle this differently
    let query;

    if (status && priority) {
      query = sql`
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
          workflow_type as "workflowType",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM recommendations
        WHERE status = ${status} AND priority = ${priority}
      `;
    } else if (status) {
      query = sql`
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
          workflow_type as "workflowType",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM recommendations
        WHERE status = ${status}
      `;
    } else if (priority) {
      query = sql`
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
          workflow_type as "workflowType",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM recommendations
        WHERE priority = ${priority}
      `;
    } else {
      query = sql`
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
          workflow_type as "workflowType",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM recommendations
      `;
    }

    const recommendations = await query;

    // For each recommendation, get affected categories
    for (const rec of recommendations) {
      const categories = await sql`
        SELECT
          cc.id as "categoryId",
          cc.category_name as "categoryName",
          cc.slug as "categorySlug",
          cc.performance_status as "performanceStatus",
          rcc.impact_amount as "impactAmount"
        FROM recommendation_cost_categories rcc
        JOIN cost_categories cc ON rcc.cost_category_id = cc.id
        WHERE rcc.recommendation_id = ${rec.id}
        ORDER BY rcc.impact_amount DESC NULLS LAST
        LIMIT 3
      `;
      rec.affectedCategories = categories;
    }

    // Sort recommendations by priority and savings
    recommendations.sort((a, b) => {
      // Priority order
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority] || 99;
      const bPriority = priorityOrder[b.priority] || 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then by estimated savings (descending)
      const aSavings = a.estimatedSavings || 0;
      const bSavings = b.estimatedSavings || 0;
      return bSavings - aSavings;
    });

    return res.status(200).json({
      recommendations,
      totalCount: recommendations.length,
      filters: {
        status: status || null,
        priority: priority || null
      }
    });

  } catch (error) {
    return handleError(res, error, 'fetch recommendations');
  }
}

/**
 * Handle PATCH requests to update recommendation status
 */
async function handlePatch(req, res) {
  try {
    const sql = getDb();
    const { id, status } = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Recommendation ID is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['not_started', 'acknowledged', 'accepted', 'rejected', 'already_doing', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Update the recommendation status
    const result = await sql`
      UPDATE recommendations
      SET
        status = ${status},
        status_changed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, status, status_changed_at as "statusChangedAt", updated_at as "updatedAt"
    `;

    if (result.length === 0) {
      return notFound(res, 'Recommendation');
    }

    return res.status(200).json({
      success: true,
      recommendation: result[0]
    });

  } catch (error) {
    return handleError(res, error, 'update recommendation status');
  }
}
