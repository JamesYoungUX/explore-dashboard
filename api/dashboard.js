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
    const metrics = await sql`
      SELECT metric_name, metric_value 
      FROM dashboard_metrics
    `;

    const data = {};
    metrics.forEach(m => {
      data[m.metric_name] = m.metric_value;
    });

    res.status(200).json(data);
  } catch (error) {
    return handleError(res, error, 'fetch dashboard data');
  }
}
