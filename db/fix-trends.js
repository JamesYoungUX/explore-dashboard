import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixTrends() {
    try {
        console.log('Fixing trend values to be between +3% and -12%...\n');

        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        // Set specific values for OP Surgical and Acute Rehab (as requested)
        await sql`
            UPDATE cost_categories
            SET trend_percent = -6.4
            WHERE slug = 'op-surgical' AND period_id = ${ytdId}
        `;
        console.log('OP Surgical: -6.4% (improving)');

        await sql`
            UPDATE cost_categories
            SET trend_percent = 2.9
            WHERE slug = 'acute-rehab' AND period_id = ${ytdId}
        `;
        console.log('Acute Rehab: +2.9% (declining)');

        // Set more realistic trends for other categories (between +3% and -12%)
        const trendMap = {
            'ip-surgical': -4.2,
            'inpatient-medical': -2.1,
            'radiology': -7.8,
            'lab-services': -5.3,
            'op-radiology': -3.5,
            'avoidable-ed-visits': -8.2,
            'skilled-nursing': -11.5,
            'preventive-care': -9.1,
            'generic-drugs': -6.7,
            'primary-care': 1.8
        };

        for (const [slug, trend] of Object.entries(trendMap)) {
            await sql`
                UPDATE cost_categories
                SET trend_percent = ${trend}
                WHERE slug = ${slug} AND period_id = ${ytdId}
            `;
            console.log(`${slug}: ${trend > 0 ? '+' : ''}${trend}%`);
        }

        console.log('\n✅ All trends updated!\n');

        // Verify
        const categories = await sql`
            SELECT slug, category_name, trend_percent
            FROM cost_categories
            WHERE period_id = ${ytdId}
            ORDER BY display_order
        `;

        console.log('Updated trend values:\n');
        categories.forEach(cat => {
            const status = cat.trend_percent > 0 ? '🔴 declining' : '🟢 improving';
            console.log(`  ${cat.category_name}: ${cat.trend_percent > 0 ? '+' : ''}${cat.trend_percent}% ${status}`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

fixTrends();
