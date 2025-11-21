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

async function runMigrations() {
  try {
    console.log('Running schema migrations...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');

    // Read and execute schema
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    const schemaStatements = splitSqlStatements(schema);

    console.log(`Found ${schemaStatements.length} schema statements`);

    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i];
      // Skip comments-only statements
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();
      if (cleanStatement) {
        try {
          await sql.query(cleanStatement);
          console.log(`Schema statement ${i + 1}/${schemaStatements.length} executed`);
        } catch (err) {
          console.error(`Error in schema statement ${i + 1}:`, cleanStatement.substring(0, 100));
          throw err;
        }
      }
    }
    console.log('Schema created successfully!');

    console.log('Running seed data...');

    // Read and execute seed data
    const seed = readFileSync(join(__dirname, 'seed-gaps.sql'), 'utf8');
    const seedStatements = splitSqlStatements(seed);

    console.log(`Found ${seedStatements.length} seed statements`);

    for (let i = 0; i < seedStatements.length; i++) {
      const statement = seedStatements[i];
      // Skip comments-only statements
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();
      if (cleanStatement) {
        try {
          await sql.query(cleanStatement);
          console.log(`Seed statement ${i + 1}/${seedStatements.length} executed`);
        } catch (err) {
          console.error(`Error in seed statement ${i + 1}:`, cleanStatement.substring(0, 100));
          throw err;
        }
      }
    }
    console.log('Seed data inserted successfully!');

    // Verify tables exist
    console.log('\nVerifying tables...');
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in database:', tables.map(t => t.table_name).join(', '));

    console.log('\nAll migrations completed!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
