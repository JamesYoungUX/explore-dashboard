import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
    try {
        console.log('🔍 Checking database state...\n');

        // Check KPIs
        const kpis = await sql`
      SELECT kpi_type, kpi_label, period_id
      FROM efficiency_kpis
      ORDER BY period_id, display_order
    `;

        console.log(`📊 Efficiency KPIs (${kpis.length} total):`);
        kpis.forEach(kpi => {
            console.log(`  - ${kpi.kpi_label} (${kpi.kpi_type})`);
        });

        // Check categories
        const categories = await sql`
      SELECT COUNT(*) as count, period_id
      FROM cost_categories
      GROUP BY period_id
    `;

        console.log(`\n📦 Cost Categories:`);
        categories.forEach(cat => {
            console.log(`  - Period ${cat.period_id}: ${cat.count} categories`);
        });

        // Check recommendations
        const recs = await sql`SELECT COUNT(*) as count FROM recommendations`;
        console.log(`\n📋 Recommendations: ${recs[0].count}`);

    } catch (error) {
        console.error('❌ Check failed:', error.message);
        process.exit(1);
    }
}

checkDatabase();
