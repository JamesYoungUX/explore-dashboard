import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const summary = await sql`
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

    res.json(summary);
  } catch (error) {
    console.error('Error fetching care gaps summary:', error);
    res.status(500).json({ error: 'Failed to fetch care gaps summary' });
  }
}
