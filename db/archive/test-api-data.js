import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testAPI() {
    try {
        console.log('🧪 Testing API data retrieval...\n');

        // Get YTD period
        const periods = await sql`
            SELECT * FROM performance_periods
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const period = periods[0];
        console.log(`Active Period: ${period.period_label} (${period.period_key})\n`);

        // Get cost opportunities exactly as the API does
        const costOpportunities = await sql`
            SELECT
                co.id,
                co.period_id as "periodId",
                co.cost_category_id as "costCategoryId",
                co.opportunity_type as "opportunityType",
                co.amount_variance as "amountVariance",
                co.percent_variance as "percentVariance",
                co.aco_rank as "acoRank",
                co.display_order as "displayOrder",
                cc.slug as "categorySlug",
                cc.category_name as "categoryName",
                cc.performance_status as "performanceStatus",
                cc.spending_pmpm_actual as "spendingPmpmActual",
                cc.spending_pmpm_benchmark as "spendingPmpmBenchmark"
            FROM cost_opportunities co
            JOIN cost_categories cc ON co.cost_category_id = cc.id
            WHERE co.period_id = ${period.id}
                AND co.show_on_dashboard = true
            ORDER BY co.display_order ASC, ABS(co.amount_variance) DESC
        `;

        console.log(`📊 Cost Opportunities (${costOpportunities.length} total):\n`);

        const overspending = costOpportunities.filter(o => o.opportunityType === 'overspending');
        console.log(`Top Cost Saving Opportunities (${overspending.length} overspending):`);
        overspending.forEach((opp, i) => {
            console.log(`  ${i + 1}. ${opp.categoryName} (${opp.categorySlug})`);
            console.log(`     Variance: $${opp.amountVariance} (${opp.percentVariance}%)`);
            console.log(`     Display Order: ${opp.displayOrder}`);
            console.log(`     Status: ${opp.performanceStatus}\n`);
        });

        const efficient = costOpportunities.filter(o => o.opportunityType === 'efficient');
        console.log(`\nTop Performing Categories (${efficient.length} efficient):`);
        efficient.forEach((opp, i) => {
            console.log(`  ${i + 1}. ${opp.categoryName} (${opp.categorySlug})`);
            console.log(`     Variance: $${opp.amountVariance} (${opp.percentVariance}%)`);
            console.log(`     Display Order: ${opp.displayOrder}`);
            console.log(`     Status: ${opp.performanceStatus}\n`);
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testAPI();
