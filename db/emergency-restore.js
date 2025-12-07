import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function emergencyRestore() {
  try {
    const seedSQL = readFileSync('./db/seed-v2.sql', 'utf-8');
    const lines = seedSQL.split('\n');

    // Extract each INSERT section
    let currentSection = [];
    let inInsert = false;
    const sections = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('INSERT INTO')) {
        if (currentSection.length > 0) {
          sections.push(currentSection.join('\n'));
        }
        currentSection = [lines[i]];
        inInsert = true;
      } else if (inInsert) {
        currentSection.push(lines[i]);
        if (line.endsWith(');')) {
          sections.push(currentSection.join('\n'));
          currentSection = [];
          inInsert = false;
        }
      }
    }

    console.log(`Found ${sections.length} INSERT sections\n`);

    // Execute each section
    let successCount = 0;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (section.length < 20) continue;

      try {
        await sql.unsafe(section);
        successCount++;
        const tableName = section.match(/INSERT INTO (\w+)/)?.[1];
        console.log(`✅ ${i + 1}. ${tableName}`);
      } catch (err) {
        const tableName = section.match(/INSERT INTO (\w+)/)?.[1];
        console.error(`❌ ${i + 1}. ${tableName}: ${err.message}`);
      }
    }

    console.log(`\n✅ Restored ${successCount}/${sections.length} sections`);

    // Verify
    const kpis = await sql`SELECT COUNT(*) FROM efficiency_kpis`;
    const recs = await sql`SELECT COUNT(*) FROM recommendations`;
    const cats = await sql`SELECT COUNT(*) FROM cost_categories WHERE period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')`;

    console.log(`\nVerification:`);
    console.log(`  efficiency_kpis: ${kpis[0].count}`);
    console.log(`  recommendations: ${recs[0].count}`);
    console.log(`  cost_categories (ytd): ${cats[0].count}`);

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

emergencyRestore();
