-- Practice configuration table
CREATE TABLE IF NOT EXISTS practice_config (
  id SERIAL PRIMARY KEY,
  panel_size INTEGER NOT NULL DEFAULT 1522,
  total_quality_bonus DECIMAL(10,2) NOT NULL DEFAULT 350000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gap type metrics table
CREATE TABLE IF NOT EXISTS gap_type_metrics (
  id SERIAL PRIMARY KEY,
  gap_type VARCHAR(100) NOT NULL UNIQUE,
  quality_measure VARCHAR(200),
  current_rate DECIMAL(5,2) NOT NULL,
  target_rate DECIMAL(5,2) NOT NULL,
  top_performer_rate DECIMAL(5,2) NOT NULL,
  bonus_weight DECIMAL(5,2) NOT NULL,
  eligible_percent DECIMAL(5,2) NOT NULL,
  revenue_per_closure DECIMAL(10,2),
  expected_roi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gap interventions table
CREATE TABLE IF NOT EXISTS gap_interventions (
  id SERIAL PRIMARY KEY,
  gap_type_id INTEGER REFERENCES gap_type_metrics(id) ON DELETE CASCADE,
  intervention_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard suggestions table
CREATE TABLE IF NOT EXISTS dashboard_suggestions (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- 'quality', 'attribution', 'cost', etc.
  suggestion_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default practice config
INSERT INTO practice_config (panel_size, total_quality_bonus)
VALUES (1522, 350000);

-- Insert gap type metrics
INSERT INTO gap_type_metrics (gap_type, quality_measure, current_rate, target_rate, top_performer_rate, bonus_weight, eligible_percent, revenue_per_closure, expected_roi)
VALUES
  ('Annual Wellness Visit', 'AWV Completion Rate', 68, 85, 92, 15, 100, 175, 'Closing 17% gap protects $52,500 of quality bonus'),
  ('Diabetic Eye Exam', 'Diabetes Eye Exam Rate', 58, 75, 88, 12, 25, 85, 'Closing 17% gap protects $42,000 of quality bonus'),
  ('HbA1c Test', 'Diabetes HbA1c Control', 72, 85, 91, 12, 25, 45, 'Closing 13% gap protects $42,000 of quality bonus'),
  ('Mammogram', 'Breast Cancer Screening', 64, 80, 87, 10, 35, 125, 'Closing 16% gap protects $35,000 of quality bonus'),
  ('Colonoscopy', 'Colorectal Cancer Screening', 55, 75, 82, 10, 60, 350, 'Closing 20% gap protects $35,000 of quality bonus'),
  ('Bone Density Scan', 'Osteoporosis Screening', 48, 70, 78, 5, 30, 95, 'Closing 22% gap protects $17,500 of quality bonus'),
  ('Flu Vaccination', 'Influenza Immunization', 62, 80, 89, 8, 100, 35, 'Closing 18% gap protects $28,000 of quality bonus'),
  ('Blood Pressure Check', 'Blood Pressure Control', 71, 85, 90, 10, 45, 25, 'Closing 14% gap protects $35,000 of quality bonus'),
  ('Lipid Panel', 'Statin Therapy Adherence', 66, 80, 86, 6, 35, 40, 'Closing 14% gap protects $21,000 of quality bonus'),
  ('Cardiac Stress Test', 'CAD Management', 52, 75, 81, 5, 15, 450, 'Closing 23% gap protects $17,500 of quality bonus'),
  ('Pneumonia Vaccine', 'Pneumococcal Vaccination', 58, 80, 88, 7, 50, 45, 'Closing 22% gap protects $24,500 of quality bonus');

-- Insert interventions for Annual Wellness Visit
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Automated appointment reminders 30/14/7 days before due date',
  'Standing orders for MA to schedule during any visit',
  'Dedicated AWV time slots on provider schedules',
  'Patient portal self-scheduling for AWV'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Annual Wellness Visit';

-- Insert interventions for Diabetic Eye Exam
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Retinal camera in-office (eliminates referral barrier)',
  'Auto-schedule eye exam with diabetic visit',
  'Care coordinator follow-up on referral completion',
  'Partner with mobile retinal screening service'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Diabetic Eye Exam';

-- Insert interventions for HbA1c Test
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Point-of-care A1c testing at every diabetic visit',
  'Standing lab orders with patient self-scheduling',
  'Pharmacy-based A1c testing partnership',
  'Text reminders with direct lab scheduling link'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'HbA1c Test';

-- Insert interventions for Mammogram
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Mobile mammography unit at practice quarterly',
  'Care coordinator to schedule and confirm',
  'Address transportation barriers (ride service)',
  'Same-day mammogram scheduling at referral'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Mammogram';

-- Insert interventions for Colonoscopy
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'FIT test alternative for colonoscopy-averse patients',
  'Cologuard home testing option',
  'Nurse navigator for colonoscopy scheduling',
  'Address prep concerns with simplified protocols'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Colonoscopy';

-- Insert interventions for Bone Density Scan
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Auto-referral at age 65 or risk factors',
  'Partner with imaging center for priority scheduling',
  'Bundle with AWV appointment',
  'Care gap alert in EHR for eligible patients'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Bone Density Scan';

-- Insert interventions for Flu Vaccination
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Standing orders for MA/RN administration',
  'Walk-in flu shot clinics (no appointment)',
  'Pharmacy partnership for overflow',
  'Text blast campaigns in September-October'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Flu Vaccination';

-- Insert interventions for Blood Pressure Check
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Home BP monitoring program with device loan',
  'Nurse visits for BP-only checks',
  'Pharmacy BP kiosk integration',
  'Telehealth BP review appointments'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Blood Pressure Check';

-- Insert interventions for Lipid Panel
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Standing annual lab orders for chronic patients',
  'Fasting lab early AM availability',
  'Home phlebotomy for mobility-limited patients',
  'Auto-schedule labs 1 month before due'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Lipid Panel';

-- Insert interventions for Cardiac Stress Test
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'In-office stress testing capability',
  'Cardiology co-management agreement',
  'Care coordinator for scheduling and prep',
  'Patient education on test importance'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Cardiac Stress Test';

-- Insert interventions for Pneumonia Vaccine
INSERT INTO gap_interventions (gap_type_id, intervention_text, sort_order)
SELECT id, unnest(ARRAY[
  'Standing orders for 65+ patients',
  'Bundle with flu shot visits',
  'EHR alert for eligible patients',
  'Pharmacy administration partnership'
]), generate_series(1, 4)
FROM gap_type_metrics WHERE gap_type = 'Pneumonia Vaccine';

-- Insert dashboard suggestions
INSERT INTO dashboard_suggestions (category, suggestion_text, sort_order)
VALUES
  ('quality', 'Launch intensive outreach for 411 patients overdue for colorectal screening', 1),
  ('quality', 'Deploy diabetes care managers to high-risk panel', 2),
  ('quality', 'Implement point-of-care quality measure alerts in EMR', 3);
