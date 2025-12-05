import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateAvoidableAdmissions() {
    try {
        console.log('🔄 Updating Avoidable Admissions KPI...\n');

        const benchmark = 440;
        const variance = 30.6;
        const actual = Math.round(benchmark * (1 + variance / 100));
        const acoRank = 28;

        console.log('Calculated values:');
        console.log(`  Benchmark: ${benchmark}`);
        console.log(`  Variance: ${variance}%`);
        console.log(`  Actual: ${actual}`);
        console.log(`  ACO Rank: ${acoRank}`);

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            await sql`
        UPDATE efficiency_kpis 
        SET 
          actual_value = ${actual},
          aco_benchmark = ${benchmark},
          variance_percent = ${variance}
        WHERE period_id = ${period.id} 
        AND kpi_type = 'ed_rate'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Avoidable Admissions KPI updated successfully!');
        console.log(`   Actual: ${actual} per 1000`);
        console.log(`   Benchmark: ${benchmark} per 1000`);
        console.log(`   Variance: ${variance}%`);
        console.log(`   ACO Rank: ${acoRank} (update frontend)`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateAvoidableAdmissions();
