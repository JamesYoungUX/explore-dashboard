import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testTruncate() {
  try {
    console.log('Testing TRUNCATE...');

    // Try to truncate cost_categories
    await sql`TRUNCATE TABLE cost_categories RESTART IDENTITY CASCADE`;

    console.log('✅ TRUNCATE successful!');

    // Check if table is empty
    const count = await sql`SELECT COUNT(*) FROM cost_categories`;
    console.log(`Rows after TRUNCATE: ${count[0].count}`);

  } catch (error) {
    console.error('❌ TRUNCATE failed:', error.message);
  }
}

testTruncate();
