import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateAvoidableAdmissionsVariance() {
    try {
        console.log('🔄 Updating Avoidable Admissions variance to 31.7%...\n');

        // Given values
        const benchmark = 26.8;
        const desiredVariance = 31.7;

        // Calculate actual value: actual = benchmark × (1 + variance/100)
        const actual = benchmark * (1 + desiredVariance / 100);
        const actualRounded = Math.round(actual * 10) / 10; // Round to 1 decimal place

        const acoRank = 28;

        console.log('📊 Calculated values:');
        console.log(`  Benchmark: ${benchmark} per 1000`);
        console.log(`  Desired Variance: ${desiredVariance}%`);
        console.log(`  Calculated Actual: ${actual.toFixed(2)} → ${actualRounded}`);
        console.log(`  ACO Rank: ${acoRank}`);
        console.log(`  Performance Status: bad (positive variance = worse than benchmark)\n`);

        // Verify calculation
        const verifyVariance = ((actualRounded - benchmark) / benchmark) * 100;
        console.log(`  ✓ Verification: ${verifyVariance.toFixed(2)}% variance\n`);

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            await sql`
                UPDATE efficiency_kpis 
                SET 
                    actual_value = ${actualRounded},
                    aco_benchmark = ${benchmark},
                    variance_percent = ${desiredVariance},
                    performance_status = 'bad',
                    display_format = 'per_thousand',
                    aco_rank = ${acoRank}
                WHERE period_id = ${period.id} 
                AND kpi_type = 'ed_rate'
            `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Avoidable Admissions variance updated successfully!');
        console.log('\n📋 Summary:');
        console.log(`   Label: Avoidable Admissions per 1000`);
        console.log(`   Actual: ${actualRounded} per 1000`);
        console.log(`   Benchmark: ${benchmark} per 1000`);
        console.log(`   Variance: +${desiredVariance}% (ABOVE benchmark)`);
        console.log(`   ACO Rank: ${acoRank}`);
        console.log(`   Status: bad (will appear in LOWEST PERFORMING)`);

        // Verify the update
        console.log('\n🔍 Verifying update...');
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
            WHERE ek.kpi_type = 'ed_rate'
            ORDER BY p.period_key
        `;

        console.log('\nCurrent database values:');
        verification.forEach(row => {
            const calcVariance = ((row.actual_value - row.aco_benchmark) / row.aco_benchmark * 100).toFixed(2);
            console.log(`  ${row.period_key}: ${row.actual_value} (benchmark: ${row.aco_benchmark}, variance: ${row.variance_percent}%, calculated: ${calcVariance}%, rank: ${row.aco_rank})`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updateAvoidableAdmissionsVariance();
