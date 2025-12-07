import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function setWatchItemsTo3Percent() {
    try {
        console.log('Setting watch items to have variance between -3% and +3%...\n');

        // Get YTD period
        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        // Keep some RED items (>3% above)
        console.log('RED items (>3% above benchmark):');

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 160.00, spending_pmpm_benchmark = 145.00,
                spending_variance_amount = 15.00, spending_variance_percent = 10.3,
                performance_status = 'red'
            WHERE slug = 'acute-rehab' AND period_id = ${ytdId}
        `;
        console.log('  Acute Rehab: 10.3%');

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 142.00, spending_pmpm_benchmark = 118.00,
                spending_variance_amount = 24.00, spending_variance_percent = 20.3,
                performance_status = 'red'
            WHERE slug = 'ed-visits' AND period_id = ${ytdId}
        `;
        console.log('  ED Visits: 20.3%');

        // Set YELLOW/WATCH items (within ±3%)
        console.log('\nYELLOW/WATCH items (within ±3%):');

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 184.40, spending_pmpm_benchmark = 179.10,
                spending_variance_amount = 5.30, spending_variance_percent = 3.0,
                performance_status = 'yellow', description = 'Within 3% of benchmark'
            WHERE slug = 'op-surgical' AND period_id = ${ytdId}
        `;
        console.log('  OP Surgical: +3.0%');

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 218.36, spending_pmpm_benchmark = 214.00,
                spending_variance_amount = 4.36, spending_variance_percent = 2.0,
                performance_status = 'yellow', description = 'Within 3% of benchmark'
            WHERE slug = 'ip-surgical' AND period_id = ${ytdId}
        `;
        console.log('  IP Surgical: +2.0%');

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 237.18, spending_pmpm_benchmark = 234.00,
                spending_variance_amount = 3.18, spending_variance_percent = 1.4,
                performance_status = 'yellow', description = 'Within 3% of benchmark'
            WHERE slug = 'inpatient-medical' AND period_id = ${ytdId}
        `;
        console.log('  Inpatient Medical: +1.4%');

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 78.00, spending_pmpm_benchmark = 80.00,
                spending_variance_amount = -2.00, spending_variance_percent = -2.5,
                performance_status = 'yellow', description = 'Within 3% of benchmark'
            WHERE slug = 'radiology' AND period_id = ${ytdId}
        `;
        console.log('  Radiology: -2.5%');

        await sql`
            UPDATE cost_categories
            SET spending_pmpm_actual = 34.00, spending_pmpm_benchmark = 35.00,
                spending_variance_amount = -1.00, spending_variance_percent = -2.9,
                performance_status = 'yellow', description = 'Within 3% of benchmark'
            WHERE slug = 'lab-services' AND period_id = ${ytdId}
        `;
        console.log('  Lab Services: -2.9%');

        // Keep some GREEN items (<-3% below)
        console.log('\nGREEN items (>3% below benchmark):');

        await sql`
            UPDATE cost_categories
            SET performance_status = 'green'
            WHERE slug IN ('avoidable-ed-visits', 'skilled-nursing', 'op-radiology', 'primary-care', 'preventive-care', 'generic-drugs')
            AND period_id = ${ytdId}
        `;
        console.log('  Kept existing green items');

        console.log('\n✅ All items updated!\n');

        // Verify
        const categories = await sql`
            SELECT category_name, spending_variance_percent, performance_status
            FROM cost_categories
            WHERE period_id = ${ytdId}
            ORDER BY spending_variance_percent DESC
        `;

        console.log('Final categories:');
        categories.forEach(cat => {
            const color = cat.performance_status === 'red' ? '🔴' :
                         cat.performance_status === 'yellow' ? '🟡' : '🟢';
            console.log(`  ${color} ${cat.category_name}: ${cat.spending_variance_percent}%`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

setWatchItemsTo3Percent();
