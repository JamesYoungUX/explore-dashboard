import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateSNFKPI() {
    try {
        console.log('🔄 Updating SNF Days KPI to per 1,000 and adjusting variance...\n');

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            // Update the KPI - change to per_1000 and increase variance to make it 2nd
            await sql`
        UPDATE efficiency_kpis 
        SET 
          kpi_type = 'snf_days_per_1000',
          kpi_label = 'SNF Days per 1,000',
          actual_value = 245,
          aco_benchmark = 200,
          variance_percent = 22.5,
          performance_status = 'warning',
          display_format = 'per_thousand',
          display_order = 2
        WHERE period_id = ${period.id} 
        AND kpi_type = 'snf_days_per_100'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ SNF Days per 1,000 KPI updated successfully!');
        console.log('   Actual: 245 days per 1,000');
        console.log('   Benchmark: 200 days per 1,000');
        console.log('   Variance: 22.5% (will be 2nd in Lowest Performing)');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateSNFKPI();
