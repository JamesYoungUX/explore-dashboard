import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateMetrics() {
    try {
        console.log('🔄 Updating PMPM and Total Spend metrics...\n');

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            // Update cost_pmpm
            await sql`
        UPDATE performance_metrics 
        SET 
          current_value = 1080,
          previous_value = 1053,
          change_percent = 2.6,
          change_direction = 'up'
        WHERE period_id = ${period.id} 
        AND metric_type = 'cost_pmpm'
      `;

            // Update total_cost
            await sql`
        UPDATE performance_metrics 
        SET 
          current_value = 4980760,
          previous_value = 4840000,
          change_percent = 2.9,
          change_direction = 'up'
        WHERE period_id = ${period.id} 
        AND metric_type = 'total_cost'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Metrics updated successfully!');
        console.log('   PMPM: $1,080 (+2.6% ↑)');
        console.log('   Total Spend: $4,980,760 (+2.9% ↑)');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateMetrics();
