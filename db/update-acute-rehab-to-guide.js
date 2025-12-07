import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function updateAcuteRehabRecommendations() {
    console.log('Updating Acute Rehab to show: Care Management, GUIDE, and Discharge Planning...\n');

    // Get acute-rehab category
    const cat = await sql`
    SELECT id, spending_variance_amount 
    FROM cost_categories 
    WHERE slug = 'acute-rehab' 
    AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
  `;

    const targetVariance = parseFloat(cat[0].spending_variance_amount);
    console.log(`Target variance: $${targetVariance}\n`);

    // Delete existing mappings for acute-rehab
    await sql`
    DELETE FROM recommendation_cost_categories
    WHERE cost_category_id = ${cat[0].id}
  `;

    // Add the three recommendations with amounts totaling $229,500
    // Distribution: Care Management (35%), GUIDE (20%), Discharge Planning (45%)
    await sql`
    INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount)
    VALUES 
      (1, ${cat[0].id}, 80000),   -- Care management
      (2, ${cat[0].id}, 45900),   -- GUIDE program
      (3, ${cat[0].id}, 103600)   -- Discharge planning
  `;

    console.log('Updated impact amounts:');
    console.log('  [1] Care management: $80,000');
    console.log('  [2] GUIDE program: $45,900');
    console.log('  [3] Discharge planning: $103,600');
    console.log('  Total: $229,500 ✓\n');

    // Verify
    const verification = await sql`
    SELECT 
      r.id,
      r.title,
      rcc.impact_amount
    FROM recommendations r
    JOIN recommendation_cost_categories rcc ON r.id = rcc.recommendation_id
    WHERE rcc.cost_category_id = ${cat[0].id}
    ORDER BY 
      CASE r.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END,
      r.estimated_savings DESC
  `;

    console.log('Verification (in display order):');
    let total = 0;
    verification.forEach(v => {
        const amt = parseFloat(v.impact_amount);
        total += amt;
        console.log(`  [${v.id}] ${v.title}: $${v.impact_amount}`);
    });
    console.log(`\nTotal: $${total}`);
    console.log(`✅ Matches variance: ${total === targetVariance}`);
}

updateAcuteRehabRecommendations().catch(console.error);
