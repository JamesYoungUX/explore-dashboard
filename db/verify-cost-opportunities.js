import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function verifyCostOpportunities() {
    try {
        console.log('🔍 Verifying cost_opportunities data across all periods...\n');

        const results = await sql`
            SELECT 
                pp.period_label,
                cc.category_name,
                cc.spending_variance_amount as "categoryVariance",
                cc.spending_variance_percent as "categoryPercent",
                co.amount_variance as "opportunityVariance",
                co.percent_variance as "opportunityPercent",
                CASE 
                    WHEN cc.spending_variance_amount = co.amount_variance THEN '✅'
                    ELSE '❌'
                END as "match"
            FROM cost_opportunities co
            JOIN cost_categories cc ON co.cost_category_id = cc.id
            JOIN performance_periods pp ON co.period_id = pp.id
            WHERE cc.slug IN ('acute-rehab', 'op-surgical', 'ip-surgical')
            ORDER BY pp.period_key, cc.display_order
        `;

        console.log('📊 Comparison Results:\n');

        let currentPeriod = '';
        results.forEach(row => {
            if (row.period_label !== currentPeriod) {
                currentPeriod = row.period_label;
                console.log(`\n${currentPeriod}:`);
                console.log('─'.repeat(80));
            }
            console.log(`${row.match} ${row.category_name}:`);
            console.log(`   Category:    $${row.categoryVariance.toLocaleString()} (${row.categoryPercent}%)`);
            console.log(`   Opportunity: $${row.opportunityVariance.toLocaleString()} (${row.opportunityPercent}%)`);
        });

        const mismatches = results.filter(r => r.match === '❌');
        if (mismatches.length > 0) {
            console.log(`\n\n⚠️  Found ${mismatches.length} mismatches!`);
        } else {
            console.log('\n\n✅ All values match perfectly!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyCostOpportunities();
