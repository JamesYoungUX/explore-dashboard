import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixCostOpportunities() {
    try {
        console.log('🔍 Investigating cost opportunities and categories...\n');

        // Get the active period
        const periods = await sql`
            SELECT * FROM performance_periods
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT 1
        `;

        if (periods.length === 0) {
            console.error('❌ No active period found!');
            process.exit(1);
        }

        const period = periods[0];
        console.log(`Active period: ${period.period_label} (ID: ${period.id})\n`);

        // Get categories for this period
        const categories = await sql`
            SELECT id, category_name, slug
            FROM cost_categories
            WHERE period_id = ${period.id}
            ORDER BY category_name
        `;

        console.log(`Categories for period ${period.id}:`);
        categories.forEach(cat => {
            console.log(`  - ${cat.category_name} (${cat.slug}) [ID: ${cat.id}]`);
        });

        // Check if we need to create IP Surgical category
        const ipSurgical = categories.find(c => c.slug === 'ip-surgical');

        if (!ipSurgical) {
            console.log('\n⚠️  IP Surgical category does not exist. Creating it...\n');

            // Create IP Surgical category
            const newCategory = await sql`
                INSERT INTO cost_categories (
                    period_id,
                    slug,
                    category_name,
                    performance_status,
                    spending_pmpm_actual,
                    spending_pmpm_benchmark
                )
                VALUES (
                    ${period.id},
                    'ip-surgical',
                    'IP Surgical',
                    'red',
                    145.50,
                    95.00
                )
                RETURNING id, category_name, slug
            `;

            console.log(`✅ Created category: ${newCategory[0].category_name} (ID: ${newCategory[0].id})\n`);

            // Create cost opportunity for IP Surgical
            await sql`
                INSERT INTO cost_opportunities (
                    period_id,
                    cost_category_id,
                    opportunity_type,
                    amount_variance,
                    percent_variance,
                    aco_rank,
                    display_order,
                    show_on_dashboard
                )
                VALUES (
                    ${period.id},
                    ${newCategory[0].id},
                    'overspending',
                    50500,
                    53.2,
                    42,
                    3,
                    true
                )
            `;

            console.log('✅ Created cost opportunity for IP Surgical\n');
        }

        // Now update display orders
        console.log('Updating display orders...\n');

        // Get fresh category list
        const updatedCategories = await sql`
            SELECT id, category_name, slug
            FROM cost_categories
            WHERE period_id = ${period.id}
        `;

        const acuteRehab = updatedCategories.find(c => c.slug === 'acute-rehab');
        const opSurgical = updatedCategories.find(c => c.slug === 'op-surgical');
        const ipSurgicalUpdated = updatedCategories.find(c => c.slug === 'ip-surgical');
        const specialtyDrugs = updatedCategories.find(c => c.slug === 'specialty-drugs');

        // Set display orders
        if (acuteRehab) {
            await sql`
                UPDATE cost_opportunities
                SET display_order = 1
                WHERE cost_category_id = ${acuteRehab.id}
                    AND period_id = ${period.id}
                    AND opportunity_type = 'overspending'
            `;
        }

        if (opSurgical) {
            await sql`
                UPDATE cost_opportunities
                SET display_order = 2
                WHERE cost_category_id = ${opSurgical.id}
                    AND period_id = ${period.id}
                    AND opportunity_type = 'overspending'
            `;
        }

        if (ipSurgicalUpdated) {
            await sql`
                UPDATE cost_opportunities
                SET display_order = 3
                WHERE cost_category_id = ${ipSurgicalUpdated.id}
                    AND period_id = ${period.id}
                    AND opportunity_type = 'overspending'
            `;
        }

        if (specialtyDrugs) {
            await sql`
                UPDATE cost_opportunities
                SET display_order = 4
                WHERE cost_category_id = ${specialtyDrugs.id}
                    AND period_id = ${period.id}
                    AND opportunity_type = 'overspending'
            `;
        }

        console.log('✅ Display orders updated!\n');

        // Verify the final result
        const finalResult = await sql`
            SELECT
                co.display_order as "displayOrder",
                co.amount_variance as "amountVariance",
                co.percent_variance as "percentVariance",
                cc.category_name as "categoryName",
                cc.slug as "categorySlug"
            FROM cost_opportunities co
            JOIN cost_categories cc ON co.cost_category_id = cc.id
            WHERE co.period_id = ${period.id}
                AND co.opportunity_type = 'overspending'
                AND co.show_on_dashboard = true
            ORDER BY co.display_order ASC
        `;

        console.log('Final Top Cost Saving Opportunities:');
        finalResult.forEach((opp, i) => {
            console.log(`  ${i + 1}. ${opp.categoryName} (${opp.categorySlug})`);
            console.log(`     Variance: $${opp.amountVariance} (${opp.percentVariance}%)`);
            console.log(`     Display Order: ${opp.displayOrder}\n`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixCostOpportunities();
