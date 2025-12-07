import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function checkAcuteRehabRecommendations() {
    console.log('Checking Acute Rehab recommendations...\n');

    // Get acute-rehab category
    const categories = await sql`
    SELECT id, category_name, slug, period_id
    FROM cost_categories
    WHERE slug = 'acute-rehab'
    ORDER BY period_id
  `;

    console.log(`Found ${categories.length} acute-rehab categories:`);
    categories.forEach(cat => {
        console.log(`  ID: ${cat.id}, Period: ${cat.period_id}`);
    });

    // Check recommendations for each category
    for (const cat of categories) {
        console.log(`\nChecking recommendations for category ${cat.id}:`);

        const recs = await sql`
      SELECT 
        r.id,
        r.title,
        rcc.impact_amount
      FROM recommendations r
      JOIN recommendation_cost_categories rcc ON r.id = rcc.recommendation_id
      WHERE rcc.cost_category_id = ${cat.id}
      ORDER BY r.id
    `;

        console.log(`  Found ${recs.length} recommendations:`);
        recs.forEach(rec => {
            console.log(`    [${rec.id}] ${rec.title} - Impact: $${rec.impact_amount}`);
        });
    }

    // Show all recommendations
    console.log('\n\nAll recommendations in database:');
    const allRecs = await sql`
    SELECT id, title, status, priority
    FROM recommendations
    ORDER BY id
  `;

    allRecs.forEach(rec => {
        console.log(`  [${rec.id}] ${rec.title} (${rec.status}, ${rec.priority})`);
    });

    // Show recommendation_cost_categories mappings
    console.log('\n\nAll recommendation-category mappings:');
    const mappings = await sql`
    SELECT 
      rcc.recommendation_id,
      r.title,
      cc.category_name,
      cc.slug,
      rcc.impact_amount
    FROM recommendation_cost_categories rcc
    JOIN recommendations r ON rcc.recommendation_id = r.id
    JOIN cost_categories cc ON rcc.cost_category_id = cc.id
    ORDER BY rcc.recommendation_id, cc.category_name
  `;

    mappings.forEach(m => {
        console.log(`  [${m.recommendation_id}] ${m.title} -> ${m.category_name} (${m.slug}) - $${m.impact_amount}`);
    });
}

checkAcuteRehabRecommendations().catch(console.error);
