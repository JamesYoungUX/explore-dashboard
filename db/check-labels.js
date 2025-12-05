import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkReadmissionLabel() {
    try {
        console.log('🔍 Checking current readmission rate labels...\n');

        const results = await sql`
      SELECT id, kpi_type, kpi_label, period_id
      FROM efficiency_kpis 
      WHERE kpi_type = 'readmission_rate'
      ORDER BY id
    `;

        if (results.length === 0) {
            console.log('❌ No readmission_rate records found in database');
        } else {
            console.log(`Found ${results.length} readmission_rate records:`);
            results.forEach(row => {
                console.log(`  - ID: ${row.id}, Label: "${row.kpi_label}", Period: ${row.period_id}`);
            });
        }

        // Also check all KPI labels
        console.log('\n📊 All KPI labels in database:');
        const allKpis = await sql`
      SELECT DISTINCT kpi_label 
      FROM efficiency_kpis 
      ORDER BY kpi_label
    `;
        allKpis.forEach(row => {
            console.log(`  - ${row.kpi_label}`);
        });

    } catch (error) {
        console.error('❌ Check failed:', error.message);
        process.exit(1);
    }
}

checkReadmissionLabel();
