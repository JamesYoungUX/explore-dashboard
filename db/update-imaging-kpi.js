import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateImagingKPI() {
    try {
        console.log('🔄 Updating Primary Care Visits to Imaging KPI...\n');

        const actual = 7.7;
        const benchmark = 8.5;
        const variance = ((actual - benchmark) / benchmark * 100).toFixed(2);
        const acoRank = 8;

        console.log('📊 New KPI Details:');
        console.log(`  Label: Imaging for lower back per 1000`);
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
                    kpi_type = 'imaging_lower_back',
                    kpi_label = 'Imaging for lower back per 1000',
                    actual_value = ${actual},
                    aco_benchmark = ${benchmark},
                    variance_percent = ${variance},
                    performance_status = 'good',
                    display_format = 'per_thousand',
                    aco_rank = ${acoRank}
                WHERE period_id = ${period.id}
                  AND kpi_type = 'pcp_visits'
            `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Imaging KPI updated successfully!');

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
            WHERE ek.kpi_type = 'imaging_lower_back'
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

updateImagingKPI();
