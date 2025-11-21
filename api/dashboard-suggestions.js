import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const suggestions = await sql`
      SELECT category, suggestion_text, sort_order
      FROM dashboard_suggestions
      WHERE is_active = true
      ORDER BY category, sort_order
    `;

    // Group by category
    const grouped = suggestions.reduce((acc, s) => {
      if (!acc[s.category]) {
        acc[s.category] = [];
      }
      acc[s.category].push(s.suggestion_text);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching dashboard suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard suggestions' });
  }
}
