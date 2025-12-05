import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addAcoRankColumn() {
    try {
        console.log('🔄 Adding aco_rank column to efficiency_kpis table...\n');

        // Check if column already exists
        const columnCheck = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'efficiency_kpis' 
            AND column_name = 'aco_rank'
        `;

        if (columnCheck.length > 0) {
            console.log('✓ Column aco_rank already exists');
        } else {
            // Add the column
            await sql`
                ALTER TABLE efficiency_kpis 
                ADD COLUMN aco_rank INTEGER
            `;
            console.log('✓ Added aco_rank column to efficiency_kpis table');
        }

        console.log('\n🔄 Updating ACO ranks for all KPIs...\n');

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            // Update each KPI type with its ACO rank
            const updates = [
                { kpi_type: 'readmission_rate', rank: 18 },
                { kpi_type: 'snf_days_per_1000', rank: 15 },
                { kpi_type: 'ed_rate', rank: 28 },  // Avoidable Admissions
                { kpi_type: 'generic_utilization', rank: 8 },
                { kpi_type: 'pcp_visits', rank: 3 },
            ];

            for (const update of updates) {
                await sql`
                    UPDATE efficiency_kpis 
                    SET aco_rank = ${update.rank}
                    WHERE period_id = ${period.id} 
                    AND kpi_type = ${update.kpi_type}
                `;
            }

            console.log(`  ✓ Updated ACO ranks for ${period.period_key}`);
        }

        console.log('\n✅ ACO ranks added successfully!');
        console.log('\n📋 ACO Rank Summary:');
        console.log('   Readmission Rate: 18');
        console.log('   SNF Days per 1000: 15');
        console.log('   Avoidable Admissions per 1000: 28');
        console.log('   Generic Utilization: 8');
        console.log('   PCP Visits: 3');

        // Verify the update
        console.log('\n🔍 Verifying ACO ranks...');
        const verification = await sql`
            SELECT 
                p.period_key,
                ek.kpi_label,
                ek.aco_rank,
                ek.variance_percent,
                ek.performance_status
            FROM efficiency_kpis ek
            JOIN performance_periods p ON ek.period_id = p.id
            WHERE ek.aco_rank IS NOT NULL
            ORDER BY p.period_key, ek.aco_rank
        `;

        console.log('\nCurrent database values:');
        verification.forEach(row => {
            console.log(`  ${row.period_key} | ${row.kpi_label}: Rank ${row.aco_rank} (variance: ${row.variance_percent}%, status: ${row.performance_status})`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

addAcoRankColumn();
