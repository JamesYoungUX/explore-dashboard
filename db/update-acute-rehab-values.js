import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateAcuteRehab() {
    try {
        console.log('Updating Acute Rehab with correct values...\n');

        await sql`
            UPDATE cost_categories
            SET 
                spending_pmpm_benchmark = 17.00,
                spending_pmpm_actual = 46.00,
                spending_variance_percent = 170.0,
                spending_variance_amount = 29.00,
                utilization_benchmark = 9.6,
                utilization_actual = 26.8,
                utilization_variance_percent = 180.0
            WHERE slug = 'acute-rehab'
                AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
        `;

        console.log('✅ Updated Acute Rehab!\n');

        // Verify
        const updated = await sql`
            SELECT 
                category_name,
                spending_pmpm_benchmark,
                spending_pmpm_actual,
                spending_variance_percent,
                utilization_benchmark,
                utilization_actual,
                utilization_variance_percent
            FROM cost_categories
            WHERE slug = 'acute-rehab'
                AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
        `;

        const cat = updated[0];
        console.log('Verified values:');
        console.log(`  PMPM Benchmark: $${cat.spending_pmpm_benchmark}`);
        console.log(`  PMPM Actual: $${cat.spending_pmpm_actual} (${cat.spending_variance_percent}%)`);
        console.log(`  Utilization Benchmark: ${cat.utilization_benchmark}`);
        console.log(`  Utilization Actual: ${cat.utilization_actual} (${cat.utilization_variance_percent}%)`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateAcuteRehab();
