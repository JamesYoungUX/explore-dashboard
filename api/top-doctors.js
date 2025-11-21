import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const doctors = await sql`
      SELECT
        gc.slug,
        gc.category,
        gc.amount,
        gc.percent,
        gc.color,
        d.name,
        gtd.spend,
        gtd.patient_count,
        gtd.avg_per_patient,
        gtd.benchmark_avg,
        gtd.top_performer_avg,
        gtd.percent_above_benchmark,
        gtd.cost_drivers,
        gtd.opportunities,
        gtd.rank
      FROM gap_top_doctors gtd
      JOIN gap_categories gc ON gtd.gap_category_id = gc.id
      JOIN doctors d ON gtd.doctor_id = d.id
      ORDER BY gc.amount DESC, gtd.rank ASC
    `;

    // Group by category
    const grouped = doctors.reduce((acc, doc) => {
      const key = doc.slug;
      if (!acc[key]) {
        acc[key] = {
          category: doc.category,
          amount: doc.amount,
          percent: doc.percent,
          color: doc.color,
          topDoctors: []
        };
      }
      acc[key].topDoctors.push({
        name: doc.name,
        spend: doc.spend,
        patients: doc.patient_count,
        avgPerPatient: doc.avg_per_patient,
        benchmarkAvg: doc.benchmark_avg,
        topPerformerAvg: doc.top_performer_avg,
        percentAboveBenchmark: doc.percent_above_benchmark,
        costDrivers: doc.cost_drivers,
        opportunities: doc.opportunities
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching top doctors:', error);
    res.status(500).json({ error: 'Failed to fetch top doctors' });
  }
}
