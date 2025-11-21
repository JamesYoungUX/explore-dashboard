import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const adherence = await sql`
      SELECT
        ma.*,
        p.name,
        p.mrn,
        p.age
      FROM medication_adherence ma
      JOIN patients p ON ma.patient_id = p.id
      WHERE ma.adherence_rate < 60
      ORDER BY ma.adherence_rate ASC
    `;

    res.json(adherence);
  } catch (error) {
    console.error('Error fetching medication adherence:', error);
    res.status(500).json({ error: 'Failed to fetch medication adherence' });
  }
}
