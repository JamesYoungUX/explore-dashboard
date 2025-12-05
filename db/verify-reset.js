import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function verifyReset() {
    try {
        console.log('🔍 Verifying reset values...\n');

        const kpis = await sql`
            SELECT 
                p.period_key,
                ek.kpi_label,
                ek.actual_value,
                ek.aco_benchmark,
                ek.variance_percent,
                ek.performance_status,
                ek.aco_rank
            FROM efficiency_kpis ek
            JOIN performance_periods p ON ek.period_id = p.id
            WHERE ek.kpi_type = 'ed_rate'
            ORDER BY p.period_key
        `;

        console.log('Avoidable Admissions KPI values:');
        kpis.forEach(row => {
            console.log(`  ${row.period_key}:`);
            console.log(`    Actual: ${row.actual_value}`);
            console.log(`    Benchmark: ${row.aco_benchmark}`);
            console.log(`    Variance: ${row.variance_percent}%`);
            console.log(`    Status: ${row.performance_status}`);
            console.log(`    ACO Rank: ${row.aco_rank}`);
            console.log('');
        });

        const allCorrect = kpis.every(kpi =>
            kpi.actual_value === 35.3 &&
            kpi.aco_benchmark === 26.8 &&
            kpi.variance_percent === 31.7 &&
            kpi.performance_status === 'bad' &&
            kpi.aco_rank === 28
        );

        if (allCorrect) {
            console.log('✅ All values are correct!');
        } else {
            console.log('❌ Some values are incorrect!');
        }

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

verifyReset();
