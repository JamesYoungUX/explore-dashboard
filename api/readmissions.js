import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const readmissions = await sql`
      SELECT
        r.*,
        p.name,
        p.mrn,
        p.age
      FROM readmissions r
      JOIN patients p ON r.patient_id = p.id
      ORDER BY r.readmission_date DESC
    `;

    res.json(readmissions);
  } catch (error) {
    console.error('Error fetching readmissions:', error);
    res.status(500).json({ error: 'Failed to fetch readmissions' });
  }
}
