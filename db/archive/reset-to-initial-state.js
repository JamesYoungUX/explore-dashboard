import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

/**
 * Resets the entire prototype database to initial state
 * This is safe to call multiple times (idempotent)
 */
export async function resetToInitialState() {
  console.log('🔄 Resetting prototype to initial state...');

  // Clear all data
  console.log('\n🗑️  Clearing existing data...');

  await sql`DELETE FROM program_resources`;
  await sql`DELETE FROM recommendation_cost_categories`;
  await sql`DELETE FROM cost_category_discharging_hospitals`;
  await sql`DELETE FROM cost_category_drgs`;
  await sql`DELETE FROM cost_category_hospitals`;
  await sql`DELETE FROM cost_opportunities`;
  await sql`DELETE FROM efficiency_kpis`;
  await sql`DELETE FROM recommendations`;
  await sql`DELETE FROM cost_categories`;
  await sql`DELETE FROM performance_metrics`;
  await sql`DELETE FROM performance_periods`;

  console.log('  ✓ All data cleared\n');

  // Performance Periods
  console.log('📊 Creating performance periods...');
  await sql`
    INSERT INTO performance_periods (period_key, period_label, start_date, end_date, is_active) VALUES
    ('ytd', 'Year to Date', '2025-01-01', '2025-12-31', true),
    ('last_12_months', 'Last 12 Months', '2024-01-01', '2024-12-31', false),
    ('last_quarter', 'Last Quarter', '2024-10-01', '2024-12-31', false)
  `;

  const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
  const last12 = await sql`SELECT id FROM performance_periods WHERE period_key = 'last_12_months'`;
  const lastQ = await sql`SELECT id FROM performance_periods WHERE period_key = 'last_quarter'`;

  const ytdId = ytd[0].id;
  const last12Id = last12[0].id;
  const lastQId = lastQ[0].id;

  console.log('  ✓ Created 3 periods\n');

  // Performance Metrics
  console.log('📈 Creating performance metrics...');
  await sql`
    INSERT INTO performance_metrics (period_id, metric_type, current_value, previous_value, change_percent, change_direction, benchmark_value, is_above_benchmark, display_format) VALUES
    (${ytdId}, 'patient_count', 1522, 1485, 2.5, 'up', 1522, false, 'number'),
    (${ytdId}, 'risk_score', 1.08, 1.085, -0.5, 'down', 1.0, true, 'number'),
    (${ytdId}, 'cost_pmpm', 1080, 1053, 2.6, 'up', 950, true, 'currency'),
    (${ytdId}, 'total_cost', 4980760, 4840000, 2.9, 'up', 1450000, true, 'currency'),
    (${ytdId}, 'cost_savings_opportunity', 750000, 765000, -2.1, 'down', 500000, true, 'currency'),
    (${last12Id}, 'patient_count', 1485, 1450, 2.4, 'up', 1485, false, 'number'),
    (${last12Id}, 'risk_score', 1.08, 1.085, -0.5, 'down', 1.0, true, 'number'),
    (${last12Id}, 'cost_pmpm', 1080, 1053, 2.6, 'up', 950, true, 'currency'),
    (${last12Id}, 'total_cost', 4980760, 4840000, 2.9, 'up', 1450000, true, 'currency'),
    (${last12Id}, 'cost_savings_opportunity', 765000, 800000, -4.4, 'down', 500000, true, 'currency'),
    (${lastQId}, 'patient_count', 1480, 1465, 1.0, 'up', 1480, false, 'number'),
    (${lastQId}, 'risk_score', 1.08, 1.085, -0.5, 'down', 1.0, true, 'number'),
    (${lastQId}, 'cost_pmpm', 1080, 1053, 2.6, 'up', 950, true, 'currency'),
    (${lastQId}, 'total_cost', 4980760, 4840000, 2.9, 'up', 1450000, true, 'currency'),
    (${lastQId}, 'cost_savings_opportunity', 190000, 200000, -5.0, 'down', 125000, true, 'currency')
  `;
  console.log('  ✓ Created 15 metrics\n');

  // Cost Categories
  console.log('💰 Creating cost categories...');
  await sql`
    INSERT INTO cost_categories (
      slug, category_name, period_id,
      spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent,
      utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
      performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
    ) VALUES
    ('acute-rehab', 'Acute Rehab', ${ytdId}, 150.00, 84.10, 65.90, 78.3, 9.8, 9.0, 8.9, 'admits_per_k', 'red', true, false, 18, 20, '78% above benchmark', 1),
    ('specialty-drugs', 'Specialty Drugs', ${ytdId}, 268.00, 195.00, 73.00, 37.4, 12.5, 11.8, 5.9, 'patients_on_therapy', 'red', true, false, 16, 20, '37% above benchmark', 2),
    ('op-surgical', 'OP Surgical', ${ytdId}, 185.00, 152.00, 33.00, 21.7, 22.5, 19.8, 13.6, 'procedures_per_k', 'yellow', true, false, 12, 20, '22% above benchmark', 3),
    ('ed-visits', 'ED Visits', ${ytdId}, 142.00, 118.00, 24.00, 20.3, 520, 440, 18.2, 'visits_per_k', 'yellow', true, false, 13, 20, '20% above benchmark', 4),
    ('inpatient-medical', 'Inpatient Medical', ${ytdId}, 248.00, 234.00, 14.00, 6.0, 58.5, 55.0, 6.4, 'admits_per_k', 'yellow', true, false, 11, 20, '6% above benchmark', 5),
    ('primary-care', 'Primary Care', ${ytdId}, 180.00, 210.00, -30.00, -14.3, 4.2, 4.5, -6.7, 'visits_per_member', 'green', false, true, 3, 20, '14% below benchmark', 6),
    ('preventive-care', 'Preventive Care', ${ytdId}, 45.00, 52.00, -7.00, -13.5, 2.8, 3.1, -9.7, 'services_per_member', 'green', false, true, 4, 20, '13% below benchmark', 7),
    ('generic-drugs', 'Generic Drugs', ${ytdId}, 92.00, 108.00, -16.00, -14.8, 85.2, 78.5, 8.5, 'percent_generic', 'green', false, true, 2, 20, '15% below benchmark', 8),
    ('radiology', 'Radiology', ${ytdId}, 78.00, 80.00, -2.00, -2.5, 125, 128, -2.3, 'studies_per_k', 'yellow', false, false, 10, 20, 'Near benchmark', 9),
    ('lab-services', 'Lab Services', ${ytdId}, 34.00, 35.00, -1.00, -2.9, 450, 460, -2.2, 'tests_per_k', 'yellow', false, false, 9, 20, 'Near benchmark', 10),
    ('acute-rehab', 'Acute Rehab', ${last12Id}, 156.00, 84.10, 71.90, 85.5, 10.2, 9.0, 13.3, 'admits_per_k', 'red', true, false, 19, 20, '86% above benchmark', 1),
    ('specialty-drugs', 'Specialty Drugs', ${last12Id}, 273.00, 195.00, 78.00, 40.0, 12.8, 11.8, 8.5, 'patients_on_therapy', 'red', true, false, 17, 20, '40% above benchmark', 2),
    ('op-surgical', 'OP Surgical', ${last12Id}, 190.00, 152.00, 38.00, 25.0, 23.5, 19.8, 18.7, 'procedures_per_k', 'yellow', true, false, 13, 20, '25% above benchmark', 3),
    ('primary-care', 'Primary Care', ${last12Id}, 182.00, 210.00, -28.00, -13.3, 4.3, 4.5, -4.4, 'visits_per_member', 'green', false, true, 3, 20, '13% below benchmark', 4),
    ('generic-drugs', 'Generic Drugs', ${last12Id}, 93.50, 108.00, -14.50, -13.4, 83.5, 78.5, 6.4, 'percent_generic', 'green', false, true, 2, 20, '13% below benchmark', 5),
    ('preventive-care', 'Preventive Care', ${last12Id}, 45.50, 52.00, -6.50, -12.5, 2.9, 3.1, -6.5, 'services_per_member', 'green', false, true, 4, 20, '12% below benchmark', 6),
    ('acute-rehab', 'Acute Rehab', ${lastQId}, 158.00, 84.10, 73.90, 87.9, 10.5, 9.0, 16.7, 'admits_per_k', 'red', true, false, 19, 20, '88% above benchmark', 1),
    ('specialty-drugs', 'Specialty Drugs', ${lastQId}, 275.00, 195.00, 80.00, 41.0, 13.0, 11.8, 10.2, 'patients_on_therapy', 'red', true, false, 17, 20, '41% above benchmark', 2),
    ('op-surgical', 'OP Surgical', ${lastQId}, 191.00, 152.00, 39.00, 25.7, 24.0, 19.8, 21.2, 'procedures_per_k', 'yellow', true, false, 14, 20, '26% above benchmark', 3),
    ('primary-care', 'Primary Care', ${lastQId}, 182.00, 210.00, -28.00, -13.3, 4.25, 4.5, -5.6, 'visits_per_member', 'green', false, true, 3, 20, '13% below benchmark', 4),
    ('generic-drugs', 'Generic Drugs', ${lastQId}, 94.00, 108.00, -14.00, -13.0, 84.0, 78.5, 7.0, 'percent_generic', 'green', false, true, 2, 20, '13% below benchmark', 5),
    ('preventive-care', 'Preventive Care', ${lastQId}, 45.70, 52.00, -6.30, -12.1, 2.85, 3.1, -8.1, 'services_per_member', 'green', false, true, 4, 20, '12% below benchmark', 6)
  `;
  console.log('  ✓ Created 22 cost categories\n');

  // Recommendations
  console.log('📋 Creating recommendations...');
  await sql`
    INSERT INTO recommendations (
      title, description, status, priority,
      estimated_savings, affected_lives, implementation_complexity,
      patient_cohort, cohort_size,
      has_program_details, program_overview, video_url,
      can_convert_to_workflow, workflow_type
    ) VALUES
    ('Implement a care management program', 'Deploy intensive care management program targeting high-risk patients to reduce avoidable admissions and improve care coordination.', 'not_started', 'high', 350000, 39, 'medium', 'High need patients', 39, true, 'This care management program identifies high-risk patients prone to avoidable admissions and provides intensive care coordination, including regular check-ins, medication management, and care plan development.', null, true, 'care_management'),
    ('Refer patients with dementia to GUIDE program', 'Enroll eligible dementia patients in the GUIDE program for comprehensive care management and caregiver support.', 'not_started', 'high', 120000, 87, 'low', 'Patients with dementia', 87, true, 'The GUIDE program provides comprehensive dementia care management including care coordination, caregiver education and support, and 24/7 access to a care team.', null, true, 'care_coordination'),
    ('Implement discharge planning protocols for rehab patients', 'Partner with discharging hospitals to implement standardized discharge planning protocols.', 'not_started', 'high', 65900, 148, 'medium', 'Post-acute rehab candidates', 148, true, 'This program establishes partnerships with top discharging hospitals.', null, true, 'care_coordination'),
    ('Launch extended-hours urgent care program', 'Establish extended-hours urgent care access to divert non-emergency ED visits.', 'accepted', 'high', 24000, 780, 'high', 'High ED utilizers', 285, true, 'Extended-hours urgent care program provides same-day access.', 'https://vimeo.com/example123', true, 'care_access'),
    ('Implement pre-surgical optimization program', 'Deploy pre-surgical screening and optimization.', 'not_started', 'medium', 33000, 342, 'medium', 'Surgical candidates', 112, false, null, null, false, null),
    ('Expand generic drug program', 'Continue expanding generic drug utilization.', 'already_doing', 'low', 8000, 1522, 'low', 'All patients', 1522, false, null, null, false, null)
  `;
  console.log('  ✓ Created 6 recommendations\n');

  // Efficiency KPIs with "Readmission Rate" label
  console.log('📊 Creating efficiency KPIs...');
  await sql`
    INSERT INTO efficiency_kpis (
      period_id, kpi_type, kpi_label,
      actual_value, aco_benchmark, milliman_benchmark,
      variance_percent, performance_status, display_format, display_order, aco_rank
    ) VALUES
    (${ytdId}, 'readmission_rate', 'Readmission Rate', 8.2, 6.5, 6.1, 26.2, 'warning', 'percent', 1, 18),
    (${ytdId}, 'ed_rate', 'Avoidable Admissions per 1000', 35.3, 26.8, null, 31.7, 'bad', 'per_thousand', 2, 28),
    (${ytdId}, 'snf_days_per_1000', 'SNF Days per 1,000', 1158, 945, null, 22.5, 'warning', 'per_thousand', 3, 15),
    (${ytdId}, 'avoidable_ed_visits', 'Avoidable ED visits per 1000', 20.1, 21.97, null, -8.5, 'good', 'per_thousand', 4, 3),
    (${ytdId}, 'imaging_lower_back', 'Imaging for lower back per 1000', 7.7, 8.5, null, -9.41, 'good', 'per_thousand', 5, 8),
    (${ytdId}, 'annual_wellness_visits', 'Annual wellness visits per 1000', 802, 794, null, 1.01, 'good', 'per_thousand', 6, 5),
    (${last12Id}, 'readmission_rate', 'Readmission Rate', 8.7, 6.5, 6.1, 33.8, 'warning', 'percent', 1, 18),
    (${last12Id}, 'ed_rate', 'Avoidable Admissions per 1000', 35.3, 26.8, null, 31.7, 'bad', 'per_thousand', 2, 28),
    (${last12Id}, 'snf_days_per_1000', 'SNF Days per 1,000', 1158, 945, null, 22.5, 'warning', 'per_thousand', 3, 15),
    (${last12Id}, 'avoidable_ed_visits', 'Avoidable ED visits per 1000', 20.1, 21.97, null, -8.5, 'good', 'per_thousand', 4, 3),
    (${last12Id}, 'imaging_lower_back', 'Imaging for lower back per 1000', 7.7, 8.5, null, -9.41, 'good', 'per_thousand', 5, 8),
    (${last12Id}, 'annual_wellness_visits', 'Annual wellness visits per 1000', 802, 794, null, 1.01, 'good', 'per_thousand', 6, 5),
    (${lastQId}, 'readmission_rate', 'Readmission Rate', 8.5, 6.5, 6.1, 30.8, 'warning', 'percent', 1, 18),
    (${lastQId}, 'ed_rate', 'Avoidable Admissions per 1000', 35.3, 26.8, null, 31.7, 'bad', 'per_thousand', 2, 28),
    (${lastQId}, 'snf_days_per_1000', 'SNF Days per 1,000', 1158, 945, null, 22.5, 'warning', 'per_thousand', 3, 15),
    (${lastQId}, 'avoidable_ed_visits', 'Avoidable ED visits per 1000', 20.1, 21.97, null, -8.5, 'good', 'per_thousand', 4, 3),
    (${lastQId}, 'imaging_lower_back', 'Imaging for lower back per 1000', 7.7, 8.5, null, -9.41, 'good', 'per_thousand', 5, 8),
    (${lastQId}, 'annual_wellness_visits', 'Annual wellness visits per 1000', 802, 794, null, 1.01, 'good', 'per_thousand', 6, 5)
  `;
  console.log('  ✓ Created 18 KPIs\n');

  // Cost Opportunities
  console.log('💰 Creating cost opportunities...');
  const acuteRehab = await sql`SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = ${ytdId}`;
  const specialtyDrugs = await sql`SELECT id FROM cost_categories WHERE slug = 'specialty-drugs' AND period_id = ${ytdId}`;
  const opSurgical = await sql`SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = ${ytdId}`;
  const primaryCare = await sql`SELECT id FROM cost_categories WHERE slug = 'primary-care' AND period_id = ${ytdId}`;
  const genericDrugs = await sql`SELECT id FROM cost_categories WHERE slug = 'generic-drugs' AND period_id = ${ytdId}`;
  const preventiveCare = await sql`SELECT id FROM cost_categories WHERE slug = 'preventive-care' AND period_id = ${ytdId}`;

  await sql`
    INSERT INTO cost_opportunities (
      period_id, cost_category_id, opportunity_type,
      amount_variance, percent_variance, aco_rank, display_order, show_on_dashboard
    ) VALUES
    (${ytdId}, ${acuteRehab[0].id}, 'overspending', 65900, 78.3, 18, 1, true),
    (${ytdId}, ${specialtyDrugs[0].id}, 'overspending', 73000, 37.4, 16, 2, true),
    (${ytdId}, ${opSurgical[0].id}, 'overspending', 33000, 21.7, 12, 3, true),
    (${ytdId}, ${primaryCare[0].id}, 'efficient', -30000, -14.3, 3, 4, true),
    (${ytdId}, ${genericDrugs[0].id}, 'efficient', -16000, -14.8, 2, 5, true),
    (${ytdId}, ${preventiveCare[0].id}, 'efficient', -7000, -13.5, 4, 6, true)
  `;
  console.log('  ✓ Created 6 cost opportunities\n');

  // Verify
  const recCount = await sql`SELECT COUNT(*) as count FROM recommendations`;
  const catCount = await sql`SELECT COUNT(*) as count FROM cost_categories`;
  const kpiCount = await sql`SELECT COUNT(*) as count FROM efficiency_kpis`;

  console.log('✅ Reset complete!');
  console.log(`   ✓ Recommendations: ${recCount[0].count}`);
  console.log(`   ✓ Cost categories: ${catCount[0].count}`);
  console.log(`   ✓ Efficiency KPIs: ${kpiCount[0].count}`);

  return {
    success: true,
    recommendations: recCount[0].count,
    categories: catCount[0].count,
    kpis: kpiCount[0].count
  };
}

// If run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  resetToInitialState()
    .then(() => {
      console.log('\n🎯 Ready for next user test session');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Reset failed:', error.message);
      process.exit(1);
    });
}
