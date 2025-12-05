import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixAvoidableAdmissions() {
    try {
        console.log('🔄 Fixing Avoidable Admissions KPI...\n');

        const actual = 30.6;
        const benchmark = 440;
        const variance = ((actual - benchmark) / benchmark * 100).toFixed(1);
        const acoRank = 28;

        console.log('Correct values:');
        console.log(`  Actual: ${actual} per 1000`);
        console.log(`  Benchmark: ${benchmark} per 1000`);
        console.log(`  Variance: ${variance}%`);
        console.log(`  ACO Rank: ${acoRank}`);

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            await sql`
        UPDATE efficiency_kpis 
        SET 
          actual_value = ${actual},
          aco_benchmark = ${benchmark},
          variance_percent = ${parseFloat(variance)}
        WHERE period_id = ${period.id} 
        AND kpi_type = 'ed_rate'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Avoidable Admissions KPI fixed!');
        console.log(`   Actual: ${actual} per 1000`);
        console.log(`   Benchmark: ${benchmark} per 1000`);
        console.log(`   Variance: ${variance}% (performing BETTER than benchmark)`);
        console.log(`   ACO Rank: ${acoRank}`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

fixAvoidableAdmissions();
