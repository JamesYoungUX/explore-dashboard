import { getDb } from './_lib/db.js';
import { handleCors } from './_lib/cors.js';
import { handleError, notFound } from './_lib/errors.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getDb();
    const { slug } = req.query;

    // GET /api/gap-categories?slug=xyz - Get specific category with doctors/patients
    if (slug) {
      const [category] = await sql`
        SELECT * FROM gap_categories WHERE slug = ${slug}
      `;

      if (!category) {
        return notFound(res, 'Gap category');
      }

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

      return res.status(200).json({
        ...category,
        topDoctors,
        topPatients
      });
    }

    // GET /api/gap-categories - Get all categories
    const categories = await sql`
      SELECT * FROM gap_categories
      ORDER BY amount DESC
    `;
    res.status(200).json(categories);
  } catch (error) {
    return handleError(res, error, 'fetch gap categories');
  }
}
