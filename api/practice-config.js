import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const [config] = await sql`
      SELECT panel_size, total_quality_bonus
      FROM practice_config
      LIMIT 1
    `;

    res.json(config || { panel_size: 1522, total_quality_bonus: 350000 });
  } catch (error) {
    console.error('Error fetching practice config:', error);
    res.status(500).json({ error: 'Failed to fetch practice config' });
  }
}
