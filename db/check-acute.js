import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const result = await sql`
  SELECT slug, spending_pmpm_actual, utilization_actual, spending_variance_percent, is_opportunity
  FROM cost_categories
  WHERE slug = 'acute-rehab'
  AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
`;

console.log('Acute Rehab in database:');
console.log(JSON.stringify(result, null, 2));

console.log('\nExpected from seed-v2.sql:');
console.log('spending_pmpm_actual: 160.00');
console.log('utilization_actual: 9.8');
console.log('spending_variance_percent: 25.0');
console.log('is_opportunity: true');
