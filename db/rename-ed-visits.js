import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function renameEDVisits() {
    try {
        console.log('🔄 Renaming ED Visits to Avoidable Admissions...\n');

        // Get all periods
        const periods = await sql`SELECT id, period_key FROM performance_periods ORDER BY period_key`;

        for (const period of periods) {
            await sql`
        UPDATE efficiency_kpis 
        SET kpi_label = 'Avoidable Admissions per 1000'
        WHERE period_id = ${period.id} 
        AND kpi_type = 'ed_rate'
      `;

            console.log(`  ✓ Updated ${period.period_key}`);
        }

        console.log('\n✅ KPI label updated successfully!');
        console.log('   "ED Visits per 1,000" → "Avoidable Admissions per 1000"');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

renameEDVisits();
