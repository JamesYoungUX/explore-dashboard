import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkCostOpportunities() {
    try {
        console.log('🔍 Checking cost opportunities...\n');

        // Get cost opportunities with category details
        const opportunities = await sql`
            SELECT
                co.id,
                co.opportunity_type as "opportunityType",
                co.amount_variance as "amountVariance",
                co.percent_variance as "percentVariance",
                co.display_order as "displayOrder",
                co.show_on_dashboard as "showOnDashboard",
                cc.category_name as "categoryName",
                cc.slug as "categorySlug"
            FROM cost_opportunities co
            JOIN cost_categories cc ON co.cost_category_id = cc.id
            ORDER BY co.display_order ASC, ABS(co.amount_variance) DESC
        `;

        console.log(`📊 Total Cost Opportunities: ${opportunities.length}\n`);

        console.log('Top Cost Saving Opportunities (overspending):');
        const overspending = opportunities.filter(o => o.opportunityType === 'overspending' && o.showOnDashboard);
        overspending.forEach((opp, i) => {
            console.log(`  ${i + 1}. ${opp.categoryName} (${opp.categorySlug})`);
            console.log(`     Variance: $${opp.amountVariance} (${opp.percentVariance}%)`);
            console.log(`     Display Order: ${opp.displayOrder}, Show: ${opp.showOnDashboard}\n`);
        });

        console.log('\nEfficient Areas (underspending):');
        const underspending = opportunities.filter(o => o.opportunityType === 'underspending' && o.showOnDashboard);
        underspending.forEach((opp, i) => {
            console.log(`  ${i + 1}. ${opp.categoryName} (${opp.categorySlug})`);
            console.log(`     Variance: $${opp.amountVariance} (${opp.percentVariance}%)`);
            console.log(`     Display Order: ${opp.displayOrder}, Show: ${opp.showOnDashboard}\n`);
        });

    } catch (error) {
        console.error('❌ Check failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkCostOpportunities();
