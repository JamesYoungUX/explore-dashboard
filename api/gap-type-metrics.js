import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const metrics = await sql`
      SELECT
        gtm.*,
        COALESCE(
          json_agg(
            json_build_object('text', gi.intervention_text, 'sort_order', gi.sort_order)
            ORDER BY gi.sort_order
          ) FILTER (WHERE gi.id IS NOT NULL),
          '[]'
        ) as interventions
      FROM gap_type_metrics gtm
      LEFT JOIN gap_interventions gi ON gi.gap_type_id = gtm.id
      GROUP BY gtm.id
      ORDER BY gtm.bonus_weight DESC
    `;

    // Transform to match expected format
    const result = {};
    for (const m of metrics) {
      result[m.gap_type] = {
        qualityMeasure: m.quality_measure,
        currentRate: Number(m.current_rate),
        targetRate: Number(m.target_rate),
        topPerformerRate: Number(m.top_performer_rate),
        bonusWeight: Number(m.bonus_weight),
        eligiblePercent: Number(m.eligible_percent),
        revenuePerClosure: Number(m.revenue_per_closure),
        expectedROI: m.expected_roi,
        interventions: m.interventions.map(i => i.text)
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching gap type metrics:', error);
    res.status(500).json({ error: 'Failed to fetch gap type metrics' });
  }
}
