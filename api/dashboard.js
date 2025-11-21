import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const metrics = await sql`
      SELECT metric_name, metric_value
      FROM dashboard_metrics
    `;

    const data = {};
    metrics.forEach(m => {
      data[m.metric_name] = m.metric_value;
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
