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

    res.status(200).json(readmissions);
  } catch (error) {
    return handleError(res, error, 'fetch readmissions');
  }
}
