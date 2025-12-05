import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function replaceSpecialtyDrugsWithIPSurgical() {
    try {
        console.log('🔄 Replacing Specialty Drugs with IP Surgical...\n');

        // Get YTD period
        const periods = await sql`
            SELECT * FROM performance_periods
            WHERE period_key = 'ytd'
            LIMIT 1
        `;

        const ytdPeriod = periods[0];
        console.log(`YTD Period ID: ${ytdPeriod.id}\n`);

        // Get Specialty Drugs category
        const specialtyDrugs = await sql`
            SELECT * FROM cost_categories
            WHERE slug = 'specialty-drugs' AND period_id = ${ytdPeriod.id}
            LIMIT 1
        `;

        if (specialtyDrugs.length === 0) {
            console.log('✓ Specialty Drugs not found, checking if IP Surgical already exists...\n');

            const ipSurgical = await sql`
                SELECT * FROM cost_categories
                WHERE slug = 'ip-surgical' AND period_id = ${ytdPeriod.id}
                LIMIT 1
            `;

            if (ipSurgical.length > 0) {
                console.log('✅ IP Surgical already exists! Nothing to do.\n');
                process.exit(0);
            } else {
                console.log('⚠️  Neither Specialty Drugs nor IP Surgical found. Creating IP Surgical...\n');
                // Create IP Surgical from scratch
                const newCategory = await sql`
                    INSERT INTO cost_categories (
                        slug, category_name, period_id,
                        spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent,
                        utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
                        performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
                    )
                    VALUES (
                        'ip-surgical', 'IP Surgical', ${ytdPeriod.id},
                        220.00, 214.00, 6.00, 2.8,
                        15.2, 14.5, 4.8, 'admits_per_k',
                        'red', true, false, 7, 20, '2.8% above benchmark', 3
                    )
                    RETURNING id
                `;

                // Create cost opportunity
                await sql`
                    INSERT INTO cost_opportunities (
                        period_id, cost_category_id, opportunity_type,
                        amount_variance, percent_variance, aco_rank, display_order, show_on_dashboard
                    )
                    VALUES (
                        ${ytdPeriod.id}, ${newCategory[0].id}, 'overspending',
                        25000, 2.8, 7, 3, true
                    )
                `;

                console.log('✅ IP Surgical created!\n');
                process.exit(0);
            }
        }

        const specialtyDrugsId = specialtyDrugs[0].id;
        console.log(`Found Specialty Drugs (ID: ${specialtyDrugsId})\n`);

        // Update the category to IP Surgical
        console.log('Updating category from Specialty Drugs to IP Surgical...\n');
        await sql`
            UPDATE cost_categories
            SET 
                slug = 'ip-surgical',
                category_name = 'IP Surgical',
                spending_pmpm_actual = 220.00,
                spending_pmpm_benchmark = 214.00,
                spending_variance_amount = 6.00,
                spending_variance_percent = 2.8,
                utilization_actual = 15.2,
                utilization_benchmark = 14.5,
                utilization_variance_percent = 4.8,
                utilization_unit = 'admits_per_k',
                performance_status = 'red',
                is_opportunity = true,
                is_strength = false,
                aco_rank = 7,
                total_categories = 20,
                description = '2.8% above benchmark',
                display_order = 3
            WHERE id = ${specialtyDrugsId}
        `;

        // Update cost opportunity
        console.log('Updating cost opportunity...\n');
        await sql`
            UPDATE cost_opportunities
            SET 
                amount_variance = 25000,
                percent_variance = 2.8,
                aco_rank = 7,
                display_order = 3
            WHERE cost_category_id = ${specialtyDrugsId}
                AND period_id = ${ytdPeriod.id}
                AND opportunity_type = 'overspending'
        `;

        console.log('✅ Successfully replaced Specialty Drugs with IP Surgical!\n');

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

        console.log('Top Cost Saving Opportunities (updated):');
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

replaceSpecialtyDrugsWithIPSurgical();
