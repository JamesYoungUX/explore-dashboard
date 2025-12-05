import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateAvoidableEDKPI() {
    try {
        console.log('🔄 Updating Generic Drug Utilization to Avoidable ED visits KPI...\n');

        const actual = 20.1;
        const variance = -8.5;
        // Calculate benchmark from variance: variance = (actual - benchmark) / benchmark * 100
        // -8.5 = (20.1 - benchmark) / benchmark * 100
        // benchmark = 20.1 / (1 + variance/100)
        const benchmark = parseFloat((actual / (1 + variance / 100)).toFixed(2));
        const acoRank = 3;

        console.log('📊 New KPI Details:');
        console.log(`  Label: Avoidable ED visits per 1000`);
        console.log(`  Actual: ${actual}`);
        console.log(`  Benchmark: ${benchmark}`);
        console.log(`  Variance: ${variance}%`);
        console.log(`  ACO Rank: ${acoRank}`);
        console.log(`  Status: good (below benchmark)\n`);

        // Update all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            await sql`
                UPDATE efficiency_kpis
                SET 
                    kpi_type = 'avoidable_ed_visits',
                    kpi_label = 'Avoidable ED visits per 1000',
                    actual_value = ${actual},
                    aco_benchmark = ${benchmark},
                    variance_percent = ${variance},
                    performance_status = 'good',
                    display_format = 'per_thousand',
                    aco_rank = ${acoRank}
                WHERE period_id = ${period.id}
                  AND kpi_type = 'generic_utilization'
            `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Avoidable ED visits KPI updated successfully!');

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
            WHERE ek.kpi_type = 'avoidable_ed_visits'
            ORDER BY p.period_key
        `;

        console.log('\nCurrent database values:');
        verification.forEach(row => {
            console.log(`  ${row.period_key}: ${row.kpi_label} = ${row.actual_value} (benchmark: ${row.aco_benchmark}, variance: ${row.variance_percent}%, rank: ${row.aco_rank})`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateAvoidableEDKPI();
