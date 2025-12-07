import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function linkCareMgmtToAcuteRehab() {
    console.log('Linking care management program to acute-rehab...\n');

    // Get the care management recommendation
    const careMgmt = await sql`
    SELECT id, title FROM recommendations 
    WHERE title LIKE '%care management program%'
    LIMIT 1
  `;

    if (careMgmt.length === 0) {
        console.log('ERROR: Care management recommendation not found');
        return;
    }

    console.log(`Found recommendation: [${careMgmt[0].id}] ${careMgmt[0].title}`);

    // Get acute-rehab category
    const acuteRehab = await sql`
    SELECT id, category_name FROM cost_categories
    WHERE slug = 'acute-rehab'
    AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
    LIMIT 1
  `;

    if (acuteRehab.length === 0) {
        console.log('ERROR: Acute rehab category not found');
        return;
    }

    console.log(`Found category: [${acuteRehab[0].id}] ${acuteRehab[0].category_name}\n`);

    // Check if linkage already exists
    const existing = await sql`
    SELECT * FROM recommendation_cost_categories
    WHERE recommendation_id = ${careMgmt[0].id}
    AND cost_category_id = ${acuteRehab[0].id}
  `;

    if (existing.length > 0) {
        console.log('✓ Linkage already exists');
        return;
    }

    // Create the linkage
    await sql`
    INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount)
    VALUES (${careMgmt[0].id}, ${acuteRehab[0].id}, 10000)
  `;

    console.log('✅ Successfully linked care management to acute-rehab with $10,000 impact!');

    // Verify
    const allRecs = await sql`
    SELECT 
      r.id,
      r.title,
      rcc.impact_amount
    FROM recommendations r
    JOIN recommendation_cost_categories rcc ON r.id = rcc.recommendation_id
    WHERE rcc.cost_category_id = ${acuteRehab[0].id}
    ORDER BY 
      CASE r.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END,
      r.estimated_savings DESC
  `;

    console.log('\nAll recommendations for Acute Rehab:');
    allRecs.forEach(rec => {
        console.log(`  [${rec.id}] ${rec.title} - Impact: $${rec.impact_amount}`);
    });
}

linkCareMgmtToAcuteRehab().catch(console.error);
