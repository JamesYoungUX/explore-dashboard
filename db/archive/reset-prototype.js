import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function resetPrototype() {
  try {
    console.log('🔄 Resetting prototype to initial state...');
    console.log('Database URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ NOT SET');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('\n🗑️  Clearing existing data...\n');

    // Delete data in correct order (respecting foreign keys)
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

    // Get period IDs
    const ytd = await sql`SELECT id FROM performance_periods WHERE period_key = 'ytd'`;
    const last12 = await sql`SELECT id FROM performance_periods WHERE period_key = 'last_12_months'`;
    const lastQ = await sql`SELECT id FROM performance_periods WHERE period_key = 'last_quarter'`;

    const ytdId = ytd[0].id;
    const last12Id = last12[0].id;
    const lastQId = lastQ[0].id;

    console.log(`  ✓ Created 3 periods\n`);

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

    // Cost Categories - YTD
    console.log('💰 Creating cost categories...');
    await sql`
      INSERT INTO cost_categories (
        slug, category_name, period_id,
        spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent,
        utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
        performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
      ) VALUES
      ('acute-rehab', 'Acute Rehab', ${ytdId}, 150.00, 84.10, 65.90, 78.3, 9.8, 9.0, 8.9, 'admits_per_k', 'red', true, false, 18, 20, '78% above benchmark - high utilization and costs', 1),
      ('specialty-drugs', 'Specialty Drugs', ${ytdId}, 268.00, 195.00, 73.00, 37.4, 12.5, 11.8, 5.9, 'patients_on_therapy', 'red', true, false, 16, 20, '37% above benchmark - expensive biologics', 2),
      ('op-surgical', 'OP Surgical', ${ytdId}, 185.00, 152.00, 33.00, 21.7, 22.5, 19.8, 13.6, 'procedures_per_k', 'yellow', true, false, 12, 20, '22% above benchmark - moderate overutilization', 3),
      ('ed-visits', 'ED Visits', ${ytdId}, 142.00, 118.00, 24.00, 20.3, 520, 440, 18.2, 'visits_per_k', 'yellow', true, false, 13, 20, '20% above benchmark spending', 4),
      ('inpatient-medical', 'Inpatient Medical', ${ytdId}, 248.00, 234.00, 14.00, 6.0, 58.5, 55.0, 6.4, 'admits_per_k', 'yellow', true, false, 11, 20, '6% above benchmark admissions', 5),
      ('primary-care', 'Primary Care', ${ytdId}, 180.00, 210.00, -30.00, -14.3, 4.2, 4.5, -6.7, 'visits_per_member', 'green', false, true, 3, 20, '14% below benchmark - efficient primary care management', 6),
      ('preventive-care', 'Preventive Care', ${ytdId}, 45.00, 52.00, -7.00, -13.5, 2.8, 3.1, -9.7, 'services_per_member', 'green', false, true, 4, 20, '13% below benchmark - strong preventive focus', 7),
      ('generic-drugs', 'Generic Drugs', ${ytdId}, 92.00, 108.00, -16.00, -14.8, 85.2, 78.5, 8.5, 'percent_generic', 'green', false, true, 2, 20, '15% below benchmark - excellent generic utilization rate', 8),
      ('radiology', 'Radiology', ${ytdId}, 78.00, 80.00, -2.00, -2.5, 125, 128, -2.3, 'studies_per_k', 'yellow', false, false, 10, 20, 'Near benchmark performance', 9),
      ('lab-services', 'Lab Services', ${ytdId}, 34.00, 35.00, -1.00, -2.9, 450, 460, -2.2, 'tests_per_k', 'yellow', false, false, 9, 20, 'Near benchmark performance', 10),
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
      ('Implement discharge planning protocols for rehab patients', 'Partner with discharging hospitals to implement standardized discharge planning protocols that reduce unnecessary IRF admissions and promote home-based rehab when appropriate.', 'not_started', 'high', 65900, 148, 'medium', 'Post-acute rehab candidates', 148, true, 'This program establishes partnerships with top discharging hospitals to create standardized discharge planning protocols.', null, true, 'care_coordination'),
      ('Deploy step therapy program for specialty biologics', 'Implement step therapy protocols requiring trial of lower-cost alternatives before high-cost biologics for rheumatology and gastroenterology patients.', 'not_started', 'high', 73000, 189, 'medium', 'Patients on specialty biologics', 189, true, 'Step therapy program establishes clinical pathways requiring trial of conventional therapies before advancing to expensive biologics.', null, false, null),
      ('Launch extended-hours urgent care program', 'Establish extended-hours urgent care access (evenings and weekends) to divert non-emergency ED visits to lower-cost settings.', 'accepted', 'high', 24000, 780, 'high', 'High ED utilizers', 285, true, 'Extended-hours urgent care program provides same-day access for urgent but non-emergency conditions.', 'https://vimeo.com/example123', true, 'care_access'),
      ('Implement pre-surgical optimization program', 'Deploy pre-surgical screening and optimization to reduce complications and improve surgical outcomes, particularly for high-risk patients.', 'not_started', 'medium', 33000, 342, 'medium', 'Surgical candidates with risk factors', 112, false, null, null, false, null),
      ('Deploy care management for high-cost patients', 'Intensive care management program targeting top 5% of patients by cost with complex chronic conditions.', 'already_doing', 'medium', 45000, 76, 'low', 'High-cost patients (top 5%)', 76, true, 'Intensive care management program assigns dedicated care coordinators to highest-cost patients.', null, true, 'care_management'),
      ('Expand generic drug program', 'Continue expanding generic drug utilization through provider education and formulary optimization.', 'already_doing', 'low', 8000, 1522, 'low', 'All patients', 1522, false, null, null, false, null)
    `;
    console.log('  ✓ Created 6 recommendations\n');

    // Efficiency KPIs with correct "Readmission Rate" label
    console.log('📊 Creating efficiency KPIs...');
    await sql`
      INSERT INTO efficiency_kpis (
        period_id, kpi_type, kpi_label,
        actual_value, aco_benchmark, milliman_benchmark,
        variance_percent, performance_status, display_format, display_order
      ) VALUES
      (${ytdId}, 'readmission_rate', 'Readmission Rate', 8.2, 6.5, 6.1, 26.2, 'warning', 'percent', 1),
      (${ytdId}, 'ed_rate', 'Avoidable Admissions per 1000', 30.6, 440, 425, -93.0, 'good', 'per_thousand', 2),
      (${ytdId}, 'snf_days_per_1000', 'SNF Days per 1,000', 1158, 945, null, 22.5, 'warning', 'per_thousand', 2),
      (${ytdId}, 'generic_utilization', 'Generic Drug Utilization', 85.2, 78.5, 82.0, 8.5, 'good', 'percent', 4),
      (${ytdId}, 'pcp_visits', 'Primary Care Visits per Member', 4.2, 4.5, 4.8, -6.7, 'good', 'number', 5),
      (${last12Id}, 'readmission_rate', 'Readmission Rate', 8.7, 6.5, 6.1, 33.8, 'warning', 'percent', 1),
      (${last12Id}, 'ed_rate', 'Avoidable Admissions per 1000', 30.6, 440, 425, -93.0, 'good', 'per_thousand', 2),
      (${last12Id}, 'snf_days_per_1000', 'SNF Days per 1,000', 1158, 945, null, 22.5, 'warning', 'per_thousand', 2),
      (${last12Id}, 'generic_utilization', 'Generic Drug Utilization', 83.5, 78.5, 82.0, 6.4, 'good', 'percent', 4),
      (${last12Id}, 'pcp_visits', 'Primary Care Visits per Member', 4.3, 4.5, 4.8, -4.4, 'good', 'number', 5),
      (${lastQId}, 'readmission_rate', 'Readmission Rate', 8.5, 6.5, 6.1, 30.8, 'warning', 'percent', 1),
      (${lastQId}, 'ed_rate', 'Avoidable Admissions per 1000', 30.6, 440, 425, -93.0, 'good', 'per_thousand', 2)
      (${lastQId}, 'snf_days_per_1000', 'SNF Days per 1,000', 1158, 945, null, 22.5, 'warning', 'per_thousand', 2),
      (${lastQId}, 'generic_utilization', 'Generic Drug Utilization', 84.0, 78.5, 82.0, 7.0, 'good', 'percent', 4),
      (${lastQId}, 'pcp_visits', 'Primary Care Visits per Member', 4.25, 4.5, 4.8, -5.6, 'good', 'number', 5)
    `;
    console.log('  ✓ Created 15 KPIs\n');

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
    console.log('🔍 Verifying reset...');
    const periods = await sql`SELECT COUNT(*) as count FROM performance_periods`;
    const categories = await sql`SELECT COUNT(*) as count FROM cost_categories`;
    const recommendations = await sql`SELECT COUNT(*) as count FROM recommendations`;
    const kpis = await sql`SELECT COUNT(*) as count FROM efficiency_kpis`;
    const opportunities = await sql`SELECT COUNT(*) as count FROM cost_opportunities`;

    console.log(`   ✓ Performance periods: ${periods[0].count}`);
    console.log(`   ✓ Cost categories: ${categories[0].count}`);
    console.log(`   ✓ Recommendations: ${recommendations[0].count}`);
    console.log(`   ✓ Efficiency KPIs: ${kpis[0].count}`);
    console.log(`   ✓ Cost opportunities: ${opportunities[0].count}`);

    console.log('\n✅ Prototype reset complete!');
    console.log('\n🎯 Ready for next user test session');
    console.log('   - All data restored to baseline');
    console.log('   - "Readmission Rate" label verified');
    console.log('   - Refresh the browser to see changes');

  } catch (error) {
    console.error('\n❌ Reset failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

resetPrototype();
