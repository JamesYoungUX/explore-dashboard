import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const categories = await sql`
      SELECT * FROM gap_categories
      ORDER BY amount DESC
    `;

    res.json(categories);
  } catch (error) {
    console.error('Error fetching gap categories:', error);
    res.status(500).json({ error: 'Failed to fetch gap categories' });
  }
}
