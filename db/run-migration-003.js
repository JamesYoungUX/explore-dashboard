import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🔄 Running migration 003: Add acknowledged status and measurable tracking...');
    console.log('Database URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ NOT SET');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log(`\n📝 Executing migration statements...\n`);

    // Step 1: Add is_measurable column
    try {
      await sql`ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS is_measurable BOOLEAN DEFAULT true`;
      console.log(`  ✓ Added is_measurable column to recommendations table`);
    } catch (err) {
      if (!err.message.includes('already exists')) throw err;
      console.log(`  ⚠ is_measurable column already exists`);
    }

    // Step 2: Drop old constraint
    try {
      await sql`ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_status_check`;
      console.log(`  ✓ Dropped old status constraint`);
    } catch (err) {
      console.log(`  ⚠ Status constraint doesn't exist or already dropped`);
    }

    // Step 3: Add new constraint with 'acknowledged'
    await sql`
      ALTER TABLE recommendations
      ADD CONSTRAINT recommendations_status_check
      CHECK (status IN ('not_started', 'acknowledged', 'accepted', 'rejected', 'already_doing', 'in_progress', 'completed'))
    `;
    console.log(`  ✓ Added new status constraint with 'acknowledged'`);

    // Step 4: Update measurable recommendations
    await sql`
      UPDATE recommendations
      SET is_measurable = true
      WHERE title ILIKE ANY (ARRAY[
        '%readmission%',
        '%care gap%',
        '%medication%',
        '%adherence%',
        '%ed visit%',
        '%emergency%',
        '%utilization%',
        '%care management%',
        '%quality%',
        '%screening%'
      ])
    `;
    console.log(`  ✓ Marked measurable recommendations (ACO software tracked)`);

    // Step 5: Update external recommendations
    await sql`
      UPDATE recommendations
      SET is_measurable = false
      WHERE title ILIKE ANY (ARRAY[
        '%clinic hours%',
        '%renegotiate%',
        '%contract%',
        '%negotiate%',
        '%staffing%',
        '%hire%',
        '%partner%',
        '%facility%'
      ])
    `;
    console.log(`  ✓ Marked external recommendations (outside ACO tracking)`);

    // Step 6: Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_recommendations_is_measurable ON recommendations(is_measurable)`;
    console.log(`  ✓ Created index on is_measurable`);

    await sql`CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status)`;
    console.log(`  ✓ Created index on status`);

    // Verify the changes
    console.log('\n🔍 Verifying changes...');

    const measurableCount = await sql`
      SELECT COUNT(*) as count FROM recommendations WHERE is_measurable = true
    `;
    console.log(`   ✓ Measurable recommendations: ${measurableCount[0].count}`);

    const externalCount = await sql`
      SELECT COUNT(*) as count FROM recommendations WHERE is_measurable = false
    `;
    console.log(`   ✓ External recommendations: ${externalCount[0].count}`);

    const statusBreakdown = await sql`
      SELECT status, COUNT(*) as count
      FROM recommendations
      GROUP BY status
      ORDER BY status
    `;

    console.log('\n📊 Status Breakdown:');
    statusBreakdown.forEach(row => {
      console.log(`   • ${row.status}: ${row.count}`);
    });

    console.log('\n✅ Migration 003 completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update TypeScript types to include "acknowledged" status');
    console.log('   2. Add PATCH endpoint to update recommendation status');
    console.log('   3. Build Progress Tracking component');
    console.log('   4. Update Recommendations component with status actions');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runMigration();
