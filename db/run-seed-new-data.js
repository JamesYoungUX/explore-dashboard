import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

// Split SQL by semicolons but respect quoted strings
function splitSqlStatements(sqlContent) {
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    const nextChar = sqlContent[i + 1];

    if (inString && char === stringChar && nextChar === stringChar) {
      current += char + nextChar;
      i++;
      continue;
    }

    if ((char === "'" || char === '"') && !inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar && inString) {
      inString = false;
    }

    if (char === ';' && !inString) {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function runSeed() {
  try {
    console.log('🌱 Seeding new database tables...');
    console.log('Database URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ NOT SET');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Read seed file
    const seedFile = readFileSync(join(__dirname, 'seed-new-data.sql'), 'utf8');
    const statements = splitSqlStatements(seedFile);

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    let successCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const cleanStatement = statement.replace(/--.*$/gm, '').trim();

      if (cleanStatement) {
        try {
          await sql.query(cleanStatement);
          successCount++;

          // Log progress for key operations
          if (cleanStatement.startsWith('INSERT INTO performance_periods')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created performance periods`);
          } else if (cleanStatement.startsWith('INSERT INTO performance_metrics')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created performance metrics`);
          } else if (cleanStatement.startsWith('INSERT INTO cost_categories')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created cost categories (RED/YELLOW/GREEN)`);
          } else if (cleanStatement.startsWith('INSERT INTO recommendations')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created recommendations`);
          } else if (cleanStatement.startsWith('INSERT INTO recommendation_cost_categories')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Mapped recommendations to categories`);
          } else if (cleanStatement.startsWith('INSERT INTO program_resources')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created program resources`);
          } else if (cleanStatement.startsWith('INSERT INTO efficiency_kpis')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created efficiency KPIs`);
          } else if (cleanStatement.startsWith('INSERT INTO cost_opportunities')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created cost opportunities summary`);
          } else if (cleanStatement.startsWith('INSERT INTO cost_category_hospitals')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created hospital drill-down data`);
          } else if (cleanStatement.startsWith('INSERT INTO cost_category_drgs')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created DRG drill-down data`);
          } else if (cleanStatement.startsWith('INSERT INTO cost_category_discharging_hospitals')) {
            console.log(`  ✓ [${i + 1}/${statements.length}] Created discharging hospital data`);
          } else if (cleanStatement.startsWith('DELETE')) {
            // Silently clean up old data
          } else {
            console.log(`  ✓ [${i + 1}/${statements.length}] Executed`);
          }
        } catch (err) {
          console.error(`\n❌ Error in statement ${i + 1}:`);
          console.error('Statement preview:', cleanStatement.substring(0, 200));
          throw err;
        }
      }
    }

    console.log(`\n📊 Seed Summary:`);
    console.log(`   ✓ Statements executed: ${successCount}`);

    // Verify data was created
    console.log('\n🔍 Verifying data...');

    const periods = await sql`SELECT COUNT(*) as count FROM performance_periods`;
    console.log(`   ✓ Performance periods: ${periods[0].count}`);

    const categories = await sql`SELECT COUNT(*) as count FROM cost_categories`;
    console.log(`   ✓ Cost categories: ${categories[0].count}`);

    const recommendations = await sql`SELECT COUNT(*) as count FROM recommendations`;
    console.log(`   ✓ Recommendations: ${recommendations[0].count}`);

    const resources = await sql`SELECT COUNT(*) as count FROM program_resources`;
    console.log(`   ✓ Program resources: ${resources[0].count}`);

    // Show category breakdown
    const categoryBreakdown = await sql`
      SELECT performance_status, COUNT(*) as count
      FROM cost_categories
      GROUP BY performance_status
      ORDER BY performance_status
    `;

    console.log('\n📈 Category Performance Breakdown:');
    categoryBreakdown.forEach(row => {
      const emoji = row.performance_status === 'red' ? '🔴' :
                    row.performance_status === 'yellow' ? '🟡' :
                    row.performance_status === 'green' ? '🟢' : '⚪';
      console.log(`   ${emoji} ${row.performance_status.toUpperCase()}: ${row.count} categories`);
    });

    // Show recommendation status breakdown
    const recBreakdown = await sql`
      SELECT status, COUNT(*) as count
      FROM recommendations
      GROUP BY status
      ORDER BY status
    `;

    console.log('\n📋 Recommendation Status Breakdown:');
    recBreakdown.forEach(row => {
      console.log(`   • ${row.status}: ${row.count}`);
    });

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test API endpoints:');
    console.log('      curl http://localhost:3000/api/performance-insights');
    console.log('      curl http://localhost:3000/api/cost-categories');
    console.log('      curl http://localhost:3000/api/recommendations');
    console.log('');
    console.log('   2. Build frontend components to display this data');
    console.log('   3. See visual changes in the browser!');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\n💡 Tip: Make sure you ran the migration first:');
    console.error('   node db/run-migration-002.js');
    process.exit(1);
  }
}

runSeed();
