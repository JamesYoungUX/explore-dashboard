import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testReset() {
    try {
        console.log('🧪 Testing Reset Database functionality...\n');

        // Check current state
        console.log('BEFORE reset:');
        const before = await sql`SELECT id, title, status FROM recommendations ORDER BY id`;
        before.forEach(r => console.log(`  ${r.id}. ${r.title} - ${r.status}`));

        // Simulate what the reset button does
        console.log('\n🔄 Running reset (reading seed-v2.sql)...\n');

        const { readFileSync } = await import('fs');
        const { resolve } = await import('path');

        const seedPath = resolve(process.cwd(), 'db/seed-v2.sql');
        const seedSQL = readFileSync(seedPath, 'utf-8');

        // Remove comment-only lines
        const cleanSQL = seedSQL
            .split('\n')
            .filter(line => {
                const trimmed = line.trim();
                return trimmed.length > 0 && !trimmed.startsWith('--');
            })
            .join('\n');

        // Split into statements
        const statements = cleanSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Executing ${statements.length} SQL statements...`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            try {
                await sql.unsafe(statements[i]);
                successCount++;
            } catch (error) {
                errorCount++;
                if (statements[i].includes('recommendations')) {
                    console.error(`Error on statement ${i + 1}:`, error.message);
                }
            }
        }

        console.log(`\n✅ Reset completed: ${successCount} succeeded, ${errorCount} failed\n`);

        // Check after state
        console.log('AFTER reset:');
        const after = await sql`SELECT id, title, status FROM recommendations ORDER BY id`;
        after.forEach(r => console.log(`  ${r.id}. ${r.title} - ${r.status}`));

        // Verify all are not_started or their original status
        const allCorrect = after.every(r =>
            (r.status === 'not_started') ||
            (r.id === 10 && r.status === 'accepted') ||
            (r.id === 12 && r.status === 'already_doing')
        );

        if (allCorrect) {
            console.log('\n✅ All recommendation statuses are correct!');
        } else {
            console.log('\n❌ Some statuses are incorrect!');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testReset();
