import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addCostOpportunities() {
    try {
        console.log('💰 Adding cost opportunities...\n');

        // Get period and category IDs
        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        const acuteRehab = await sql`SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = ${ytdId}`;
        const specialtyDrugs = await sql`SELECT id FROM cost_categories WHERE slug = 'specialty-drugs' AND period_id = ${ytdId}`;
        const opSurgical = await sql`SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = ${ytdId}`;
        const primaryCare = await sql`SELECT id FROM cost_categories WHERE slug = 'primary-care' AND period_id = ${ytdId}`;
        const genericDrugs = await sql`SELECT id FROM cost_categories WHERE slug = 'generic-drugs' AND period_id = ${ytdId}`;
        const preventiveCare = await sql`SELECT id FROM cost_categories WHERE slug = 'preventive-care' AND period_id = ${ytdId}`;

        // Insert cost opportunities
        await sql`
      INSERT INTO cost_opportunities (
        period_id, cost_category_id, opportunity_type,
        amount_variance, percent_variance, aco_rank, display_order, show_on_dashboard
      ) VALUES
      (${ytdId}, ${acuteRehab[0].id}, 'overspending', 65900, 78.3, 18, 1, true),
      (${ytdId}, ${specialtyDrugs[0].id}, 'overspending', 73000, 37.4, 16, 2, true),
      (${ytdId}, ${opSurgical[0].id}, 'overspending', 33000, 21.7, 12, 3, true),
      (${ytdId}, ${primaryCare[0].id}, 'efficient', -30000, -14.3, 3, 4, true),
      (${ytdId}, ${genericDrugs[0].id}, 'efficient', -16000, -14.8, 2, 5, true),
      (${ytdId}, ${preventiveCare[0].id}, 'efficient', -7000, -13.5, 4, 6, true)
    `;

        console.log('✅ Added 6 cost opportunities (3 overspending + 3 efficient)');

        // Verify
        const count = await sql`SELECT COUNT(*) as count FROM cost_opportunities`;
        console.log(`✅ Total cost opportunities in database: ${count[0].count}`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

addCostOpportunities();
