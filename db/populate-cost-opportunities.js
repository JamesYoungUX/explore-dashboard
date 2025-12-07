import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function populateCostOpportunities() {
    try {
        console.log('🔄 Populating cost_opportunities from cost_categories...\n');

        // Clear existing cost_opportunities
        await sql`TRUNCATE TABLE cost_opportunities RESTART IDENTITY CASCADE`;
        console.log('✅ Cleared existing cost_opportunities\n');

        // Get all cost categories
        const categories = await sql`
            SELECT 
                cc.id,
                cc.period_id,
                cc.slug,
                cc.category_name,
                cc.spending_variance_amount,
                cc.spending_variance_percent,
                cc.performance_status,
                cc.aco_rank,
                cc.display_order,
                pp.period_key
            FROM cost_categories cc
            JOIN performance_periods pp ON cc.period_id = pp.id
            WHERE cc.is_opportunity = true OR cc.is_strength = true
            ORDER BY pp.period_key, cc.display_order
        `;

        console.log(`Found ${categories.length} categories to create opportunities for\n`);

        let inserted = 0;
        for (const cat of categories) {
            const opportunityType = cat.spending_variance_amount > 0 ? 'overspending' : 'efficient';

            await sql`
                INSERT INTO cost_opportunities (
                    period_id, cost_category_id, opportunity_type,
                    amount_variance, percent_variance, aco_rank,
                    display_order, show_on_dashboard
                ) VALUES (
                    ${cat.period_id},
                    ${cat.id},
                    ${opportunityType},
                    ${cat.spending_variance_amount},
                    ${cat.spending_variance_percent},
                    ${cat.aco_rank},
                    ${cat.display_order},
                    true
                )
            `;

            inserted++;
            console.log(`✅ ${cat.period_key} - ${cat.category_name}: $${cat.spending_variance_amount.toLocaleString()} (${cat.spending_variance_percent}%)`);
        }

        console.log(`\n✅ Successfully inserted ${inserted} cost_opportunities!`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

populateCostOpportunities();
