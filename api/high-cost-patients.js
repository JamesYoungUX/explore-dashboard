import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const patients = await sql`
      SELECT
        hcp.*,
        p.name,
        p.mrn,
        p.age
      FROM high_cost_patients hcp
      JOIN patients p ON hcp.patient_id = p.id
      ORDER BY hcp.total_cost DESC
    `;

    res.json(patients);
  } catch (error) {
    console.error('Error fetching high cost patients:', error);
    res.status(500).json({ error: 'Failed to fetch high cost patients' });
  }
}
