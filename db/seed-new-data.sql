-- Seed Data for Leadership Feedback Tables
-- Created: 2025-12-04
-- Description: Realistic sample data showing red/yellow/GREEN categories

-- Clear existing data from new tables (idempotent)
-- Use TRUNCATE to reset sequences for proper ID assignment
TRUNCATE TABLE cost_category_discharging_hospitals RESTART IDENTITY CASCADE;
TRUNCATE TABLE cost_category_drgs RESTART IDENTITY CASCADE;
TRUNCATE TABLE cost_category_hospitals RESTART IDENTITY CASCADE;
TRUNCATE TABLE cost_opportunities RESTART IDENTITY CASCADE;
TRUNCATE TABLE efficiency_kpis RESTART IDENTITY CASCADE;
TRUNCATE TABLE program_resources RESTART IDENTITY CASCADE;
TRUNCATE TABLE recommendation_cost_categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE recommendations RESTART IDENTITY CASCADE;
TRUNCATE TABLE cost_categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE performance_metrics RESTART IDENTITY CASCADE;
TRUNCATE TABLE performance_periods RESTART IDENTITY CASCADE;

-- ============================================================================
-- PERFORMANCE PERIODS
-- ============================================================================
INSERT INTO performance_periods (period_key, period_label, start_date, end_date, is_active) VALUES
('ytd', 'Year to Date', '2025-01-01', '2025-12-31', true),
('last_12_months', 'Last 12 Months', '2024-01-01', '2024-12-31', false),
('last_quarter', 'Last Quarter', '2024-10-01', '2024-12-31', false);

-- ============================================================================
-- PERFORMANCE METRICS (Top-level metrics)
-- ============================================================================
INSERT INTO performance_metrics (period_id, metric_type, current_value, previous_value, change_percent, change_direction, benchmark_value, is_above_benchmark, display_format) VALUES
-- YTD period metrics
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'total_cost', 1680000, 1742000, -3.6, 'down', 1450000, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'patient_count', 1522, 1485, 2.5, 'up', 1522, false, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'quality_score', 87, 84, 3.6, 'up', 90, false, 'percent'),
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'cost_pmpm', 1042, 1073, -2.9, 'down', 950, true, 'currency'),

-- Last 12 Months period metrics
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'total_cost', 1742000, 1820000, -4.3, 'down', 1450000, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'patient_count', 1485, 1450, 2.4, 'up', 1485, false, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'quality_score', 84, 82, 2.4, 'up', 90, false, 'percent'),
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'cost_pmpm', 1073, 1145, -6.3, 'down', 950, true, 'currency'),

-- Last Quarter period metrics
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'total_cost', 425000, 445000, -4.5, 'down', 362500, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'patient_count', 1480, 1465, 1.0, 'up', 1480, false, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'quality_score', 85, 83, 2.4, 'up', 90, false, 'percent'),
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'cost_pmpm', 1065, 1125, -5.3, 'down', 950, true, 'currency');

-- ============================================================================
-- COST CATEGORIES (Showing RED, YELLOW, and GREEN)
-- ============================================================================
INSERT INTO cost_categories (
  slug, category_name, period_id,
  spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent,
  utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
  performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
) VALUES
-- RED - Priority Issues (Overspending)
('acute-rehab', 'Acute Rehab', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  150.00, 84.10, 65.90, 78.3,
  9.8, 9.0, 8.9, 'admits_per_k',
  'red', true, false, 18, 20, '78% above benchmark - high utilization and costs', 1),

('specialty-drugs', 'Specialty Drugs', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  268.00, 195.00, 73.00, 37.4,
  12.5, 11.8, 5.9, 'patients_on_therapy',
  'red', true, false, 16, 20, '37% above benchmark - expensive biologics', 2),

-- YELLOW - Opportunities (Moderate Issues)
('op-surgical', 'OP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  185.00, 152.00, 33.00, 21.7,
  22.5, 19.8, 13.6, 'procedures_per_k',
  'yellow', true, false, 12, 20, '22% above benchmark - moderate overutilization', 3),

('ed-visits', 'ED Visits', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  142.00, 118.00, 24.00, 20.3,
  520, 440, 18.2, 'visits_per_k',
  'yellow', true, false, 13, 20, '20% above benchmark spending', 4),

('inpatient-medical', 'Inpatient Medical', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  248.00, 234.00, 14.00, 6.0,
  58.5, 55.0, 6.4, 'admits_per_k',
  'yellow', true, false, 11, 20, '6% above benchmark admissions', 5),

-- GREEN - Strengths (Performing Well / Saving Money!)
('primary-care', 'Primary Care', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  180.00, 210.00, -30.00, -14.3,
  4.2, 4.5, -6.7, 'visits_per_member',
  'green', false, true, 3, 20, '14% below benchmark - efficient primary care management', 6),

('preventive-care', 'Preventive Care', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  45.00, 52.00, -7.00, -13.5,
  2.8, 3.1, -9.7, 'services_per_member',
  'green', false, true, 4, 20, '13% below benchmark - strong preventive focus', 7),

('generic-drugs', 'Generic Drugs', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  92.00, 108.00, -16.00, -14.8,
  85.2, 78.5, 8.5, 'percent_generic',
  'green', false, true, 2, 20, '15% below benchmark - excellent generic utilization rate', 8),

-- NEUTRAL - Performing at Benchmark
('radiology', 'Radiology', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  78.00, 80.00, -2.00, -2.5,
  125, 128, -2.3, 'studies_per_k',
  'yellow', false, false, 10, 20, 'Near benchmark performance', 9),

('lab-services', 'Lab Services', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  34.00, 35.00, -1.00, -2.9,
  450, 460, -2.2, 'tests_per_k',
  'yellow', false, false, 9, 20, 'Near benchmark performance', 10),

-- ============================================================================
-- COST CATEGORIES for Last 12 Months
-- ============================================================================
('acute-rehab', 'Acute Rehab', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  156.00, 84.10, 71.90, 85.5,
  10.2, 9.0, 13.3, 'admits_per_k',
  'red', true, false, 19, 20, '86% above benchmark - high utilization and costs', 1),

('specialty-drugs', 'Specialty Drugs', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  273.00, 195.00, 78.00, 40.0,
  12.8, 11.8, 8.5, 'patients_on_therapy',
  'red', true, false, 17, 20, '40% above benchmark - expensive biologics', 2),

('op-surgical', 'OP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  190.00, 152.00, 38.00, 25.0,
  23.5, 19.8, 18.7, 'procedures_per_k',
  'yellow', true, false, 13, 20, '25% above benchmark - moderate overutilization', 3),

('primary-care', 'Primary Care', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  182.00, 210.00, -28.00, -13.3,
  4.3, 4.5, -4.4, 'visits_per_member',
  'green', false, true, 3, 20, '13% below benchmark - efficient primary care management', 4),

('generic-drugs', 'Generic Drugs', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  93.50, 108.00, -14.50, -13.4,
  83.5, 78.5, 6.4, 'percent_generic',
  'green', false, true, 2, 20, '13% below benchmark - excellent generic utilization rate', 5),

('preventive-care', 'Preventive Care', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  45.50, 52.00, -6.50, -12.5,
  2.9, 3.1, -6.5, 'services_per_member',
  'green', false, true, 4, 20, '12% below benchmark - strong preventive focus', 6),

-- ============================================================================
-- COST CATEGORIES for Last Quarter
-- ============================================================================
('acute-rehab', 'Acute Rehab', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  158.00, 84.10, 73.90, 87.9,
  10.5, 9.0, 16.7, 'admits_per_k',
  'red', true, false, 19, 20, '88% above benchmark - high utilization and costs', 1),

('specialty-drugs', 'Specialty Drugs', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  275.00, 195.00, 80.00, 41.0,
  13.0, 11.8, 10.2, 'patients_on_therapy',
  'red', true, false, 17, 20, '41% above benchmark - expensive biologics', 2),

('op-surgical', 'OP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  191.00, 152.00, 39.00, 25.7,
  24.0, 19.8, 21.2, 'procedures_per_k',
  'yellow', true, false, 14, 20, '26% above benchmark - moderate overutilization', 3),

('primary-care', 'Primary Care', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  182.00, 210.00, -28.00, -13.3,
  4.25, 4.5, -5.6, 'visits_per_member',
  'green', false, true, 3, 20, '13% below benchmark - efficient primary care management', 4),

('generic-drugs', 'Generic Drugs', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  94.00, 108.00, -14.00, -13.0,
  84.0, 78.5, 7.0, 'percent_generic',
  'green', false, true, 2, 20, '13% below benchmark - excellent generic utilization rate', 5),

('preventive-care', 'Preventive Care', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  45.70, 52.00, -6.30, -12.1,
  2.85, 3.1, -8.1, 'services_per_member',
  'green', false, true, 4, 20, '12% below benchmark - strong preventive focus', 6);

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================
INSERT INTO recommendations (
  title, description, status, priority,
  estimated_savings, affected_lives, implementation_complexity,
  patient_cohort, cohort_size,
  has_program_details, program_overview, video_url,
  can_convert_to_workflow, workflow_type
) VALUES
-- High Priority
('Implement discharge planning protocols for rehab patients',
  'Partner with discharging hospitals to implement standardized discharge planning protocols that reduce unnecessary IRF admissions and promote home-based rehab when appropriate.',
  'not_started', 'high',
  65900, 148, 'medium',
  'Post-acute rehab candidates', 148,
  true,
  'This program establishes partnerships with top discharging hospitals to create standardized discharge planning protocols. Care coordinators work with hospital discharge planners to assess patients for home-based rehab alternatives.',
  null,
  true, 'care_coordination'),

('Deploy step therapy program for specialty biologics',
  'Implement step therapy protocols requiring trial of lower-cost alternatives before high-cost biologics for rheumatology and gastroenterology patients.',
  'not_started', 'high',
  73000, 189, 'medium',
  'Patients on specialty biologics', 189,
  true,
  'Step therapy program establishes clinical pathways requiring trial of conventional therapies before advancing to expensive biologics. Program includes specialist engagement and prior authorization workflow.',
  null,
  false, null),

('Launch extended-hours urgent care program',
  'Establish extended-hours urgent care access (evenings and weekends) to divert non-emergency ED visits to lower-cost settings.',
  'accepted', 'high',
  24000, 780, 'high',
  'High ED utilizers', 285,
  true,
  'Extended-hours urgent care program provides same-day access for urgent but non-emergency conditions during evenings (5pm-10pm) and weekends. Includes patient education campaign and PCP referral protocols.',
  'https://vimeo.com/example123',
  true, 'care_access'),

-- Medium Priority
('Implement pre-surgical optimization program',
  'Deploy pre-surgical screening and optimization to reduce complications and improve surgical outcomes, particularly for high-risk patients.',
  'not_started', 'medium',
  33000, 342, 'medium',
  'Surgical candidates with risk factors', 112,
  false, null, null,
  false, null),

('Deploy care management for high-cost patients',
  'Intensive care management program targeting top 5% of patients by cost with complex chronic conditions.',
  'already_doing', 'medium',
  45000, 76, 'low',
  'High-cost patients (top 5%)', 76,
  true,
  'Intensive care management program assigns dedicated care coordinators to highest-cost patients. Coordinators provide medication reconciliation, care transitions support, and proactive chronic disease management.',
  null,
  true, 'care_management'),

-- Low Priority (Already doing well, but could optimize further)
('Expand generic drug program',
  'Continue expanding generic drug utilization through provider education and formulary optimization.',
  'already_doing', 'low',
  8000, 1522, 'low',
  'All patients', 1522,
  false, null, null,
  false, null);

-- ============================================================================
-- RECOMMENDATION COST CATEGORIES (Many-to-Many Mapping)
-- ============================================================================
INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount) VALUES
-- Discharge planning → Acute Rehab
(1, (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 65900),

-- Step therapy → Specialty Drugs
(2, (SELECT id FROM cost_categories WHERE slug = 'specialty-drugs' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 73000),

-- Urgent care → ED Visits
(3, (SELECT id FROM cost_categories WHERE slug = 'ed-visits' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 24000),

-- Pre-surgical optimization → OP Surgical + Inpatient Medical
(4, (SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 18000),
(4, (SELECT id FROM cost_categories WHERE slug = 'inpatient-medical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 15000),

-- Care management → Multiple categories
(5, (SELECT id FROM cost_categories WHERE slug = 'inpatient-medical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 20000),
(5, (SELECT id FROM cost_categories WHERE slug = 'ed-visits' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 15000),
(5, (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 10000),

-- Generic drug program → Generic Drugs (maintaining strength)
(6, (SELECT id FROM cost_categories WHERE slug = 'generic-drugs' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 8000);

-- ============================================================================
-- PROGRAM RESOURCES
-- ============================================================================

-- Resources for Discharge Planning (#1)
INSERT INTO program_resources (recommendation_id, resource_type, title, content, display_order) VALUES
(1, 'implementation_step', 'Step 1: Identify target hospitals',
  'Analyze claims data to identify the top 3-5 discharging hospitals that send the most patients to IRF. These will be your initial partnership targets.', 1),
(1, 'implementation_step', 'Step 2: Establish hospital partnerships',
  'Meet with discharge planning directors at target hospitals to present the program. Focus on shared goals of appropriate care settings and reduced readmissions.', 2),
(1, 'implementation_step', 'Step 3: Create screening tools',
  'Develop standardized screening criteria to identify patients appropriate for home-based rehab vs. facility-based rehab. Include functional status assessments and home support evaluation.', 3),
(1, 'best_practice', 'Start with high-volume hospitals',
  'Focus initial efforts on hospitals that discharge 50+ patients per year to rehab facilities. This creates the fastest ROI and builds momentum.', 1),
(1, 'best_practice', 'Engage PT/OT early',
  'Include physical and occupational therapists in the discharge planning process. Their clinical assessment is critical for appropriate level-of-care decisions.', 2);

INSERT INTO program_resources (recommendation_id, resource_type, content, author, author_role, display_order) VALUES
(1, 'testimonial',
  'We reduced inappropriate IRF admissions by 32% in the first year by implementing standardized discharge planning protocols. The key was getting hospital discharge planners and our care coordinators on the same page.',
  'Dr. Jennifer Martinez', 'Medical Director, Coastal Medical Group', 1);

-- Resources for Urgent Care Program (#3)
INSERT INTO program_resources (recommendation_id, resource_type, title, content, display_order) VALUES
(3, 'implementation_step', 'Step 1: Analyze ED utilization patterns',
  'Review ED claims data to identify peak utilization times and most common diagnoses. Focus on evenings (5pm-10pm) and weekends when PCP offices are closed.', 1),
(3, 'implementation_step', 'Step 2: Establish urgent care partnerships',
  'Contract with 2-3 urgent care centers that can provide extended hours. Negotiate favorable rates and ensure EHR integration for care coordination.', 2),
(3, 'implementation_step', 'Step 3: Launch patient education campaign',
  'Create multi-channel campaign educating patients on appropriate urgent care vs. ED use. Include direct mail, patient portal messages, and PCP office materials.', 3),
(3, 'best_practice', 'Provide clear guidance',
  'Create simple decision aid for patients: "Should I go to urgent care or the ER?" Include specific symptoms that require ED (chest pain, severe bleeding, etc.) vs. urgent care (fever, minor injuries, etc.).', 1);

INSERT INTO program_resources (recommendation_id, resource_type, content, author, author_role, display_order) VALUES
(3, 'testimonial',
  'Our extended-hours urgent care program has been a game-changer. We diverted over 400 ED visits in the first year, saving an average of $850 per visit compared to ED costs.',
  'Sarah Thompson', 'COO, Valley Health Partners', 1);

-- Resources for Care Management (#5)
INSERT INTO program_resources (recommendation_id, resource_type, title, content, display_order) VALUES
(5, 'best_practice', 'Focus on top 5% by cost',
  'Start with the highest-cost 5% of patients. These 75-100 patients typically account for 40-50% of total costs and benefit most from intensive management.', 1),
(5, 'best_practice', 'Assign dedicated coordinators',
  'Each care coordinator should manage 40-50 high-cost patients maximum. Lower ratios enable the intensive, proactive outreach these patients need.', 2);

-- ============================================================================
-- EFFICIENCY KPIS
-- ============================================================================
INSERT INTO efficiency_kpis (
  period_id, kpi_type, kpi_label,
  actual_value, aco_benchmark, milliman_benchmark,
  variance_percent, performance_status, display_format, display_order
) VALUES
-- YTD Efficiency KPIs
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'readmission_rate', 'Readmission Rate',
  8.2, 6.5, 6.1, 26.2, 'warning', 'percent', 1),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'ed_rate', 'ED Visits per 1,000',
  520, 440, 425, 18.2, 'warning', 'per_thousand', 2),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'preventable_ed', 'Preventable ED Visits',
  34.5, 28.0, null, 23.2, 'warning', 'percent', 3),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'generic_utilization', 'Generic Drug Utilization',
  85.2, 78.5, 82.0, 8.5, 'good', 'percent', 4),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'pcp_visits', 'Primary Care Visits per Member',
  4.2, 4.5, 4.8, -6.7, 'good', 'number', 5),

-- Last 12 Months Efficiency KPIs
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'readmission_rate', 'Readmission Rate',
  8.7, 6.5, 6.1, 33.8, 'warning', 'percent', 1),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'ed_rate', 'ED Visits per 1,000',
  545, 440, 425, 23.9, 'warning', 'per_thousand', 2),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'preventable_ed', 'Preventable ED Visits',
  36.2, 28.0, null, 29.3, 'warning', 'percent', 3),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'generic_utilization', 'Generic Drug Utilization',
  83.5, 78.5, 82.0, 6.4, 'good', 'percent', 4),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'pcp_visits', 'Primary Care Visits per Member',
  4.3, 4.5, 4.8, -4.4, 'good', 'number', 5),

-- Last Quarter Efficiency KPIs
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'readmission_rate', 'Readmission Rate',
  8.5, 6.5, 6.1, 30.8, 'warning', 'percent', 1),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'ed_rate', 'ED Visits per 1,000',
  535, 440, 425, 21.6, 'warning', 'per_thousand', 2),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'preventable_ed', 'Preventable ED Visits',
  35.8, 28.0, null, 27.9, 'warning', 'percent', 3),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'generic_utilization', 'Generic Drug Utilization',
  84.0, 78.5, 82.0, 7.0, 'good', 'percent', 4),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'pcp_visits', 'Primary Care Visits per Member',
  4.25, 4.5, 4.8, -5.6, 'good', 'number', 5);

-- ============================================================================
-- COST OPPORTUNITIES (Dashboard Summary)
-- ============================================================================
INSERT INTO cost_opportunities (
  period_id, cost_category_id, opportunity_type,
  amount_variance, percent_variance, aco_rank, display_order, show_on_dashboard
) VALUES
-- Overspending (RED - show on dashboard)
((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'overspending', 65900, 78.3, 18, 1, true),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'specialty-drugs' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'overspending', 73000, 37.4, 16, 2, true),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'overspending', 33000, 21.7, 12, 3, true),

-- Efficient (GREEN - show on dashboard to highlight wins!)
((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'primary-care' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'efficient', -30000, -14.3, 3, 4, true),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'generic-drugs' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'efficient', -16000, -14.8, 2, 5, true),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'preventive-care' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'efficient', -7000, -13.5, 4, 6, true),

-- Last 12 Months - Cost Opportunities
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'overspending', 72000, 85.6, 19, 1, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'specialty-drugs' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'overspending', 78500, 40.3, 17, 2, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'overspending', 38000, 25.0, 13, 3, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'primary-care' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'efficient', -28000, -13.3, 3, 4, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'generic-drugs' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'efficient', -14500, -13.4, 2, 5, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'preventive-care' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'efficient', -6500, -12.5, 4, 6, true),

-- Last Quarter - Cost Opportunities
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'overspending', 18500, 88.0, 19, 1, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'specialty-drugs' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'overspending', 20000, 41.0, 17, 2, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'overspending', 9500, 25.7, 14, 3, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'primary-care' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'efficient', -7000, -13.5, 3, 4, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'generic-drugs' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'efficient', -3800, -14.0, 2, 5, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'preventive-care' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'efficient', -1700, -13.0, 4, 6, true);

-- ============================================================================
-- COST CATEGORY DRILL-DOWN DATA
-- ============================================================================

-- Hospitals for Acute Rehab (YTD only - drill-down data)
INSERT INTO cost_category_hospitals (cost_category_id, hospital_name, discharges, avg_los, spend, readmission_rate, display_order) VALUES
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Valley Inpatient Rehab Facility', 200, 11.5, 320000, 6.1, 1),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Regional Rehab Center', 145, 12.2, 245000, 7.8, 2),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Coastal IRF', 98, 10.8, 178000, 5.2, 3);

-- DRGs for Acute Rehab (YTD only - drill-down data)
INSERT INTO cost_category_drgs (cost_category_id, drg_code, drg_description, patient_count, total_spend, avg_spend_per_patient, benchmark_avg, percent_above_benchmark, display_order) VALUES
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), '945', 'Rehabilitation w CC/MCC', 89, 156000, 17528, 12840, 36.5, 1),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), '946', 'Rehabilitation w/o CC/MCC', 156, 287000, 18397, 13200, 39.4, 2),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), '949', 'Aftercare w CC/MCC', 45, 98000, 21778, 15840, 37.5, 3);

-- Discharging Hospitals for Acute Rehab (YTD only - drill-down data)
INSERT INTO cost_category_discharging_hospitals (cost_category_id, hospital_name, discharges, percent_discharged_to_irf, percent_discharged_to_irf_benchmark, display_order) VALUES
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Regional Medical Center', 178, 24.1, 17.2, 1),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Valley General Hospital', 142, 22.8, 17.2, 2),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Community Hospital', 87, 19.5, 17.2, 3);

-- Hospitals for OP Surgical (YTD only - drill-down data)
INSERT INTO cost_category_hospitals (cost_category_id, hospital_name, discharges, avg_los, spend, readmission_rate, display_order) VALUES
((SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Valley Surgical Center', 425, null, 285000, null, 1),
((SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Regional Outpatient Surgery', 318, null, 198000, null, 2),
((SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Coastal Surgery Center', 245, null, 156000, null, 3);

-- DRGs for OP Surgical (YTD only - drill-down data)
INSERT INTO cost_category_drgs (cost_category_id, drg_code, drg_description, patient_count, total_spend, avg_spend_per_patient, benchmark_avg, percent_above_benchmark, display_order) VALUES
((SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'CPT-29881', 'Arthroscopy, knee, surgical', 125, 187500, 1500, 1200, 25.0, 1),
((SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'CPT-47562', 'Laparoscopy, cholecystectomy', 89, 160200, 1800, 1450, 24.1, 2),
((SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'CPT-43239', 'Upper GI endoscopy with biopsy', 234, 140400, 600, 485, 23.7, 3);
