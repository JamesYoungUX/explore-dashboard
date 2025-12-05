import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateSNFBenchmark() {
    try {
        console.log('🔄 Updating SNF Days benchmark to 945 and recalculating actual...\n');

        // With 22.5% variance and benchmark of 945:
        // Actual = 945 * 1.225 = 1,158 days per 1,000
        const benchmark = 945;
        const variance = 22.5;
        const actual = Math.round(benchmark * (1 + variance / 100));

        console.log(`Calculated values:`);
        console.log(`  Benchmark: ${benchmark} days per 1,000`);
        console.log(`  Actual: ${actual} days per 1,000`);
        console.log(`  Variance: ${variance}%`);

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            await sql`
        UPDATE efficiency_kpis 
        SET 
          actual_value = ${actual},
          aco_benchmark = ${benchmark}
        WHERE period_id = ${period.id} 
        AND kpi_type = 'snf_days_per_1000'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ SNF Days benchmark updated successfully!');
        console.log(`   Benchmark: ${benchmark} days per 1,000 (national average)`);
        console.log(`   Actual: ${actual} days per 1,000`);
        console.log(`   Variance: ${variance}% above benchmark`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateSNFBenchmark();
