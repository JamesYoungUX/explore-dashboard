import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const { gapType } = req.query;

    const gaps = await sql`
      SELECT
        cg.*,
        p.name,
        p.mrn,
        p.age
      FROM care_gaps cg
      JOIN patients p ON cg.patient_id = p.id
      WHERE cg.gap_type = ${gapType}
      ORDER BY cg.days_overdue DESC
    `;

    res.json(gaps);
  } catch (error) {
    console.error('Error fetching care gaps by type:', error);
    res.status(500).json({ error: 'Failed to fetch care gaps by type' });
  }
}
