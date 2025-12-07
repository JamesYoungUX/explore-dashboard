import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const result = await sql`
  SELECT slug, spending_pmpm_actual, spending_variance_percent, is_strength, display_order, description
  FROM cost_categories
  WHERE slug = 'preventive-care'
  AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')
`;

console.log('Preventive Care in database:');
console.log(JSON.stringify(result, null, 2));
