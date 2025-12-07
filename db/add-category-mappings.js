import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addCategoryMappings() {
    try {
        console.log('🔄 Adding category mappings...\n');

        // Care management → IP Medical, ED, Acute Rehab
        const ytdPeriod = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytdPeriod[0].id;

        const ipMedical = await sql`SELECT id FROM cost_categories WHERE slug = 'inpatient-medical' AND period_id = ${ytdId}`;
        const edVisits = await sql`SELECT id FROM cost_categories WHERE slug = 'ed-visits' AND period_id = ${ytdId}`;
        const acuteRehab = await sql`SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = ${ytdId}`;

        // Care management (ID 1)
        await sql`INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES (1, ${ipMedical[0].id}, 20000)`;
        await sql`INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES (1, ${edVisits[0].id}, 15000)`;
        await sql`INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES (1, ${acuteRehab[0].id}, 10000)`;
        console.log('✅ Added categories for care management');

        // GUIDE (ID 2)
        await sql`INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES (2, ${ipMedical[0].id}, 73000)`;
        console.log('✅ Added categories for GUIDE');

        // Discharge planning (ID 3)
        await sql`INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES (3, ${acuteRehab[0].id}, 65900)`;
        await sql`INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES (3, ${ipMedical[0].id}, 25000)`;
        await sql`INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES (3, ${edVisits[0].id}, 18000)`;
        console.log('✅ Added categories for discharge planning');

        // Urgent care (ID 4)
        await sql`INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES (4, ${edVisits[0].id}, 24000)`;
        console.log('✅ Added categories for urgent care');

        console.log('\n✅ All category mappings added!');
        console.log('Database fully reset to seed state!');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

addCategoryMappings();
