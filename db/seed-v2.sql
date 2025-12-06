-- Seed Data for Leadership Feedback Tables
-- Created: 2025-12-04
-- Updated: 2025-12-05
-- Description: Realistic sample data showing red/yellow/GREEN categories

-- Fix slug constraint to allow same slug across different periods
ALTER TABLE cost_categories DROP CONSTRAINT IF EXISTS cost_categories_slug_key;
ALTER TABLE cost_categories ADD CONSTRAINT cost_categories_slug_period_unique UNIQUE (slug, period_id);

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
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'total_cost', 4980760, 4840000, 2.9, 'up', 1450000, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'patient_count', 1522, 1485, 2.5, 'up', 1522, false, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'risk_score', 1.08, 1.085, -0.5, 'down', 1.0, true, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'cost_pmpm', 1080, 1053, 2.6, 'up', 950, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'cost_savings_opportunity', 750000, 765000, 5.5, 'up', 500000, true, 'currency'),

-- Last 12 Months period metrics
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'total_cost', 4980760, 4840000, 2.9, 'up', 1450000, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'patient_count', 1485, 1450, 2.4, 'up', 1485, false, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'risk_score', 1.08, 1.085, -0.5, 'down', 1.0, true, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'cost_pmpm', 1080, 1053, 2.6, 'up', 950, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'cost_savings_opportunity', 765000, 800000, 5.5, 'up', 500000, true, 'currency'),

-- Last Quarter period metrics
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'total_cost', 4980760, 4840000, 2.9, 'up', 1450000, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'patient_count', 1480, 1465, 1.0, 'up', 1480, false, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'risk_score', 1.08, 1.085, -0.5, 'down', 1.0, true, 'number'),
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'cost_pmpm', 1080, 1053, 2.6, 'up', 950, true, 'currency'),
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'cost_savings_opportunity', 190000, 200000, 5.5, 'up', 125000, true, 'currency');

-- ============================================================================
-- COST CATEGORIES (Showing RED, YELLOW, and GREEN)
-- ============================================================================
INSERT INTO cost_categories (
  slug, category_name, period_id,
  spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_amount, spending_variance_percent, trend_percent,
  utilization_actual, utilization_benchmark, utilization_variance_percent, utilization_unit,
  performance_status, is_opportunity, is_strength, aco_rank, total_categories, description, display_order
) VALUES
-- RED - Priority Issues (Overspending >3%)
('acute-rehab', 'Acute Rehabilitation', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  160.00, 145.00, 229500, 25.0, 6.5,
  9.8, 9.0, 8.9, 'admits_per_k',
  'red', true, false, 20, 20, '25.0% above benchmark', 1),

('op-surgical', 'OP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  194.62, 179.10, 236130, 22.0, 5.8,
  22.5, 19.8, 13.6, 'procedures_per_k',
  'red', true, false, 12, 20, '22.0% above benchmark', 2),

('ip-surgical', 'IP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  225.54, 214.00, 175620, 19.5, 4.5,
  15.2, 14.5, 4.8, 'admits_per_k',
  'red', true, false, 7, 20, '19.5% above benchmark', 3),


-- YELLOW - Watch Items (Within ±3% of benchmark)

('inpatient-medical', 'Inpatient Medical', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  237.18, 234.00, 48400, 20.7, 5.2,
  58.5, 55.0, 6.4, 'admits_per_k',
  'yellow', false, false, 11, 20, '20.7% above benchmark', 5),

('radiology', 'Radiology', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  78.00, 80.00, -30440, -2.5, 2.3,
  125, 128, -2.3, 'studies_per_k',
  'yellow', false, false, 10, 20, 'Within 3% of benchmark', 6),

('lab-services', 'Lab Services', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  34.00, 35.00, -15220, -2.9, -3.5,
  450, 460, -2.2, 'tests_per_k',
  'yellow', false, false, 9, 20, 'Within 3% of benchmark', 7),

-- GREEN - Strengths (Performing Well >3% below benchmark)
('op-radiology', 'OP Radiology', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  75.00, 78.00, -45660, -3.8, 1.2,
  125, 135, -7.4, 'studies_per_k',
  'green', false, true, 5, 20, '3.8% below benchmark', 8),

('avoidable-ed-visits', 'Avoidable ED visits', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  85.00, 90.00, -76100, -5.6, -4.8,
  180, 195, -7.7, 'visits_per_k',
  'green', false, true, 1, 20, '5.6% below benchmark', 9),

('skilled-nursing', 'Skilled Nursing', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  120.00, 128.50, -129370, -6.6, -7.2,
  45, 52, -13.5, 'admits_per_k',
  'green', false, true, 3, 20, '6.6% below benchmark', 10),

('preventive-care', 'Preventive Care', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  47.20, 52.00, -73056, -3.1, 2.6,
  2.8, 3.1, -9.7, 'services_per_member',
  'green', false, false, 6, 20, '3.1% below benchmark', 11),

('generic-drugs', 'Generic Drugs', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  105.73, 108.00, -31960, -2.1, -5.1,
  85.2, 78.5, 8.5, 'percent_generic',
  'green', false, false, 2, 20, '2.1% below benchmark', 12),

('primary-care', 'Primary Care', (SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  206.01, 210.00, -60730, -1.9, 1.8,
  4.2, 4.5, -6.7, 'visits_per_member',
  'green', false, false, 8, 20, '1.9% below benchmark', 13),

-- ============================================================================
-- COST CATEGORIES for Last 12 Months
-- ============================================================================
-- RED - Priority Issues (Overspending >3%)
('acute-rehab', 'Acute Rehabilitation', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  162.05, 150.50, 175791, 7.7, 2.9,
  10.2, 9.0, 13.3, 'admits_per_k',
  'red', true, false, 20, 20, '7.7% above benchmark', 1),

('op-surgical', 'OP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  199.55, 183.60, 242759, 8.7, -6.4,
  23.5, 19.8, 18.7, 'procedures_per_k',
  'red', true, false, 12, 20, '8.7% above benchmark', 2),

('ip-surgical', 'IP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  230.09, 218.30, 179436, 5.4, 1.8,
  15.5, 14.5, 6.9, 'admits_per_k',
  'red', true, false, 7, 20, '5.4% above benchmark', 3),

-- YELLOW - Watch Items (Within ±3% of benchmark)

('radiology', 'Radiology', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  78.00, 80.00, -30440, -2.5, 2.3,
  125, 128, -2.3, 'studies_per_k',
  'yellow', false, false, 10, 20, 'Within 3% of benchmark', 4),

-- GREEN - Strengths (Performing Well >3% below benchmark)
('op-radiology', 'OP Radiology', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  76.00, 79.20, -48704, -4.0, 1.2,
  128, 135, -5.2, 'studies_per_k',
  'green', false, true, 5, 20, '4.0% below benchmark', 5),

('avoidable-ed-visits', 'Avoidable ED visits', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  86.00, 91.30, -80666, -5.8, -4.8,
  185, 195, -5.1, 'visits_per_k',
  'green', false, true, 1, 20, '5.8% below benchmark', 6),

('skilled-nursing', 'Skilled Nursing', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  121.00, 130.20, -140024, -7.0, -7.2,
  46, 52, -11.5, 'admits_per_k',
  'green', false, true, 3, 20, '7.0% below benchmark', 7),

('generic-drugs', 'Generic Drugs', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  105.73, 108.00, -31960, -2.1, -5.1,
  83.5, 78.5, 6.4, 'percent_generic',
  'green', false, false, 2, 20, '2.1% below benchmark', 8),

('primary-care', 'Primary Care', (SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  206.01, 210.00, -60730, -1.9, 1.8,
  4.3, 4.5, -4.4, 'visits_per_member',
  'green', false, false, 8, 20, '1.9% below benchmark', 9),

-- ============================================================================
-- COST CATEGORIES for Last Quarter
-- ============================================================================
-- RED - Priority Issues (Overspending >3%)
('acute-rehab', 'Acute Rehabilitation', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  164.50, 152.50, 182640, 7.9, 2.9,
  10.5, 9.0, 16.7, 'admits_per_k',
  'red', true, false, 20, 20, '7.9% above benchmark', 1),

('op-surgical', 'OP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  200.97, 184.90, 244585, 8.7, -6.4,
  24.0, 19.8, 21.2, 'procedures_per_k',
  'red', true, false, 12, 20, '8.7% above benchmark', 2),

('ip-surgical', 'IP Surgical', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  232.40, 220.50, 181118, 5.4, 1.8,
  15.8, 14.5, 9.0, 'admits_per_k',
  'red', true, false, 7, 20, '5.4% above benchmark', 3),

-- YELLOW - Watch Items (Within ±3% of benchmark)

('radiology', 'Radiology', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  78.00, 80.00, -30440, -2.5, 2.3,
  125, 128, -2.3, 'studies_per_k',
  'yellow', false, false, 10, 20, 'Within 3% of benchmark', 4),

-- GREEN - Strengths (Performing Well >3% below benchmark)
('op-radiology', 'OP Radiology', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  77.00, 80.10, -47182, -3.9, 1.2,
  130, 135, -3.7, 'studies_per_k',
  'green', false, true, 5, 20, '3.9% below benchmark', 5),

('avoidable-ed-visits', 'Avoidable ED visits', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  87.00, 92.20, -79144, -5.6, -4.8,
  188, 195, -3.6, 'visits_per_k',
  'green', false, true, 1, 20, '5.6% below benchmark', 6),

('skilled-nursing', 'Skilled Nursing', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  122.00, 131.00, -136980, -6.8, -7.2,
  47, 52, -9.6, 'admits_per_k',
  'green', false, true, 3, 20, '6.8% below benchmark', 7),

('generic-drugs', 'Generic Drugs', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  105.73, 108.00, -31960, -2.1, -5.1,
  84.0, 78.5, 7.0, 'percent_generic',
  'green', false, false, 2, 20, '2.1% below benchmark', 8),

('primary-care', 'Primary Care', (SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  206.01, 210.00, -60730, -1.9, 1.8,
  4.25, 4.5, -5.6, 'visits_per_member',
  'green', false, false, 8, 20, '1.9% below benchmark', 9);

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
('Implement a care management program',
  'Deploy intensive care management program targeting high-risk patients to reduce avoidable admissions and improve care coordination.',
  'not_started', 'high',
  350000, 39, 'medium',
  'High need patients', 39,
  true,
  'Care management programs are evidence-based interventions designed to improve health outcomes for high-risk patients while reducing unnecessary healthcare utilization. These programs identify patients with complex medical needs, multiple chronic conditions, or frequent hospital admissions and provide them with dedicated care coordinators who serve as their primary point of contact for healthcare navigation.

The core components of an effective care management program include comprehensive health assessments, personalized care planning, medication reconciliation and management, care coordination across providers, patient education and self-management support, and 24/7 access to clinical support. Care coordinators work closely with patients and their families to address barriers to care, ensure follow-up appointments are scheduled and attended, and facilitate communication between specialists and primary care providers.

Research demonstrates that well-implemented care management programs can reduce hospital readmissions by 20-30%, decrease emergency department visits by 15-25%, and improve patient satisfaction scores while generating significant cost savings. The key to success lies in targeting the right patient population, maintaining appropriate care coordinator-to-patient ratios (typically 1:40-50 for high-risk patients), and ensuring strong integration with the broader care team including physicians, specialists, and community resources.',
  null,
  true, 'care_management'),

('Refer patients with dementia to GUIDE program',
  'Enroll eligible dementia patients in the GUIDE program for comprehensive care management and caregiver support.',
  'not_started', 'high',
  120000, 87, 'low',
  'Patients with dementia', 87,
  true,
  'The GUIDE program provides comprehensive dementia care management including care coordination, caregiver education and support, and 24/7 access to a care team.',
  null,
  true, 'care_coordination'),

('Implement discharge planning protocols for rehab patients',
  'Partner with discharging hospitals to implement standardized discharge planning protocols that reduce unnecessary IRF admissions and promote home-based rehab when appropriate.',
  'not_started', 'high',
  65900, 148, 'medium',
  'Post-acute rehab candidates', 148,
  true,
  'Standardized discharge planning protocols are critical interventions that ensure patients receive the most appropriate post-acute care setting based on their clinical needs, functional status, and home support systems. These protocols involve collaboration between hospital discharge planners, rehabilitation specialists, and care coordinators to assess each patient''s readiness for different levels of care and identify opportunities for home-based rehabilitation when clinically appropriate.

Effective discharge planning programs establish clear criteria for determining when patients can safely receive rehabilitation services at home versus requiring facility-based care. This includes comprehensive assessments of mobility, activities of daily living, cognitive function, caregiver availability, and home environment safety. By implementing evidence-based screening tools and decision algorithms, healthcare organizations can reduce unnecessary admissions to inpatient rehabilitation facilities while ensuring patients still receive the intensive therapy they need.

Research shows that well-designed discharge planning protocols can reduce inappropriate IRF admissions by 25-35% while maintaining or improving patient outcomes. Key success factors include early identification of post-acute care needs (ideally within 24 hours of admission), strong partnerships with discharging hospitals, availability of robust home health services, and ongoing monitoring to ensure patients are progressing appropriately in their chosen care setting.',
  null,
  true, 'care_coordination'),

('Launch extended-hours urgent care program',
  'Establish extended-hours urgent care access (evenings and weekends) to divert non-emergency ED visits to lower-cost settings.',
  'accepted', 'high',
  24000, 780, 'high',
  'High ED utilizers', 285,
  true,
  'Extended-hours urgent care program provides same-day access for urgent but non-emergency conditions.',
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

-- Low Priority
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
-- Care management (#1) → Multiple categories
(1, (SELECT id FROM cost_categories WHERE slug = 'inpatient-medical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 20000),
(1, (SELECT id FROM cost_categories WHERE slug = 'ed-visits' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 15000),
(1, (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 10000),

-- GUIDE program (#2) → Inpatient Medical
(2, (SELECT id FROM cost_categories WHERE slug = 'inpatient-medical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 73000),

-- Discharge planning (#3) → Acute Rehabilitation, IP Medical, ED
(3, (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 65900),
(3, (SELECT id FROM cost_categories WHERE slug = 'inpatient-medical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 25000),
(3, (SELECT id FROM cost_categories WHERE slug = 'ed-visits' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 18000),

-- Urgent care (#4) → ED Visits
(4, (SELECT id FROM cost_categories WHERE slug = 'ed-visits' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 24000),

-- Pre-surgical optimization (#5) → OP Surgical + IP Surgical
(5, (SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 18000),
(5, (SELECT id FROM cost_categories WHERE slug = 'ip-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 15000);

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

((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'avoidable_ed_visits', 'Avoidable ED visits per 1000',
  20.1, 21.97, null, -8.5, 'good', 'per_thousand', 4),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'imaging_lower_back', 'Imaging for lower back per 1000',
  7.7, 8.5, null, -9.41, 'good', 'per_thousand', 5),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'), 'annual_wellness_visits', 'Annual wellness visits per 1000',
  802, 794, null, 1.01, 'good', 'per_thousand', 6),

-- Last 12 Months Efficiency KPIs
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'readmission_rate', 'Readmission Rate',
  8.7, 6.5, 6.1, 33.8, 'warning', 'percent', 1),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'ed_rate', 'ED Visits per 1,000',
  545, 440, 425, 23.9, 'warning', 'per_thousand', 2),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'preventable_ed', 'Preventable ED Visits',
  36.2, 28.0, null, 29.3, 'warning', 'percent', 3),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'avoidable_ed_visits', 'Avoidable ED visits per 1000',
  20.1, 21.97, null, -8.5, 'good', 'per_thousand', 4),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'imaging_lower_back', 'Imaging for lower back per 1000',
  7.7, 8.5, null, -9.41, 'good', 'per_thousand', 5),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'), 'annual_wellness_visits', 'Annual wellness visits per 1000',
  802, 794, null, 1.01, 'good', 'per_thousand', 6),

-- Last Quarter Efficiency KPIs
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'readmission_rate', 'Readmission Rate',
  8.5, 6.5, 6.1, 30.8, 'warning', 'percent', 1),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'ed_rate', 'ED Visits per 1,000',
  535, 440, 425, 21.6, 'warning', 'per_thousand', 2),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'preventable_ed', 'Preventable ED Visits',
  35.8, 28.0, null, 27.9, 'warning', 'percent', 3),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'avoidable_ed_visits', 'Avoidable ED visits per 1000',
  20.1, 21.97, null, -8.5, 'good', 'per_thousand', 4),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'imaging_lower_back', 'Imaging for lower back per 1000',
  7.7, 8.5, null, -9.41, 'good', 'per_thousand', 5),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'), 'annual_wellness_visits', 'Annual wellness visits per 1000',
  802, 794, null, 1.01, 'good', 'per_thousand', 6);

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
  'overspending', 229500, 10.3, 20, 1, true),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'overspending', 236130, 8.7, 12, 2, true),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'ip-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'overspending', 175620, 5.4, 7, 3, true),

-- Efficient (GREEN - show on dashboard to highlight wins!)
((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'avoidable-ed-visits' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'efficient', -76100, -5.6, 1, 4, true),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'skilled-nursing' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'efficient', -129370, -6.6, 3, 5, true),

((SELECT id FROM performance_periods WHERE period_key = 'ytd'),
  (SELECT id FROM cost_categories WHERE slug = 'op-radiology' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')),
  'efficient', -45660, -3.8, 5, 6, true),

-- Last 12 Months - Cost Opportunities
((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'overspending', 175791, 7.7, 20, 1, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'overspending', 242759, 8.7, 12, 2, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'ip-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'overspending', 179436, 5.4, 7, 3, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'avoidable-ed-visits' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'efficient', -80666, -5.8, 1, 4, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'skilled-nursing' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'efficient', -140024, -7.0, 3, 5, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_12_months'),
  (SELECT id FROM cost_categories WHERE slug = 'op-radiology' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_12_months')),
  'efficient', -48704, -4.0, 5, 6, true),

-- Last Quarter - Cost Opportunities
((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'overspending', 182640, 7.9, 20, 1, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'op-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'overspending', 244585, 8.7, 12, 2, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'ip-surgical' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'overspending', 181118, 5.4, 7, 3, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'avoidable-ed-visits' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'efficient', -79144, -5.6, 1, 4, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'skilled-nursing' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'efficient', -136980, -6.8, 3, 5, true),

((SELECT id FROM performance_periods WHERE period_key = 'last_quarter'),
  (SELECT id FROM cost_categories WHERE slug = 'op-radiology' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'last_quarter')),
  'efficient', -47182, -3.9, 5, 6, true);

-- ============================================================================
-- COST CATEGORY DRILL-DOWN DATA
-- ============================================================================

-- Hospitals for Acute Rehabilitation (YTD only - drill-down data)
INSERT INTO cost_category_hospitals (cost_category_id, hospital_name, discharges, avg_los, spend, readmission_rate, display_order) VALUES
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Valley Inpatient Rehab Facility', 200, 11.5, 320000, 6.1, 1),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Regional Rehab Center', 145, 12.2, 245000, 7.8, 2),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), 'Coastal IRF', 98, 10.8, 178000, 5.2, 3);

-- DRGs for Acute Rehabilitation (YTD only - drill-down data)
INSERT INTO cost_category_drgs (cost_category_id, drg_code, drg_description, patient_count, total_spend, avg_spend_per_patient, benchmark_avg, percent_above_benchmark, display_order) VALUES
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), '945', 'Rehabilitation w CC/MCC', 89, 156000, 17528, 12840, 36.5, 1),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), '946', 'Rehabilitation w/o CC/MCC', 156, 287000, 18397, 13200, 39.4, 2),
((SELECT id FROM cost_categories WHERE slug = 'acute-rehab' AND period_id = (SELECT id FROM performance_periods WHERE period_key = 'ytd')), '949', 'Aftercare w CC/MCC', 45, 98000, 21778, 15840, 37.5, 3);

-- Discharging Hospitals for Acute Rehabilitation (YTD only - drill-down data)
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
