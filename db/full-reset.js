import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

async function fullReset() {
    try {
        console.log('🔄 Full database reset with complete dataset...\n');

        // Step 1: Clear all data
        console.log('🗑️  Clearing existing data...');
        await sql`DELETE FROM program_resources`;
        await sql`DELETE FROM recommendation_cost_categories`;
        await sql`DELETE FROM cost_category_discharging_hospitals`;
        await sql`DELETE FROM cost_category_drgs`;
        await sql`DELETE FROM cost_category_hospitals`;
        await sql`DELETE FROM cost_opportunities`;
        await sql`DELETE FROM efficiency_kpis`;
        await sql`DELETE FROM recommendations`;
        await sql`DELETE FROM cost_categories`;
        await sql`DELETE FROM performance_metrics`;
        await sql`DELETE FROM performance_periods`;
        console.log('  ✓ All data cleared\n');

        // Step 2: Load full seed file
        console.log('📊 Loading full dataset from seed-new-data.sql...');
        const seedFile = readFileSync(join(__dirname, 'seed-new-data.sql'), 'utf8');

        // Remove DELETE statements and comments, keep only INSERT statements
        const lines = seedFile.split('\n');
        let currentStatement = '';
        let inInsert = false;

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip comments and DELETE statements
            if (trimmed.startsWith('--') || trimmed.startsWith('DELETE')) {
                continue;
            }

            if (trimmed.startsWith('INSERT INTO')) {
                inInsert = true;
                currentStatement = line + '\n';
            } else if (inInsert) {
                currentStatement += line + '\n';

                // Check if statement is complete
                if (trimmed.endsWith(';')) {
                    try {
                        await sql.unsafe(currentStatement);
                        const tableName = currentStatement.match(/INSERT INTO (\w+)/)[1];
                        console.log(`  ✓ Loaded ${tableName}`);
                    } catch (err) {
                        console.error(`  ❌ Error loading statement:`, err.message);
                    }
                    currentStatement = '';
                    inInsert = false;
                }
            }
        }

        // Step 3: Verify
        console.log('\n🔍 Verifying data...');
        const periods = await sql`SELECT COUNT(*) as count FROM performance_periods`;
        const categories = await sql`SELECT COUNT(*) as count FROM cost_categories`;
        const recommendations = await sql`SELECT COUNT(*) as count FROM recommendations`;
        const kpis = await sql`SELECT COUNT(*) as count FROM efficiency_kpis`;

        console.log(`   ✓ Performance periods: ${periods[0].count}`);
        console.log(`   ✓ Cost categories: ${categories[0].count}`);
        console.log(`   ✓ Recommendations: ${recommendations[0].count}`);
        console.log(`   ✓ Efficiency KPIs: ${kpis[0].count}`);

        // Check readmission label
        const readmissionKpi = await sql`
      SELECT kpi_label 
      FROM efficiency_kpis 
      WHERE kpi_type = 'readmission_rate' 
      LIMIT 1
    `;

        if (readmissionKpi.length > 0) {
            console.log(`\n✅ Readmission KPI label: "${readmissionKpi[0].kpi_label}"`);
        }

        console.log('\n✅ Full database reset complete!');

    } catch (error) {
        console.error('\n❌ Reset failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

fullReset();
