import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixAvoidableAdmissionsFinal() {
    try {
        console.log('🔄 Updating Avoidable Admissions KPI with correct values...\n');

        // Correct values as specified
        const actual = 30.6;
        const benchmark = 26.8;
        const acoRank = 28;

        // Calculate variance: ((actual - benchmark) / benchmark) * 100
        const variance = ((actual - benchmark) / benchmark) * 100;
        const varianceRounded = Math.round(variance * 10) / 10; // Round to 1 decimal place

        console.log('📊 Calculated values:');
        console.log(`  Actual: ${actual} per 1000`);
        console.log(`  Benchmark: ${benchmark} per 1000`);
        console.log(`  Variance: ${varianceRounded}% (calculated: ${variance.toFixed(2)}%)`);
        console.log(`  ACO Rank: ${acoRank}`);
        console.log(`  Performance Status: bad (positive variance = worse than benchmark)\n`);

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            await sql`
                UPDATE efficiency_kpis 
                SET 
                    actual_value = ${actual},
                    aco_benchmark = ${benchmark},
                    variance_percent = ${varianceRounded},
                    performance_status = 'bad',
                    display_format = 'per_thousand'
                WHERE period_id = ${period.id} 
                AND kpi_type = 'ed_rate'
            `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Avoidable Admissions KPI updated successfully!');
        console.log('\n📋 Summary:');
        console.log(`   Label: Avoidable Admissions per 1000`);
        console.log(`   Actual: ${actual} per 1000`);
        console.log(`   Benchmark: ${benchmark} per 1000`);
        console.log(`   Variance: +${varianceRounded}% (ABOVE benchmark)`);
        console.log(`   ACO Rank: ${acoRank}`);
        console.log(`   Status: bad (will appear in LOWEST PERFORMING)`);
        console.log(`   Display Format: whole numbers (no decimals)`);

        // Verify the update
        console.log('\n🔍 Verifying update...');
        const verification = await sql`
            SELECT 
                p.period_key,
                ek.kpi_label,
                ek.actual_value,
                ek.aco_benchmark,
                ek.variance_percent,
                ek.performance_status
            FROM efficiency_kpis ek
            JOIN performance_periods p ON ek.period_id = p.id
            WHERE ek.kpi_type = 'ed_rate'
            ORDER BY p.period_key
        `;

        console.log('\nCurrent database values:');
        verification.forEach(row => {
            console.log(`  ${row.period_key}: ${row.actual_value} (benchmark: ${row.aco_benchmark}, variance: ${row.variance_percent}%, status: ${row.performance_status})`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixAvoidableAdmissionsFinal();
