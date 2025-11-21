import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
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
      return res.json(result);
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
      return res.json(gaps);
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
    res.json(gaps);
  } catch (error) {
    console.error('Error fetching care gaps:', error);
    res.status(500).json({ error: 'Failed to fetch care gaps' });
  }
}
