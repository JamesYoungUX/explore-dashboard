import { getDb } from './_lib/db.js';
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
    const { type, summary } = req.query;

    // GET /api/care-gaps?summary=true - Get summary
    if (summary === 'true') {
      const result = await sql`
        SELECT
          gap_type,
          COUNT(*) as total_gaps,
          AVG(days_overdue)::int as avg_days_overdue,
          MAX(days_overdue) as max_days_overdue,
          SUM(CASE WHEN days_overdue > 60 THEN 1 ELSE 0 END) as high_priority_count
        FROM care_gaps
        GROUP BY gap_type
        ORDER BY total_gaps DESC
      `;
      return res.status(200).json(result);
    }

    // GET /api/care-gaps?type=xyz - Get by type
    if (type) {
      const gaps = await sql`
        SELECT
          cg.*,
          p.name,
          p.mrn,
          p.age
        FROM care_gaps cg
        JOIN patients p ON cg.patient_id = p.id
        WHERE cg.gap_type = ${type}
        ORDER BY cg.days_overdue DESC
      `;
      return res.status(200).json(gaps);
    }

    // GET /api/care-gaps - Get all
    const gaps = await sql`
      SELECT
        cg.*,
        p.name,
        p.mrn,
        p.age
      FROM care_gaps cg
      JOIN patients p ON cg.patient_id = p.id
      ORDER BY cg.days_overdue DESC
    `;
    res.status(200).json(gaps);
  } catch (error) {
    return handleError(res, error, 'fetch care gaps');
  }
}
