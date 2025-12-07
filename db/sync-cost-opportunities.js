import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function syncCostOpportunities() {
    try {
        console.log('🔄 Syncing cost_opportunities with cost_categories...\n');

        // Update cost_opportunities to match cost_categories values
        const result = await sql`
            UPDATE cost_opportunities co
            SET 
                amount_variance = cc.spending_variance_amount,
                percent_variance = cc.spending_variance_percent
            FROM cost_categories cc
            WHERE co.cost_category_id = cc.id
        `;

        console.log(`✅ Updated ${result.length} cost_opportunities records\n`);

        // Show the updated Acute Rehab values
        const acuteRehab = await sql`
            SELECT 
                pp.period_label,
                cc.category_name,
                cc.spending_variance_amount as "categoryVariance",
                co.amount_variance as "opportunityVariance",
                cc.spending_variance_percent as "categoryPercent",
                co.percent_variance as "opportunityPercent"
            FROM cost_opportunities co
            JOIN cost_categories cc ON co.cost_category_id = cc.id
            JOIN performance_periods pp ON co.period_id = pp.id
            WHERE cc.slug = 'acute-rehab'
            ORDER BY pp.period_key
        `;

        console.log('📊 Acute Rehab values after sync:');
        acuteRehab.forEach(row => {
            console.log(`  ${row.period_label}:`);
            console.log(`    Category variance: $${row.categoryVariance.toLocaleString()} (${row.categoryPercent}%)`);
            console.log(`    Opportunity variance: $${row.opportunityVariance.toLocaleString()} (${row.opportunityPercent}%)`);
            console.log('');
        });

        console.log('✅ Sync complete!');
    } catch (error) {
        console.error('❌ Error syncing cost opportunities:', error);
        process.exit(1);
    }
}

syncCostOpportunities();
