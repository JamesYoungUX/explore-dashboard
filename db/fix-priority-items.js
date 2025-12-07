import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixPriorityItems() {
    try {
        console.log('Setting OP Surgical and IP Surgical as RED priority items...\n');

        const ytd = await sql\`SELECT id FROM performance_periods WHERE period_key = 'ytd'\`;
        const ytdId = ytd[0].id;

        // Make OP Surgical RED (>3%)
        await sql\`
            UPDATE cost_categories
            SET spending_pmpm_actual = 194.62, spending_pmpm_benchmark = 179.10,
                spending_variance_amount = 15.52, spending_variance_percent = 8.7,
                performance_status = 'red', is_opportunity = true,
                description = '8.7% above benchmark'
            WHERE slug = 'op-surgical' AND period_id = \${ytdId}
        \`;
        console.log('  OP Surgical: 8.7% (RED)');

        // Make IP Surgical RED (>3%)
        await sql\`
            UPDATE cost_categories
            SET spending_pmpm_actual = 225.54, spending_pmpm_benchmark = 214.00,
                spending_variance_amount = 11.54, spending_variance_percent = 5.4,
                performance_status = 'red', is_opportunity = true,
                description = '5.4% above benchmark'
            WHERE slug = 'ip-surgical' AND period_id = \${ytdId}
        \`;
        console.log('  IP Surgical: 5.4% (RED)');

        console.log('\n✅ Priority items updated!\n');

        // Verify
        const categories = await sql\`
            SELECT category_name, spending_variance_percent, performance_status
            FROM cost_categories
            WHERE period_id = \${ytdId}
            ORDER BY spending_variance_percent DESC
        \`;

        console.log('All categories:');
        categories.forEach(cat => {
            const icon = cat.performance_status === 'red' ? '🔴' :
                        cat.performance_status === 'yellow' ? '🟡' : '🟢';
            console.log(\`  \${icon} \${cat.category_name}: \${cat.spending_variance_percent}%\`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

fixPriorityItems();
