import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixWatchItems() {
    try {
        console.log('Fixing watch item variances to be within ±3%...\n');

        // Get YTD period
        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        // Update RED items (>3% above benchmark)
        console.log('Setting RED items (>3% above benchmark)...');

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 156.60, spending_pmpm_benchmark = 145.00,
                spending_variance_amount = 11.60, spending_variance_percent = 8.0
            WHERE slug = 'acute-rehab' AND period_id = ${ytdId}
        `;

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 189.90, spending_pmpm_benchmark = 179.10,
                spending_variance_amount = 10.80, spending_variance_percent = 6.0
            WHERE slug = 'op-surgical' AND period_id = ${ytdId}
        `;

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 224.70, spending_pmpm_benchmark = 214.00,
                spending_variance_amount = 10.70, spending_variance_percent = 5.0
            WHERE slug = 'ip-surgical' AND period_id = ${ytdId}
        `;

        await sql`
            UPDATE cost_categories
            SET performance_status = 'red'
            WHERE slug IN ('ed-visits', 'inpatient-medical') AND period_id = ${ytdId}
        `;

        // Update YELLOW items (within ±3% of benchmark)
        console.log('Setting YELLOW items (within ±3%)...');

        await sql`
            UPDATE cost_categories
            SET performance_status = 'yellow', description = 'Within 3% of benchmark'
            WHERE slug IN ('radiology', 'lab-services') AND period_id = ${ytdId}
        `;

        console.log('✅ All watch items updated!\n');

        // Verify
        const categories = await sql`
            SELECT category_name, spending_variance_percent, performance_status
            FROM cost_categories
            WHERE period_id = ${ytdId}
            ORDER BY spending_variance_percent DESC
        `;

        console.log('Updated categories:');
        categories.forEach(cat => {
            console.log(`  ${cat.category_name}: ${cat.spending_variance_percent}% (${cat.performance_status})`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

fixWatchItems();
