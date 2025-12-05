import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

// Split SQL by semicolons but respect quoted strings and arrays
function splitSqlStatements(sqlContent) {
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    const nextChar = sqlContent[i + 1];

    // Handle string escapes
    if (inString && char === stringChar && nextChar === stringChar) {
      current += char + nextChar;
      i++;
      continue;
    }

    // Toggle string state
    if ((char === "'" || char === '"') && !inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar && inString) {
      inString = false;
    }

    // Split on semicolon only when not in a string
    if (char === ';' && !inString) {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }

  // Don't forget the last statement if it doesn't end with semicolon
  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function runMigration002() {
  try {
    console.log('🚀 Running Migration 002: Leadership Feedback Tables...');
    console.log('Database URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ NOT SET');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Read migration file
    const migration = readFileSync(join(__dirname, 'migrations', '002_leadership_feedback_tables.sql'), 'utf8');
    const statements = splitSqlStatements(migration);

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      // Skip comments-only statements
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();

      if (cleanStatement) {
        try {
          await sql.query(cleanStatement);
          successCount++;

          // Extract table/view name from statement for better logging
          let entityName = 'unknown';
          if (cleanStatement.includes('CREATE TABLE')) {
            const match = cleanStatement.match(/CREATE TABLE.*?(\w+)\s*\(/i);
            if (match) entityName = match[1];
          } else if (cleanStatement.includes('CREATE VIEW')) {
            const match = cleanStatement.match(/CREATE.*?VIEW.*?(\w+)\s+AS/i);
            if (match) entityName = match[1];
          } else if (cleanStatement.includes('CREATE INDEX')) {
            const match = cleanStatement.match(/CREATE INDEX.*?(\w+)\s+ON/i);
            if (match) entityName = match[1];
          }

          console.log(`  ✓ [${i + 1}/${statements.length}] ${entityName}`);
        } catch (err) {
          // If error is "already exists", that's okay - skip it
          if (err.message.includes('already exists')) {
            skipCount++;
            console.log(`  ⊙ [${i + 1}/${statements.length}] Already exists (skipped)`);
          } else {
            console.error(`\n❌ Error in statement ${i + 1}:`);
            console.error('Statement preview:', cleanStatement.substring(0, 200));
            throw err;
          }
        }
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✓ Created: ${successCount}`);
    console.log(`   ⊙ Skipped: ${skipCount}`);
    console.log(`   Total: ${statements.length}`);

    // Verify new tables exist
    console.log('\n🔍 Verifying new tables...');
    const newTables = [
      'performance_periods',
      'performance_metrics',
      'cost_categories',
      'recommendations',
      'recommendation_cost_categories',
      'program_resources',
      'efficiency_kpis',
      'cost_opportunities',
      'cost_category_hospitals',
      'cost_category_drgs',
      'cost_category_discharging_hospitals'
    ];

    const allTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tableNames = allTables.map(t => t.table_name);

    let allPresent = true;
    for (const tableName of newTables) {
      if (tableNames.includes(tableName)) {
        console.log(`   ✓ ${tableName}`);
      } else {
        console.log(`   ✗ ${tableName} - MISSING!`);
        allPresent = false;
      }
    }

    if (allPresent) {
      console.log('\n✅ Migration 002 completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Run seed script: node db/seed-new-data.js');
      console.log('   2. Build API endpoints');
      console.log('   3. Create frontend components');
    } else {
      throw new Error('Some tables were not created successfully');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runMigration002();
