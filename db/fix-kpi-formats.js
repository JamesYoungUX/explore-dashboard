import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixKPIFormats() {
    try {
        console.log('🔄 Fixing SNF Days and ED Visits display formats...\n');

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            // Update SNF Days to per_thousand format (shows as number)
            await sql`
        UPDATE efficiency_kpis 
        SET display_format = 'per_thousand'
        WHERE period_id = ${period.id} 
        AND kpi_type = 'snf_days_per_1000'
      `;

            // Update ED Visits to per_thousand format (shows as number)
            await sql`
        UPDATE efficiency_kpis 
        SET display_format = 'per_thousand'
        WHERE period_id = ${period.id} 
        AND kpi_type = 'ed_rate'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Display formats fixed!');
        console.log('   SNF Days per 1,000: now displays as number (e.g., 1158)');
        console.log('   ED Visits per 1,000: now displays as number (e.g., 520)');
        console.log('   (No % sign - these are counts per 1,000 patients)');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

fixKPIFormats();
