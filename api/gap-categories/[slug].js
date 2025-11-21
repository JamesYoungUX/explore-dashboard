import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const { slug } = req.query;

    // Get the gap category
    const [category] = await sql`
      SELECT * FROM gap_categories WHERE slug = ${slug}
    `;

    if (!category) {
      return res.status(404).json({ error: 'Gap category not found' });
    }

    // Get top doctors for this category
    const topDoctors = await sql`
      SELECT
        d.name,
        gtd.spend,
        gtd.patient_count,
        gtd.avg_per_patient,
        gtd.benchmark_avg,
        gtd.top_performer_avg,
        gtd.percent_above_benchmark,
        gtd.cost_drivers,
        gtd.opportunities
      FROM gap_top_doctors gtd
      JOIN doctors d ON gtd.doctor_id = d.id
      WHERE gtd.gap_category_id = ${category.id}
      ORDER BY gtd.rank ASC
    `;

    // Get top patients for this category
    const topPatients = await sql`
      SELECT
        p.name,
        p.age,
        gtp.spend,
        gtp.spend_category,
        gtp.cost_drivers
      FROM gap_top_patients gtp
      JOIN patients p ON gtp.patient_id = p.id
      WHERE gtp.gap_category_id = ${category.id}
      ORDER BY gtp.rank ASC
    `;

    res.json({
      ...category,
      topDoctors,
      topPatients
    });
  } catch (error) {
    console.error('Error fetching gap category:', error);
    res.status(500).json({ error: 'Failed to fetch gap category' });
  }
}
