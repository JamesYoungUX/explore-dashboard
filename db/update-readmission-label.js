import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateReadmissionLabel() {
    try {
        console.log('🔄 Updating readmission rate label...\n');

        // First check what we have
        const before = await sql`
      SELECT id, kpi_label 
      FROM efficiency_kpis 
      WHERE kpi_type = 'readmission_rate'
    `;

        console.log('Before update:');
        before.forEach(row => console.log(`  - "${row.kpi_label}"`));

        // Update the label
        const result = await sql`
      UPDATE efficiency_kpis 
      SET kpi_label = 'Readmission Rate'
      WHERE kpi_type = 'readmission_rate'
      RETURNING id, kpi_label
    `;

        console.log('\n✅ Updated records:');
        result.forEach(row => console.log(`  - ID ${row.id}: "${row.kpi_label}"`));

        console.log('\n✅ Label update complete!');
        console.log('🔄 Refresh your browser to see "Readmission Rate" in the tables.');

    } catch (error) {
        console.error('❌ Update failed:', error.message);
        process.exit(1);
    }
}

updateReadmissionLabel();
