import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateVarianceAmount() {
    try {
        console.log('Updating Acute Rehab variance amount to $150,000...\n');

        await sql`
            UPDATE cost_categories
            SET spending_variance_amount = 150000
            WHERE slug = 'acute-rehab'
                AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
        `;

        console.log('✅ Updated variance amount!\n');

        // Verify
        const cat = await sql`
            SELECT spending_pmpm_benchmark, spending_pmpm_actual, spending_variance_amount
            FROM cost_categories
            WHERE slug = 'acute-rehab'
                AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
        `;

        console.log('Verified:');
        console.log(`  PMPM Benchmark: $${cat[0].spending_pmpm_benchmark}`);
        console.log(`  PMPM Actual: $${cat[0].spending_pmpm_actual}`);
        console.log(`  Total Variance: $${cat[0].spending_variance_amount.toLocaleString()}`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

updateVarianceAmount();
