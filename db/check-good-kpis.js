import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkGoodKPIs() {
    try {
        const kpis = await sql`
            SELECT kpi_label, actual_value, aco_benchmark, variance_percent, performance_status
            FROM efficiency_kpis 
            WHERE period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
            ORDER BY kpi_label
        `;

        console.log('All KPIs:');
        kpis.forEach(kpi => {
            console.log(`  ${kpi.kpi_label}: ${kpi.performance_status} (variance: ${kpi.variance_percent}%)`);
        });

        console.log('\nKPIs with status = "good":');
        const goodKPIs = kpis.filter(k => k.performance_status === 'good');
        goodKPIs.forEach(kpi => {
            console.log(`  ${kpi.kpi_label}: actual=${kpi.actual_value}, benchmark=${kpi.aco_benchmark}, variance=${kpi.variance_percent}%`);
        });

        console.log(`\nTotal "good" KPIs: ${goodKPIs.length}`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

checkGoodKPIs();
