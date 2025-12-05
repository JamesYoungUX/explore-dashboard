import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testResetResult() {
    try {
        console.log('🧪 Testing current database state after reset...\n');

        // Get YTD period
        const periods = await sql`
            SELECT * FROM performance_periods
            WHERE period_key = 'ytd'
            LIMIT 1
        `;

        const ytdPeriod = periods[0];
        console.log(`YTD Period: ${ytdPeriod.period_label} (ID: ${ytdPeriod.id})\n`);

        // Get cost opportunities
        const opportunities = await sql`
            SELECT
                co.opportunity_type as "opportunityType",
                co.display_order as "displayOrder",
                co.amount_variance as "amountVariance",
                co.percent_variance as "percentVariance",
                cc.category_name as "categoryName",
                cc.slug as "categorySlug"
            FROM cost_opportunities co
            JOIN cost_categories cc ON co.cost_category_id = cc.id
            WHERE co.period_id = ${ytdPeriod.id}
                AND co.show_on_dashboard = true
            ORDER BY co.display_order ASC
        `;

        console.log('✅ CURRENT DATABASE STATE:\n');

        const overspending = opportunities.filter(o => o.opportunityType === 'overspending');
        console.log('Top Cost Saving Opportunities:');
        overspending.forEach((opp, i) => {
            const isCorrect =
                (i === 0 && opp.categorySlug === 'acute-rehab' && opp.percentVariance === 3.5) ||
                (i === 1 && opp.categorySlug === 'op-surgical' && opp.percentVariance === 3.2) ||
                (i === 2 && opp.categorySlug === 'ip-surgical' && opp.percentVariance === 2.8);
            const status = isCorrect ? '✅' : '❌';
            console.log(`  ${status} ${i + 1}. ${opp.categoryName} - $${opp.amountVariance} (${opp.percentVariance}%)`);
        });

        const efficient = opportunities.filter(o => o.opportunityType === 'efficient');
        console.log('\nTop Performing Categories:');
        efficient.forEach((opp, i) => {
            const isCorrect =
                (i === 0 && opp.categorySlug === 'avoidable-ed-visits' && opp.percentVariance === -5.5) ||
                (i === 1 && opp.categorySlug === 'skilled-nursing' && opp.percentVariance === -6.6) ||
                (i === 2 && opp.categorySlug === 'op-radiology' && opp.percentVariance === -3.8);
            const status = isCorrect ? '✅' : '❌';
            console.log(`  ${status} ${i + 1}. ${opp.categoryName} - $${opp.amountVariance} (${opp.percentVariance}%)`);
        });

        // Check if all are correct
        const allCorrect =
            overspending.length === 3 &&
            overspending[0].categorySlug === 'acute-rehab' && overspending[0].percentVariance === 3.5 &&
            overspending[1].categorySlug === 'op-surgical' && overspending[1].percentVariance === 3.2 &&
            overspending[2].categorySlug === 'ip-surgical' && overspending[2].percentVariance === 2.8 &&
            efficient.length === 3 &&
            efficient[0].categorySlug === 'avoidable-ed-visits' && efficient[0].percentVariance === -5.5 &&
            efficient[1].categorySlug === 'skilled-nursing' && efficient[1].percentVariance === -6.6 &&
            efficient[2].categorySlug === 'op-radiology' && efficient[2].percentVariance === -3.8;

        console.log('\n' + '='.repeat(60));
        if (allCorrect) {
            console.log('✅ DATABASE IS CORRECT - Reset button will work properly!');
        } else {
            console.log('❌ DATABASE HAS ISSUES - Reset button may not restore correct data');
        }
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testResetResult();
