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

    res.status(200).json(adherence);
  } catch (error) {
    return handleError(res, error, 'fetch medication adherence');
  }
}
