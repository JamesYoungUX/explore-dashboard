import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function testInsert() {
  try {
    console.log('Testing INSERT...');

    // First make sure we have performance periods
    const periods = await sql`SELECT * FROM performance_periods WHERE period_key = 'ytd'`;
    console.log(`Period ID for YTD: ${periods[0]?.id || 'NOT FOUND'}`);

    if (!periods[0]) {
      console.log('❌ No YTD period found! Need to insert periods first.');
      return;
    }

    // Try a simple INSERT
    await sql`
      INSERT INTO cost_categories (
        slug, category_name, period_id,
        spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent, trend_percent,
        utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
        performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
      ) VALUES (
        'test-category', 'Test Category', ${periods[0].id},
        100.00, 110.00, -10000, -9.1, 2.5,
        5.0, 6.0, -16.7, 'visits_per_k',
        'green', false, false, 10, 20, 'Test description', 999
      )
    `;

    console.log('✅ INSERT successful!');

    // Check if it was inserted
    const inserted = await sql`SELECT * FROM cost_categories WHERE slug = 'test-category'`;
    console.log(`Inserted row: ${JSON.stringify(inserted[0], null, 2)}`);

  } catch (error) {
    console.error('❌ INSERT failed:', error.message);
    console.error(error);
  }
}

testInsert();
