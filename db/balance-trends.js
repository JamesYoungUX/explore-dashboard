import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function balanceTrends() {
    try {
        console.log('Creating balanced trends with smaller values...\n');

        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        // More balanced mix: about half improving, half declining
        // Range: +3% to -8% (smaller values)
        const trendMap = {
            'acute-rehab': 2.9,          // declining (as requested)
            'op-surgical': -6.4,         // improving (as requested)
            'ip-surgical': 1.8,          // declining
            'inpatient-medical': -2.1,   // improving
            'radiology': 2.3,            // declining
            'lab-services': -3.5,        // improving
            'op-radiology': 1.2,         // declining
            'avoidable-ed-visits': -4.8, // improving
            'skilled-nursing': -7.2,     // improving
            'preventive-care': 2.6,      // declining
            'generic-drugs': -5.1,       // improving
            'primary-care': 1.8          // declining
        };

        for (const [slug, trend] of Object.entries(trendMap)) {
            await sql`
                UPDATE cost_categories
                SET trend_percent = ${trend}
                WHERE slug = ${slug} AND period_id = ${ytdId}
            `;
        }

        console.log('✅ Trends balanced!\n');

        // Verify
        const categories = await sql`
            SELECT category_name, trend_percent, performance_status
            FROM cost_categories
            WHERE period_id = ${ytdId}
            ORDER BY display_order
        `;

        console.log('Updated trends:\n');
        let decliningCount = 0;
        let improvingCount = 0;

        categories.forEach(cat => {
            const status = cat.trend_percent > 0 ? '🔴 declining' : '🟢 improving';
            if (cat.trend_percent > 0) decliningCount++;
            else improvingCount++;
            console.log(`  ${cat.category_name}: ${cat.trend_percent > 0 ? '+' : ''}${cat.trend_percent}% ${status}`);
        });

        console.log(`\n📊 Balance: ${decliningCount} declining, ${improvingCount} improving`);
        console.log(`📊 Range: +3% to -8%\n`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

balanceTrends();
