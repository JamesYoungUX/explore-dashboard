import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database with full dataset...\n');

        // Read and execute the seed file line by line using template literals
        const seedFile = readFileSync(join(__dirname, 'seed-v2.sql'), 'utf8');

        // Execute the entire file as one transaction
        await sql.unsafe(seedFile);

        console.log('✅ Database seeded successfully!\n');

        // Verify data
        const periods = await sql`SELECT COUNT(*) as count FROM performance_periods`;
        const categories = await sql`SELECT COUNT(*) as count FROM cost_categories`;
        const recommendations = await sql`SELECT COUNT(*) as count FROM recommendations`;
        const kpis = await sql`SELECT COUNT(*) as count FROM efficiency_kpis`;

        console.log('📊 Data Summary:');
        console.log(`   ✓ Performance periods: ${periods[0].count}`);
        console.log(`   ✓ Cost categories: ${categories[0].count}`);
        console.log(`   ✓ Recommendations: ${recommendations[0].count}`);
        console.log(`   ✓ Efficiency KPIs: ${kpis[0].count}`);

        // Check the readmission label
        const readmissionKpi = await sql`
      SELECT kpi_label 
      FROM efficiency_kpis 
      WHERE kpi_type = 'readmission_rate' 
      LIMIT 1
    `;

        if (readmissionKpi.length > 0) {
            console.log(`\n✅ Readmission KPI label: "${readmissionKpi[0].kpi_label}"`);
        }

    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

seedDatabase();
