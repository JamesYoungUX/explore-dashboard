import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addAnnualWellnessKPI() {
    try {
        console.log('🔄 Adding Annual wellness visits KPI...\n');

        // Calculate variance
        const actual = 802;
        const benchmark = 794;
        const variance = ((actual - benchmark) / benchmark * 100).toFixed(2);
        const acoRank = 5;

        console.log('📊 KPI Details:');
        console.log(`  Label: Annual wellness visits per 1000`);
        console.log(`  Actual: ${actual}`);
        console.log(`  Benchmark: ${benchmark}`);
        console.log(`  Variance: ${variance}%`);
        console.log(`  ACO Rank: ${acoRank}`);
        console.log(`  Status: good (above benchmark)\n`);

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            await sql`
                INSERT INTO efficiency_kpis (
                    period_id, kpi_type, kpi_label,
                    actual_value, aco_benchmark, milliman_benchmark,
                    variance_percent, performance_status, display_format, display_order, aco_rank
                ) VALUES (
                    ${period.id},
                    'annual_wellness_visits',
                    'Annual wellness visits per 1000',
                    ${actual},
                    ${benchmark},
                    null,
                    ${variance},
                    'good',
                    'per_thousand',
                    6,
                    ${acoRank}
                )
                ON CONFLICT (period_id, kpi_type) 
                DO UPDATE SET
                    actual_value = ${actual},
                    aco_benchmark = ${benchmark},
                    variance_percent = ${variance},
                    performance_status = 'good',
                    aco_rank = ${acoRank}
            `;

            console.log(`  ✓ Added/Updated ${period.period_key}`);
        }

        console.log('\n✅ Annual wellness visits KPI added successfully!');

        // Verify
        console.log('\n🔍 Verifying...');
        const verification = await sql`
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
            WHERE ek.kpi_type = 'annual_wellness_visits'
            ORDER BY p.period_key
        `;

        console.log('\nCurrent database values:');
        verification.forEach(row => {
            console.log(`  ${row.period_key}: ${row.actual_value} (benchmark: ${row.aco_benchmark}, variance: ${row.variance_percent}%, rank: ${row.aco_rank}, status: ${row.performance_status})`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

addAnnualWellnessKPI();
