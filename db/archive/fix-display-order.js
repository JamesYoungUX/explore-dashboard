import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixDisplayOrder() {
    try {
        console.log('🔄 Fixing display order for cost opportunities...\n');

        // Get YTD period
        const periods = await sql`
            SELECT * FROM performance_periods
            WHERE period_key = 'ytd'
            LIMIT 1
        `;

        const ytdPeriod = periods[0];

        // Get the categories
        const acuteRehab = await sql`
            SELECT id FROM cost_categories
            WHERE slug = 'acute-rehab' AND period_id = ${ytdPeriod.id}
            LIMIT 1
        `;

        const opSurgical = await sql`
            SELECT id FROM cost_categories
            WHERE slug = 'op-surgical' AND period_id = ${ytdPeriod.id}
            LIMIT 1
        `;

        const ipSurgical = await sql`
            SELECT id FROM cost_categories
            WHERE slug = 'ip-surgical' AND period_id = ${ytdPeriod.id}
            LIMIT 1
        `;

        // Update display orders
        if (acuteRehab.length > 0) {
            await sql`
                UPDATE cost_opportunities
                SET display_order = 1
                WHERE cost_category_id = ${acuteRehab[0].id}
                    AND period_id = ${ytdPeriod.id}
                    AND opportunity_type = 'overspending'
            `;
            console.log('✓ Set Acute Rehab to display order 1');
        }

        if (opSurgical.length > 0) {
            await sql`
                UPDATE cost_opportunities
                SET display_order = 2
                WHERE cost_category_id = ${opSurgical[0].id}
                    AND period_id = ${ytdPeriod.id}
                    AND opportunity_type = 'overspending'
            `;
            console.log('✓ Set OP Surgical to display order 2');
        }

        if (ipSurgical.length > 0) {
            await sql`
                UPDATE cost_opportunities
                SET display_order = 3
                WHERE cost_category_id = ${ipSurgical[0].id}
                    AND period_id = ${ytdPeriod.id}
                    AND opportunity_type = 'overspending'
            `;
            console.log('✓ Set IP Surgical to display order 3');
        }

        console.log('\n✅ Display orders updated!\n');

        // Verify
        const updated = await sql`
            SELECT
                co.display_order as "displayOrder",
                co.amount_variance as "amountVariance",
                co.percent_variance as "percentVariance",
                cc.category_name as "categoryName",
                cc.slug as "categorySlug"
            FROM cost_opportunities co
            JOIN cost_categories cc ON co.cost_category_id = cc.id
            WHERE co.period_id = ${ytdPeriod.id}
                AND co.opportunity_type = 'overspending'
                AND co.show_on_dashboard = true
            ORDER BY co.display_order ASC
        `;

        console.log('Top Cost Saving Opportunities (final):');
        updated.forEach((opp, i) => {
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

fixDisplayOrder();
