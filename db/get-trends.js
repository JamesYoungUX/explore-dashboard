import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function getTrends() {
    try {
        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        const categories = await sql`
            SELECT slug, category_name, trend_percent
            FROM cost_categories
            WHERE period_id = ${ytdId}
            ORDER BY display_order
        `;

        console.log('Current trend values:\n');
        categories.forEach(cat => {
            console.log(`('${cat.slug}', ${cat.trend_percent}), -- ${cat.category_name}`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

getTrends();
