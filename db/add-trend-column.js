import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addTrendColumn() {
    try {
        console.log('Adding trend_percent column to cost_categories...\n');

        // Add the column if it doesn't exist
        await sql`
            ALTER TABLE cost_categories
            ADD COLUMN IF NOT EXISTS trend_percent DECIMAL(5,1) DEFAULT 0.0
        `;

        console.log('✅ Column added successfully!\n');

        // Set specific values for OP Surgical and Acute Rehab
        const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
        const ytdId = ytd[0].id;

        await sql`
            UPDATE cost_categories
            SET trend_percent = -6.4
            WHERE slug = 'op-surgical' AND period_id = ${ytdId}
        `;
        console.log('Set OP Surgical trend: -6.4% (improving)');

        await sql`
            UPDATE cost_categories
            SET trend_percent = 2.9
            WHERE slug = 'acute-rehab' AND period_id = ${ytdId}
        `;
        console.log('Set Acute Rehab trend: +2.9% (declining)');

        // Set random trends for other categories (between -34% and +8%)
        const categories = await sql`
            SELECT id, slug, category_name
            FROM cost_categories
            WHERE period_id = ${ytdId}
            AND slug NOT IN ('op-surgical', 'acute-rehab')
        `;

        for (const cat of categories) {
            const randomTrend = (Math.random() * 42 - 34).toFixed(1); // -34 to +8
            await sql`
                UPDATE cost_categories
                SET trend_percent = ${randomTrend}
                WHERE id = ${cat.id}
            `;
            console.log(`Set ${cat.category_name} trend: ${randomTrend}%`);
        }

        console.log('\n✅ All trends set!\n');

    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
}

addTrendColumn();
