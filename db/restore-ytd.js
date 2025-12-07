import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const categories = [
  ['acute-rehab', 'Acute Rehabilitation', 160.00, 145.00, 229500, 25.0, 6.5, 9.8, 9.0, 8.9, 'admits_per_k', 'red', true, false, 20, 20, '25.0% above benchmark', 1],
  ['op-surgical', 'OP Surgical', 194.62, 179.10, 236130, 22.0, 5.8, 22.5, 19.8, 13.6, 'procedures_per_k', 'red', true, false, 12, 20, '22.0% above benchmark', 2],
  ['ip-surgical', 'IP Surgical', 225.54, 214.00, 175620, 19.5, 4.5, 15.2, 14.5, 4.8, 'admits_per_k', 'red', true, false, 7, 20, '19.5% above benchmark', 3],
  ['inpatient-medical', 'Inpatient Medical', 237.18, 234.00, 48400, 20.7, 5.2, 58.5, 55.0, 6.4, 'admits_per_k', 'yellow', false, false, 11, 20, '20.7% above benchmark', 5],
  ['radiology', 'Radiology', 78.00, 80.00, -30440, -2.5, 2.3, 125, 128, -2.3, 'studies_per_k', 'yellow', false, false, 10, 20, 'Within 3% of benchmark', 6],
  ['lab-services', 'Lab Services', 34.00, 35.00, -15220, -2.9, -3.5, 450, 460, -2.2, 'tests_per_k', 'yellow', false, false, 9, 20, 'Within 3% of benchmark', 7],
  ['op-radiology', 'OP Radiology', 75.00, 78.00, -45660, -3.8, 1.2, 125, 135, -7.4, 'studies_per_k', 'green', false, true, 5, 20, '3.8% below benchmark', 8],
  ['avoidable-ed-visits', 'Avoidable ED visits', 85.00, 90.00, -76100, -5.6, -4.8, 180, 195, -7.7, 'visits_per_k', 'green', false, true, 1, 20, '5.6% below benchmark', 9],
  ['skilled-nursing', 'Skilled Nursing', 120.00, 128.50, -129370, -6.6, -7.2, 45, 52, -13.5, 'admits_per_k', 'green', false, true, 3, 20, '6.6% below benchmark', 10],
  ['preventive-care', 'Preventive Care', 47.20, 52.00, -73056, -3.1, 2.6, 2.8, 3.1, -9.7, 'services_per_member', 'green', false, false, 6, 20, '3.1% below benchmark', 11],
  ['generic-drugs', 'Generic Drugs', 105.73, 108.00, -31960, -2.1, -5.1, 85.2, 78.5, 8.5, 'percent_generic', 'green', false, false, 2, 20, '2.1% below benchmark', 12],
  ['primary-care', 'Primary Care', 206.01, 210.00, -60730, -1.9, 1.8, 4.2, 4.5, -6.7, 'visits_per_member', 'green', false, false, 8, 20, '1.9% below benchmark', 13],
];

const periodResult = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
const periodId = periodResult[0].id;

console.log(`Inserting ${categories.length} categories for period ID ${periodId}...\n`);

for (const cat of categories) {
  await sql`
    INSERT INTO cost_categories (
      slug, category_name, period_id,
      spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent, trend_percent,
      utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
      performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
    ) VALUES (
      ${cat[0]}, ${cat[1]}, ${periodId},
      ${cat[2]}, ${cat[3]}, ${cat[4]}, ${cat[5]}, ${cat[6]},
      ${cat[7]}, ${cat[8]}, ${cat[9]}, ${cat[10]},
      ${cat[11]}, ${cat[12]}, ${cat[13]}, ${cat[14]}, ${cat[15]}, ${cat[16]}, ${cat[17]}
    )
  `;
  console.log(`✅ ${cat[1]}`);
}

const count = await sql`SELECT COUNT(*) FROM cost_categories WHERE period_id = ${periodId}`;
console.log(`\n✅ Done! ${count[0].count} categories inserted`);

// Verify preventive care
const preventive = await sql`
  SELECT spending_variance_percent, is_strength
  FROM cost_categories
  WHERE slug = 'preventive-care' AND period_id = ${periodId}
`;
console.log(`\n🔍 Preventive Care: ${preventive[0].spending_variance_percent}%, is_strength: ${preventive[0].is_strength}`);
