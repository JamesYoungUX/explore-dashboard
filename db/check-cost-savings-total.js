import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkCostSavingsTotal() {
    try {
        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        console.log('📊 Cost Opportunities (above benchmark):');
        const opportunities = await sql`
      SELECT 
        cc.category_name,
        co.amount_variance,
        co.percent_variance,
        co.opportunity_type
      FROM cost_opportunities co
      JOIN cost_categories cc ON co.cost_category_id = cc.id
      WHERE co.period_id = ${ytdId}
        AND co.opportunity_type = 'overspending'
        AND co.show_on_dashboard = true
      ORDER BY co.display_order ASC
    `;

        let total = 0;
        opportunities.forEach(o => {
            console.log(`  ${o.category_name}: $${o.amount_variance.toLocaleString()} (${o.percent_variance}%)`);
            total += parseFloat(o.amount_variance);
        });

        console.log(`\n💰 Total Cost Savings Opportunity: $${total.toLocaleString()}`);

        console.log('\n📈 Current Performance Metrics:');
        const metrics = await sql`
      SELECT metric_type, current_value, display_format
      FROM performance_metrics
      WHERE period_id = ${ytdId}
        AND metric_type = 'cost_savings'
    `;

        if (metrics.length > 0) {
            console.log(`  Cost Savings metric: $${metrics[0].current_value}`);
            console.log(`\n❌ MISMATCH! Should be $${total.toLocaleString()}`);
        } else {
            console.log('  No cost_savings metric found');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCostSavingsTotal();
