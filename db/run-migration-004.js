import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

console.log('🔧 Running migration 004: Fix cost_categories slug constraint...');

async function runMigration() {
  const sql = neon(DATABASE_URL);

  try {
    // Read the migration file
    const migrationPath = join(__dirname, 'migrations', '004_fix_cost_categories_slug_constraint.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split into individual statements and execute
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      await sql(statement);
    }

    console.log('✅ Migration 004 completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
