import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixAllCostOpportunities() {
    try {
        console.log('🔄 Fixing all cost opportunities to match seed data...\n');

        // Get YTD period
        const periods = await sql`
            SELECT * FROM performance_periods
            WHERE period_key = 'ytd'
            LIMIT 1
        `;

        const ytdPeriod = periods[0];
        console.log(`YTD Period ID: ${ytdPeriod.id}\n`);

        // First, delete all existing cost opportunities for YTD
        console.log('Deleting existing cost opportunities for YTD...');
        await sql`
            DELETE FROM cost_opportunities
            WHERE period_id = ${ytdPeriod.id}
        `;
        console.log('✓ Deleted existing opportunities\n');

        // Get category IDs
        const categories = await sql`
            SELECT id, slug, category_name
            FROM cost_categories
            WHERE period_id = ${ytdPeriod.id}
        `;

        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.slug] = cat.id;
        });

        console.log('Available categories:');
        categories.forEach(cat => {
            console.log(`  - ${cat.category_name} (${cat.slug}) [ID: ${cat.id}]`);
        });
        console.log('');

        // Check if we need to create missing categories
        const requiredCategories = [
            { slug: 'acute-rehab', name: 'Acute Rehab', data: { spending_pmpm_actual: 150.00, spending_pmpm_benchmark: 145.00, spending_variance_amount: 5.00, spending_variance_percent: 3.5, utilization_actual: 9.8, utilization_benchmark: 9.0, utilization_variance_percent: 8.9, utilization_unit: 'admits_per_k', performance_status: 'red', is_opportunity: true, is_strength: false, aco_rank: 20, total_categories: 20, description: '3.5% above benchmark', display_order: 1 } },
            { slug: 'op-surgical', name: 'OP Surgical', data: { spending_pmpm_actual: 185.00, spending_pmpm_benchmark: 179.10, spending_variance_amount: 5.90, spending_variance_percent: 3.2, utilization_actual: 22.5, utilization_benchmark: 19.8, utilization_variance_percent: 13.6, utilization_unit: 'procedures_per_k', performance_status: 'red', is_opportunity: true, is_strength: false, aco_rank: 12, total_categories: 20, description: '3.2% above benchmark', display_order: 2 } },
            { slug: 'ip-surgical', name: 'IP Surgical', data: { spending_pmpm_actual: 220.00, spending_pmpm_benchmark: 214.00, spending_variance_amount: 6.00, spending_variance_percent: 2.8, utilization_actual: 15.2, utilization_benchmark: 14.5, utilization_variance_percent: 4.8, utilization_unit: 'admits_per_k', performance_status: 'red', is_opportunity: true, is_strength: false, aco_rank: 7, total_categories: 20, description: '2.8% above benchmark', display_order: 3 } },
            { slug: 'avoidable-ed-visits', name: 'Avoidable ED visits', data: { spending_pmpm_actual: 85.00, spending_pmpm_benchmark: 90.00, spending_variance_amount: -5.00, spending_variance_percent: -5.5, utilization_actual: 180, utilization_benchmark: 195, utilization_variance_percent: -7.7, utilization_unit: 'visits_per_k', performance_status: 'green', is_opportunity: false, is_strength: true, aco_rank: 1, total_categories: 20, description: '5.5% below benchmark', display_order: 4 } },
            { slug: 'skilled-nursing', name: 'Skilled Nursing', data: { spending_pmpm_actual: 120.00, spending_pmpm_benchmark: 128.50, spending_variance_amount: -8.50, spending_variance_percent: -6.6, utilization_actual: 45, utilization_benchmark: 52, utilization_variance_percent: -13.5, utilization_unit: 'admits_per_k', performance_status: 'green', is_opportunity: false, is_strength: true, aco_rank: 3, total_categories: 20, description: '6.6% below benchmark', display_order: 5 } },
            { slug: 'op-radiology', name: 'OP Radiology', data: { spending_pmpm_actual: 75.00, spending_pmpm_benchmark: 78.00, spending_variance_amount: -3.00, spending_variance_percent: -3.8, utilization_actual: 125, utilization_benchmark: 135, utilization_variance_percent: -7.4, utilization_unit: 'studies_per_k', performance_status: 'green', is_opportunity: false, is_strength: true, aco_rank: 5, total_categories: 20, description: '3.8% below benchmark', display_order: 6 } }
        ];

        // Create missing categories
        for (const reqCat of requiredCategories) {
            if (!categoryMap[reqCat.slug]) {
                console.log(`Creating missing category: ${reqCat.name}...`);
                const newCat = await sql`
                    INSERT INTO cost_categories (
                        slug, category_name, period_id,
                        spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent,
                        utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
                        performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
                    )
                    VALUES (
                        ${reqCat.slug}, ${reqCat.name}, ${ytdPeriod.id},
                        ${reqCat.data.spending_pmpm_actual}, ${reqCat.data.spending_pmpm_benchmark}, 
                        ${reqCat.data.spending_variance_amount}, ${reqCat.data.spending_variance_percent},
                        ${reqCat.data.utilization_actual}, ${reqCat.data.utilization_benchmark}, 
                        ${reqCat.data.utilization_variance_percent}, ${reqCat.data.utilization_unit},
                        ${reqCat.data.performance_status}, ${reqCat.data.is_opportunity}, ${reqCat.data.is_strength}, 
                        ${reqCat.data.aco_rank}, ${reqCat.data.total_categories}, ${reqCat.data.description}, ${reqCat.data.display_order}
                    )
                    RETURNING id
                `;
                categoryMap[reqCat.slug] = newCat[0].id;
                console.log(`✓ Created ${reqCat.name} (ID: ${newCat[0].id})`);
            } else {
                // Update existing category to ensure correct data
                console.log(`Updating existing category: ${reqCat.name}...`);
                await sql`
                    UPDATE cost_categories
                    SET 
                        spending_pmpm_actual = ${reqCat.data.spending_pmpm_actual},
                        spending_pmpm_benchmark = ${reqCat.data.spending_pmpm_benchmark},
                        spending_variance_amount = ${reqCat.data.spending_variance_amount},
                        spending_variance_percent = ${reqCat.data.spending_variance_percent},
                        utilization_actual = ${reqCat.data.utilization_actual},
                        utilization_benchmark = ${reqCat.data.utilization_benchmark},
                        utilization_variance_percent = ${reqCat.data.utilization_variance_percent},
                        utilization_unit = ${reqCat.data.utilization_unit},
                        performance_status = ${reqCat.data.performance_status},
                        is_opportunity = ${reqCat.data.is_opportunity},
                        is_strength = ${reqCat.data.is_strength},
                        aco_rank = ${reqCat.data.aco_rank},
                        total_categories = ${reqCat.data.total_categories},
                        description = ${reqCat.data.description},
                        display_order = ${reqCat.data.display_order}
                    WHERE id = ${categoryMap[reqCat.slug]}
                `;
                console.log(`✓ Updated ${reqCat.name}`);
            }
        }

        console.log('\nCreating cost opportunities...\n');

        // Create cost opportunities
        const opportunities = [
            { slug: 'acute-rehab', type: 'overspending', amount: 65900, percent: 3.5, rank: 20, order: 1 },
            { slug: 'op-surgical', type: 'overspending', amount: 33000, percent: 3.2, rank: 12, order: 2 },
            { slug: 'ip-surgical', type: 'overspending', amount: 25000, percent: 2.8, rank: 7, order: 3 },
            { slug: 'avoidable-ed-visits', type: 'efficient', amount: -18000, percent: -5.5, rank: 1, order: 4 },
            { slug: 'skilled-nursing', type: 'efficient', amount: -12000, percent: -6.6, rank: 3, order: 5 },
            { slug: 'op-radiology', type: 'efficient', amount: -8000, percent: -3.8, rank: 5, order: 6 }
        ];

        for (const opp of opportunities) {
            await sql`
                INSERT INTO cost_opportunities (
                    period_id, cost_category_id, opportunity_type,
                    amount_variance, percent_variance, aco_rank, display_order, show_on_dashboard
                )
                VALUES (
                    ${ytdPeriod.id}, ${categoryMap[opp.slug]}, ${opp.type},
                    ${opp.amount}, ${opp.percent}, ${opp.rank}, ${opp.order}, true
                )
            `;
            console.log(`✓ Created ${opp.type} opportunity for ${opp.slug}`);
        }

        console.log('\n✅ All cost opportunities fixed!\n');

        // Verify
        const updated = await sql`
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

        console.log('Final Cost Opportunities:\n');

        const overspending = updated.filter(o => o.opportunityType === 'overspending');
        console.log('Top Cost Saving Opportunities:');
        overspending.forEach((opp, i) => {
            console.log(`  ${i + 1}. ${opp.categoryName} (${opp.categorySlug})`);
            console.log(`     Variance: $${opp.amountVariance} (${opp.percentVariance}%)\n`);
        });

        const efficient = updated.filter(o => o.opportunityType === 'efficient');
        console.log('Top Performing Categories:');
        efficient.forEach((opp, i) => {
            console.log(`  ${i + 1}. ${opp.categoryName} (${opp.categorySlug})`);
            console.log(`     Variance: $${opp.amountVariance} (${opp.percentVariance}%)\n`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixAllCostOpportunities();
