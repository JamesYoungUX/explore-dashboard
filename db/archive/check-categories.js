import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkCategories() {
    try {
        console.log('🔍 Checking all categories and opportunities for YTD period...\n');

        // Get YTD period
        const periods = await sql`
            SELECT * FROM performance_periods
            WHERE period_key = 'ytd'
            LIMIT 1
        `;

        const period = periods[0];
        console.log(`YTD Period ID: ${period.id}\n`);

        // Get all categories for YTD
        const categories = await sql`
            SELECT id, slug, category_name
            FROM cost_categories
            WHERE period_id = ${period.id}
            ORDER BY slug
        `;

        console.log(`Categories for YTD (${categories.length} total):`);
        categories.forEach(cat => {
            console.log(`  - ${cat.category_name} (${cat.slug}) [ID: ${cat.id}]`);
        });

        // Check if IP Surgical exists
        const ipSurgical = categories.find(c => c.slug === 'ip-surgical');
        console.log(`\n✓ IP Surgical exists: ${ipSurgical ? 'YES (ID: ' + ipSurgical.id + ')' : 'NO'}`);

        // Check all cost opportunities
        console.log('\n📊 All Cost Opportunities for YTD:\n');
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
            WHERE co.period_id = ${period.id}
            ORDER BY co.opportunity_type, co.display_order
        `;

        opportunities.forEach(opp => {
            console.log(`${opp.opportunityType.toUpperCase()}: ${opp.categoryName} (${opp.categorySlug})`);
            console.log(`  Variance: $${opp.amountVariance} (${opp.percentVariance}%)`);
            console.log(`  Display Order: ${opp.displayOrder}, Show: ${opp.showOnDashboard}\n`);
        });

    } catch (error) {
        console.error('❌ Check failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkCategories();
