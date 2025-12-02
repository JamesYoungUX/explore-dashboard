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

    res.status(200).json(patients);
  } catch (error) {
    return handleError(res, error, 'fetch high cost patients');
  }
}
