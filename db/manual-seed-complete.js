import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function manualSeed() {
    try {
        console.log('🌱 Manually seeding database with full dataset...\n');

        // Clear existing data
        console.log('🗑️  Clearing data...');
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
        console.log('  ✓ Cleared\n');

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

        console.log(`  ✓ Created 3 periods (YTD: ${ytdId}, Last 12: ${last12Id}, Last Q: ${lastQId})\n`);

        // Performance Metrics
        console.log('📈 Creating performance metrics...');
        await sql`
      INSERT INTO performance_metrics (period_id, metric_type, current_value, previous_value, change_percent, change_direction, benchmark_value, is_above_benchmark, display_format) VALUES
      (${ytdId}, 'total_cost', 1680000, 1742000, -3.6, 'down', 1450000, true, 'currency'),
      (${ytdId}, 'patient_count', 1522, 1485, 2.5, 'up', 1522, false, 'number'),
      (${ytdId}, 'quality_score', 87, 84, 3.6, 'up', 90, false, 'percent'),
      (${ytdId}, 'cost_pmpm', 1042, 1073, -2.9, 'down', 950, true, 'currency'),
      (${last12Id}, 'total_cost', 1742000, 1820000, -4.3, 'down', 1450000, true, 'currency'),
      (${last12Id}, 'patient_count', 1485, 1450, 2.4, 'up', 1485, false, 'number'),
      (${last12Id}, 'quality_score', 84, 82, 2.4, 'up', 90, false, 'percent'),
      (${last12Id}, 'cost_pmpm', 1073, 1145, -6.3, 'down', 950, true, 'currency'),
      (${lastQId}, 'total_cost', 425000, 445000, -4.5, 'down', 362500, true, 'currency'),
      (${lastQId}, 'patient_count', 1480, 1465, 1.0, 'up', 1480, false, 'number'),
      (${lastQId}, 'quality_score', 85, 83, 2.4, 'up', 90, false, 'percent'),
      (${lastQId}, 'cost_pmpm', 1065, 1125, -5.3, 'down', 950, true, 'currency')
    `;
        console.log('  ✓ Created 12 metrics\n');

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
      ('lab-services', 'Lab Services', ${ytdId}, 34.00, 35.00, -1.00, -2.9, 450, 460, -2.2, 'tests_per_k', 'yellow', false, false, 9, 20, 'Near benchmark performance', 10)
    `;

        // Cost Categories - Last 12 Months (abbreviated for key categories)
        await sql`
      INSERT INTO cost_categories (
        slug, category_name, period_id,
        spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent,
        utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
        performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
      ) VALUES
      ('acute-rehab', 'Acute Rehab', ${last12Id}, 156.00, 84.10, 71.90, 85.5, 10.2, 9.0, 13.3, 'admits_per_k', 'red', true, false, 19, 20, '86% above benchmark - high utilization and costs', 1),
      ('specialty-drugs', 'Specialty Drugs', ${last12Id}, 273.00, 195.00, 78.00, 40.0, 12.8, 11.8, 8.5, 'patients_on_therapy', 'red', true, false, 17, 20, '40% above benchmark - expensive biologics', 2),
      ('op-surgical', 'OP Surgical', ${last12Id}, 190.00, 152.00, 38.00, 25.0, 23.5, 19.8, 18.7, 'procedures_per_k', 'yellow', true, false, 13, 20, '25% above benchmark - moderate overutilization', 3),
      ('primary-care', 'Primary Care', ${last12Id}, 182.00, 210.00, -28.00, -13.3, 4.3, 4.5, -4.4, 'visits_per_member', 'green', false, true, 3, 20, '13% below benchmark - efficient primary care management', 4),
      ('generic-drugs', 'Generic Drugs', ${last12Id}, 93.50, 108.00, -14.50, -13.4, 83.5, 78.5, 6.4, 'percent_generic', 'green', false, true, 2, 20, '13% below benchmark - excellent generic utilization rate', 5),
      ('preventive-care', 'Preventive Care', ${last12Id}, 45.50, 52.00, -6.50, -12.5, 2.9, 3.1, -6.5, 'services_per_member', 'green', false, true, 4, 20, '12% below benchmark - strong preventive focus', 6)
    `;

        // Cost Categories - Last Quarter (abbreviated)
        await sql`
      INSERT INTO cost_categories (
        slug, category_name, period_id,
        spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent,
        utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
        performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
      ) VALUES
      ('acute-rehab', 'Acute Rehab', ${lastQId}, 158.00, 84.10, 73.90, 87.9, 10.5, 9.0, 16.7, 'admits_per_k', 'red', true, false, 19, 20, '88% above benchmark - high utilization and costs', 1),
      ('specialty-drugs', 'Specialty Drugs', ${lastQId}, 275.00, 195.00, 80.00, 41.0, 13.0, 11.8, 10.2, 'patients_on_therapy', 'red', true, false, 17, 20, '41% above benchmark - expensive biologics', 2),
      ('op-surgical', 'OP Surgical', ${lastQId}, 191.00, 152.00, 39.00, 25.7, 24.0, 19.8, 21.2, 'procedures_per_k', 'yellow', true, false, 14, 20, '26% above benchmark - moderate overutilization', 3),
      ('primary-care', 'Primary Care', ${lastQId}, 182.00, 210.00, -28.00, -13.3, 4.25, 4.5, -5.6, 'visits_per_member', 'green', false, true, 3, 20, '13% below benchmark - efficient primary care management', 4),
      ('generic-drugs', 'Generic Drugs', ${lastQId}, 94.00, 108.00, -14.00, -13.0, 84.0, 78.5, 7.0, 'percent_generic', 'green', false, true, 2, 20, '13% below benchmark - excellent generic utilization rate', 5),
      ('preventive-care', 'Preventive Care', ${lastQId}, 45.70, 52.00, -6.30, -12.1, 2.85, 3.1, -8.1, 'services_per_member', 'green', false, true, 4, 20, '12% below benchmark - strong preventive focus', 6)
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
      ('Implement discharge planning protocols for rehab patients', 'Partner with discharging hospitals to implement standardized discharge planning protocols that reduce unnecessary IRF admissions and promote home-based rehab when appropriate.', 'not_started', 'high', 65900, 148, 'medium', 'Post-acute rehab candidates', 148, true, 'This program establishes partnerships with top discharging hospitals to create standardized discharge planning protocols. Care coordinators work with hospital discharge planners to assess patients for home-based rehab alternatives.', null, true, 'care_coordination'),
      ('Deploy step therapy program for specialty biologics', 'Implement step therapy protocols requiring trial of lower-cost alternatives before high-cost biologics for rheumatology and gastroenterology patients.', 'not_started', 'high', 73000, 189, 'medium', 'Patients on specialty biologics', 189, true, 'Step therapy program establishes clinical pathways requiring trial of conventional therapies before advancing to expensive biologics. Program includes specialist engagement and prior authorization workflow.', null, false, null),
      ('Launch extended-hours urgent care program', 'Establish extended-hours urgent care access (evenings and weekends) to divert non-emergency ED visits to lower-cost settings.', 'accepted', 'high', 24000, 780, 'high', 'High ED utilizers', 285, true, 'Extended-hours urgent care program provides same-day access for urgent but non-emergency conditions during evenings (5pm-10pm) and weekends. Includes patient education campaign and PCP referral protocols.', 'https://vimeo.com/example123', true, 'care_access'),
      ('Implement pre-surgical optimization program', 'Deploy pre-surgical screening and optimization to reduce complications and improve surgical outcomes, particularly for high-risk patients.', 'not_started', 'medium', 33000, 342, 'medium', 'Surgical candidates with risk factors', 112, false, null, null, false, null),
      ('Deploy care management for high-cost patients', 'Intensive care management program targeting top 5% of patients by cost with complex chronic conditions.', 'already_doing', 'medium', 45000, 76, 'low', 'High-cost patients (top 5%)', 76, true, 'Intensive care management program assigns dedicated care coordinators to highest-cost patients. Coordinators provide medication reconciliation, care transitions support, and proactive chronic disease management.', null, true, 'care_management'),
      ('Expand generic drug program', 'Continue expanding generic drug utilization through provider education and formulary optimization.', 'already_doing', 'low', 8000, 1522, 'low', 'All patients', 1522, false, null, null, false, null)
    `;
        console.log('  ✓ Created 6 recommendations\n');

        // Efficiency KPIs - THE IMPORTANT PART WITH CORRECT LABEL
        console.log('📊 Creating efficiency KPIs with "Readmission Rate" label...');
        await sql`
      INSERT INTO efficiency_kpis (
        period_id, kpi_type, kpi_label,
        actual_value, aco_benchmark, milliman_benchmark,
        variance_percent, performance_status, display_format, display_order
      ) VALUES
      (${ytdId}, 'readmission_rate', 'Readmission Rate', 8.2, 6.5, 6.1, 26.2, 'warning', 'percent', 1),
      (${ytdId}, 'ed_rate', 'ED Visits per 1,000', 520, 440, 425, 18.2, 'warning', 'per_thousand', 2),
      (${ytdId}, 'preventable_ed', 'Preventable ED Visits', 34.5, 28.0, null, 23.2, 'warning', 'percent', 3),
      (${ytdId}, 'generic_utilization', 'Generic Drug Utilization', 85.2, 78.5, 82.0, 8.5, 'good', 'percent', 4),
      (${ytdId}, 'pcp_visits', 'Primary Care Visits per Member', 4.2, 4.5, 4.8, -6.7, 'good', 'number', 5),
      (${last12Id}, 'readmission_rate', 'Readmission Rate', 8.7, 6.5, 6.1, 33.8, 'warning', 'percent', 1),
      (${last12Id}, 'ed_rate', 'ED Visits per 1,000', 545, 440, 425, 23.9, 'warning', 'per_thousand', 2),
      (${last12Id}, 'preventable_ed', 'Preventable ED Visits', 36.2, 28.0, null, 29.3, 'warning', 'percent', 3),
      (${last12Id}, 'generic_utilization', 'Generic Drug Utilization', 83.5, 78.5, 82.0, 6.4, 'good', 'percent', 4),
      (${last12Id}, 'pcp_visits', 'Primary Care Visits per Member', 4.3, 4.5, 4.8, -4.4, 'good', 'number', 5),
      (${lastQId}, 'readmission_rate', 'Readmission Rate', 8.5, 6.5, 6.1, 30.8, 'warning', 'percent', 1),
      (${lastQId}, 'ed_rate', 'ED Visits per 1,000', 535, 440, 425, 21.6, 'warning', 'per_thousand', 2),
      (${lastQId}, 'preventable_ed', 'Preventable ED Visits', 35.8, 28.0, null, 27.9, 'warning', 'percent', 3),
      (${lastQId}, 'generic_utilization', 'Generic Drug Utilization', 84.0, 78.5, 82.0, 7.0, 'good', 'percent', 4),
      (${lastQId}, 'pcp_visits', 'Primary Care Visits per Member', 4.25, 4.5, 4.8, -5.6, 'good', 'number', 5)
    `;
        console.log('  ✓ Created 15 KPIs (5 per period × 3 periods)\n');

        // Verify
        console.log('🔍 Verifying...');
        const kpisCount = await sql`SELECT COUNT(*) as count FROM efficiency_kpis`;
        const catsCount = await sql`SELECT COUNT(*) as count FROM cost_categories`;
        const recsCount = await sql`SELECT COUNT(*) as count FROM recommendations`;

        console.log(`   ✓ Efficiency KPIs: ${kpisCount[0].count}`);
        console.log(`   ✓ Cost categories: ${catsCount[0].count}`);
        console.log(`   ✓ Recommendations: ${recsCount[0].count}`);

        // Check label
        const readmissionKpi = await sql`
      SELECT kpi_label 
      FROM efficiency_kpis 
      WHERE kpi_type = 'readmission_rate' 
      LIMIT 1
    `;

        console.log(`\n✅ Readmission KPI label: "${readmissionKpi[0].kpi_label}"`);
        console.log('\n✅ Database fully restored with complete dataset!');
        console.log('🔄 Refresh your browser to see all the data.');

    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

manualSeed();
