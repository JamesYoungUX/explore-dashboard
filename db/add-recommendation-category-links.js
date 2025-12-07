import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addRecommendationCategoryLinks() {
    try {
        console.log('🔄 Adding recommendation-category links...\n');

        // Clear any existing links first
        await sql`DELETE FROM recommendation_cost_categories`;
        console.log('✅ Cleared existing links\n');

        // Recommendation 1: Care Management Program
        // Should impact: Avoidable ED visits, Inpatient Medical, Skilled Nursing
        console.log('Adding links for: Implement a care management program');

        await sql`
      INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount)
      VALUES 
        (1, 8, 150000),  -- Avoidable ED visits
        (1, 4, 120000),  -- Inpatient Medical
        (1, 9, 80000)    -- Skilled Nursing
    `;
        console.log('  ✅ Linked to Avoidable ED visits, Inpatient Medical, Skilled Nursing\n');

        // Recommendation 2: GUIDE Program for Dementia
        // Should impact: Skilled Nursing, Avoidable ED visits, Primary Care
        console.log('Adding links for: Refer patients with dementia to GUIDE program');

        await sql`
      INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount)
      VALUES 
        (2, 9, 40000),   -- Skilled Nursing
        (2, 8, 20000),   -- Avoidable ED visits
        (2, 12, 13000)   -- Primary Care
    `;
        console.log('  ✅ Linked to Skilled Nursing, Avoidable ED visits, Primary Care\n');

        // Verify
        console.log('📋 Verifying links...\n');
        const links = await sql`
      SELECT 
        r.title as recommendation,
        cc.category_name as category,
        rcc.impact_amount
      FROM recommendation_cost_categories rcc
      JOIN recommendations r ON rcc.recommendation_id = r.id
      JOIN cost_categories cc ON rcc.cost_category_id = cc.id
      ORDER BY r.id, rcc.impact_amount DESC
    `;

        let currentRec = '';
        links.forEach(link => {
            if (link.recommendation !== currentRec) {
                currentRec = link.recommendation;
                console.log(`\n${currentRec}:`);
            }
            console.log(`  - ${link.category} ($${link.impact_amount.toLocaleString()})`);
        });

        console.log('\n\n✅ All recommendation-category links added successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addRecommendationCategoryLinks();
