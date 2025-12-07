import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function runSeed() {
  try {
    console.log('Reading seed file...');
    const seedSQL = readFileSync('./db/seed-v2.sql', 'utf-8');

    // Split by semicolons but be careful with strings
    const statements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} statements`);
    console.log('Executing statements...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.length < 10) continue; // Skip very short statements

      try {
        await sql.unsafe(stmt);
        successCount++;
        if (i % 10 === 0) {
          console.log(`Progress: ${i}/${statements.length}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error in statement ${i}:`, error.message);
        if (stmt.length < 200) {
          console.error(`Statement: ${stmt.substring(0, 200)}`);
        }
      }
    }

    console.log(`\n✅ Done! Success: ${successCount}, Errors: ${errorCount}`);

    // Verify
    const categories = await sql`SELECT COUNT(*) FROM cost_categories`;
    console.log(`Categories in DB: ${categories[0].count}`);

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

runSeed();
