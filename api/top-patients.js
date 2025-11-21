import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const patients = await sql`
      SELECT
        gc.slug,
        gc.category,
        gc.amount,
        gc.percent,
        gc.color,
        p.name,
        p.age,
        gtp.spend,
        gtp.spend_category,
        gtp.cost_drivers,
        gtp.rank
      FROM gap_top_patients gtp
      JOIN gap_categories gc ON gtp.gap_category_id = gc.id
      JOIN patients p ON gtp.patient_id = p.id
      ORDER BY gc.amount DESC, gtp.rank ASC
    `;

    // Group by category
    const grouped = patients.reduce((acc, pat) => {
      const key = pat.slug;
      if (!acc[key]) {
        acc[key] = {
          category: pat.category,
          amount: pat.amount,
          percent: pat.percent,
          color: pat.color,
          topPatients: []
        };
      }
      acc[key].topPatients.push({
        name: pat.name,
        age: pat.age,
        spend: pat.spend,
        category: pat.spend_category,
        costDrivers: pat.cost_drivers
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching top patients:', error);
    res.status(500).json({ error: 'Failed to fetch top patients' });
  }
}
