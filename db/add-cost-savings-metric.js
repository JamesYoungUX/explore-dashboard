import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addCostSavingsMetric() {
    try {
        console.log('💰 Adding Cost Savings Opportunity metric...\n');

        // Get period IDs
        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const last12 = await sql`SELECT id FROM performance_periods WHERE period_key = 'last_12_months'`;
        const lastQ = await sql`SELECT id FROM performance_periods WHERE period_key = 'last_quarter'`;

        const ytdId = ytd[0].id;
        const last12Id = last12[0].id;
        const lastQId = lastQ[0].id;

        // Add the cost_savings_opportunity metric for each period
        await sql`
      INSERT INTO performance_metrics (
        period_id, metric_type, current_value, previous_value, 
        change_percent, change_direction, benchmark_value, 
        is_above_benchmark, display_format
      ) VALUES
      (${ytdId}, 'cost_savings_opportunity', 750000, 765000, -2.1, 'down', 500000, true, 'currency'),
      (${last12Id}, 'cost_savings_opportunity', 765000, 800000, -4.4, 'down', 500000, true, 'currency'),
      (${lastQId}, 'cost_savings_opportunity', 190000, 200000, -5.0, 'down', 125000, true, 'currency')
    `;

        console.log('✅ Added Cost Savings Opportunity metric to all 3 periods');

        // Verify
        const count = await sql`SELECT COUNT(*) as count FROM performance_metrics WHERE metric_type = 'cost_savings_opportunity'`;
        console.log(`✅ Total cost_savings_opportunity metrics: ${count[0].count}`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

addCostSavingsMetric();
