import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkAllCategories() {
    try {
        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        console.log('📊 ALL Cost Categories:');
        const categories = await sql`
      SELECT 
        category_name,
        spending_pmpm_actual,
        spending_pmpm_benchmark,
        performance_status,
        (spending_pmpm_actual - spending_pmpm_benchmark) as variance_amount,
        ROUND(((spending_pmpm_actual - spending_pmpm_benchmark) / spending_pmpm_benchmark * 100)::numeric, 2) as variance_percent
      FROM cost_categories
      WHERE period_id = ${ytdId}
      ORDER BY category_name
    `;

        let aboveBenchmarkTotal = 0;
        let belowBenchmarkTotal = 0;

        categories.forEach(c => {
            const variance = parseFloat(c.variance_amount);
            const isAbove = variance > 0;

            console.log(`\n  ${c.category_name}:`);
            console.log(`    Actual: $${c.spending_pmpm_actual}`);
            console.log(`    Benchmark: $${c.spending_pmpm_benchmark}`);
            console.log(`    Variance: $${variance.toFixed(2)} (${c.variance_percent}%)`);
            console.log(`    Status: ${c.performance_status} ${isAbove ? '⚠️ ABOVE' : '✅ BELOW'}`);

            if (isAbove) {
                aboveBenchmarkTotal += variance;
            } else {
                belowBenchmarkTotal += Math.abs(variance);
            }
        });

        console.log(`\n\n💰 TOTALS:`);
        console.log(`  Above Benchmark (Overspending): $${aboveBenchmarkTotal.toLocaleString()}`);
        console.log(`  Below Benchmark (Efficient): $${belowBenchmarkTotal.toLocaleString()}`);

        console.log('\n📋 Cost Opportunities in DB:');
        const opportunities = await sql`
      SELECT 
        cc.category_name,
        co.amount_variance,
        co.opportunity_type,
        co.show_on_dashboard
      FROM cost_opportunities co
      JOIN cost_categories cc ON co.cost_category_id = cc.id
      WHERE co.period_id = ${ytdId}
      ORDER BY co.opportunity_type, cc.category_name
    `;

        opportunities.forEach(o => {
            console.log(`  ${o.category_name}: $${o.amount_variance} (${o.opportunity_type}) - Dashboard: ${o.show_on_dashboard}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkAllCategories();
