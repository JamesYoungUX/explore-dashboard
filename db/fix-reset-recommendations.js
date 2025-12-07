import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixResetRecommendations() {
    try {
        console.log('🔄 Fixing recommendations reset issue...\n');

        // Read the seed file
        const seedPath = resolve(process.cwd(), 'db/seed-v2.sql');
        const seedSQL = readFileSync(seedPath, 'utf-8');

        // Extract just the recommendations INSERT statement
        const recInsertMatch = seedSQL.match(/INSERT INTO recommendations[\s\S]*?VALUES[\s\S]*?;/);

        if (!recInsertMatch) {
            console.error('❌ Could not find recommendations INSERT statement');
            return;
        }

        console.log('Found recommendations INSERT statement');
        console.log('Truncating recommendations table...');

        await sql`TRUNCATE TABLE recommendations RESTART IDENTITY CASCADE`;

        console.log('Executing INSERT...\n');

        // Execute the INSERT statement
        await sql.unsafe(recInsertMatch[0]);

        console.log('✅ Recommendations reset complete!\n');

        // Verify
        const recs = await sql`SELECT id, title, status FROM recommendations ORDER BY id`;
        console.log(`Total recommendations: ${recs.length}`);
        recs.forEach(r => console.log(`  ${r.id}. ${r.title} - ${r.status}`));

    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixResetRecommendations();
