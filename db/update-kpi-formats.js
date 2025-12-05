import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateKPIFormats() {
    try {
        console.log('🔄 Updating SNF Days and ED Visits to display as percentages...\n');

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            // Update SNF Days to percent format
            await sql`
        UPDATE efficiency_kpis 
        SET display_format = 'percent'
        WHERE period_id = ${period.id} 
        AND kpi_type = 'snf_days_per_1000'
      `;

            // Update ED Visits to percent format
            await sql`
        UPDATE efficiency_kpis 
        SET display_format = 'percent'
        WHERE period_id = ${period.id} 
        AND kpi_type = 'ed_rate'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ Display formats updated successfully!');
        console.log('   SNF Days per 1,000: now displays as percentage');
        console.log('   ED Visits per 1,000: now displays as percentage');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateKPIFormats();
