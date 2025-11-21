-- Seed data for gap categories, doctors, and patients

-- Drop and recreate tables to ensure schema changes are applied
DROP TABLE IF EXISTS gap_top_patients;
DROP TABLE IF EXISTS gap_top_doctors;

CREATE TABLE IF NOT EXISTS gap_top_doctors (
  id SERIAL PRIMARY KEY,
  gap_category_id INTEGER REFERENCES gap_categories(id),
  doctor_id INTEGER REFERENCES doctors(id),
  spend DECIMAL(10,2) NOT NULL,
  patient_count INTEGER NOT NULL,
  avg_per_patient DECIMAL(10,2) NOT NULL,
  benchmark_avg DECIMAL(10,2),
  top_performer_avg DECIMAL(10,2),
  percent_above_benchmark INTEGER,
  cost_drivers TEXT,
  opportunities TEXT,
  rank INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gap_top_patients (
  id SERIAL PRIMARY KEY,
  gap_category_id INTEGER REFERENCES gap_categories(id),
  patient_id INTEGER REFERENCES patients(id),
  spend DECIMAL(10,2) NOT NULL,
  spend_category VARCHAR(255),
  cost_drivers TEXT,
  rank INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data (in reverse order due to foreign keys)
TRUNCATE TABLE gap_categories, doctors, patients RESTART IDENTITY CASCADE;

-- Insert gap categories
INSERT INTO gap_categories (slug, category, amount, percent, description, current_spend, last_year_spend, top_performer_spend, solutions, color) VALUES
('gap-dme', 'DME and Supplies', 84000, 20, '68% above benchmark spend', '$310 per patient', '$285 per patient', '$100 per patient',
  ARRAY['Implement preferred DME supplier network with negotiated rates', 'Provider education on appropriate DME utilization', 'Prior authorization for high-cost DME items over $500'], 'red'),
('gap-specialty-drugs', 'Medical Drugs (Specialty)', 74000, 18, '36% above benchmark - high-cost biologics', '$26,750 per patient', '$24,200 per patient', '$17,025 per patient',
  ARRAY['Implement step therapy protocols for biologics', 'Negotiate bundled payment arrangements with specialists', 'Deploy intensive care management for patients on specialty drugs'], 'red'),
('gap-outpatient-surgery', 'Outpatient Surgery', 65000, 15, '31% above benchmark utilization', '$27,430 per patient', '$25,100 per patient', '$18,840 per patient',
  ARRAY['Counsel patients on conservative treatment options first', 'Steer patients towards higher-value surgical specialists', 'Effective chronic disease management to delay procedures'], 'amber'),
('gap-inpatient-surgery', 'Inpatient Surgery', 55000, 13, '29% above benchmark costs', '$25,440 per patient', '$23,800 per patient', '$18,180 per patient',
  ARRAY['Long-term PCP care to reduce need for procedures', 'Pre-surgical optimization programs', 'Negotiate bundled payment arrangements for common procedures'], 'amber'),
('gap-post-acute', 'Post-Acute Rehab', 51000, 12, '71% above benchmark - excessive utilization', '$9,455 per patient', '$8,200 per patient', '$2,755 per patient',
  ARRAY['Implement discharge planning protocols with hospital teams', 'Promote home-based rehab over facility-based when appropriate', 'Care coordination for post-acute transitions'], 'amber'),
('gap-inpatient-medical', 'Inpatient Medical', 31000, 7, '6% above benchmark admissions', '$24,780 per patient', '$23,500 per patient', '$23,400 per patient',
  ARRAY['Better management of chronic conditions to prevent admissions', 'Deploy care management for high-risk patients', 'Implement transitional care programs'], 'blue');

-- Insert doctors
INSERT INTO doctors (name, specialty) VALUES
('Dr. Sarah Chen', 'Internal Medicine'),
('Dr. Michael Torres', 'Family Medicine'),
('Dr. Jennifer Park', 'Internal Medicine'),
('Dr. Robert Kim', 'Rheumatology'),
('Dr. Lisa Anderson', 'Oncology'),
('Dr. James Wilson', 'Neurology'),
('Dr. Amanda Rodriguez', 'Orthopedics'),
('Dr. David Lee', 'Ophthalmology'),
('Dr. Emily Watson', 'Pain Management'),
('Dr. Thomas Brown', 'Cardiology'),
('Dr. Maria Garcia', 'Orthopedics'),
('Dr. Kevin Patel', 'Neurosurgery'),
('Dr. Patricia Martinez', 'Physical Medicine'),
('Dr. Christopher Lee', 'Internal Medicine'),
('Dr. Nicole Johnson', 'Geriatrics'),
('Dr. Steven White', 'Cardiology'),
('Dr. Rachel Green', 'Pulmonology'),
('Dr. Daniel Kim', 'Internal Medicine');

-- Insert patients for gap tracking
INSERT INTO patients (mrn, name, age, risk_score, total_cost) VALUES
('MRN001', 'Margaret Williams', 67, 3.2, 8450),
('MRN002', 'Robert Johnson', 72, 4.1, 6200),
('MRN003', 'Linda Martinez', 68, 2.8, 5800),
('MRN004', 'Patricia Thompson', 74, 4.5, 45200),
('MRN005', 'William Davis', 71, 4.8, 38900),
('MRN006', 'Susan Miller', 68, 3.9, 32400),
('MRN007', 'James Anderson', 65, 3.1, 18500),
('MRN008', 'Barbara Taylor', 69, 2.9, 15200),
('MRN009', 'Richard Moore', 71, 3.4, 12800),
('MRN010', 'Charles Wilson', 68, 4.7, 52400),
('MRN011', 'Dorothy Brown', 73, 4.2, 48900),
('MRN012', 'Thomas Garcia', 72, 3.8, 41200),
('MRN013', 'Elizabeth Jackson', 76, 4.9, 28400),
('MRN014', 'George White', 81, 5.1, 24900),
('MRN015', 'Nancy Harris', 69, 3.6, 21200),
('MRN016', 'Kenneth Clark', 74, 4.3, 32100),
('MRN017', 'Betty Lewis', 70, 3.7, 28400),
('MRN018', 'Donald Robinson', 68, 3.5, 24900);

-- Insert gap_top_doctors (linking doctors to gap categories with spend data)
-- DME and Supplies
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 18450, 12, 1538, 850, 420, 81, 'Orders power wheelchairs without mobility eval • Uses non-contracted DME suppliers (adds 35% cost) • No generic substitution on supplies • 3 patients with duplicate equipment orders', 'Switch to preferred DME vendor network (saves $6,200) • Require PT mobility eval before power wheelchair orders • Implement generic-first supply policy', 1 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-dme' AND d.name = 'Dr. Sarah Chen';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 15200, 8, 1900, 850, 420, 124, 'High CPAP orders without sleep study confirmation • Premium brand preference (ResMed only) • Monthly mask replacements vs quarterly • Out-of-network supplier for 5 patients', 'Require sleep study before CPAP authorization • Add Phillips as approved alternative • Quarterly mask replacement per guidelines (saves $3,800)', 2 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-dme' AND d.name = 'Dr. Michael Torres';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 12800, 15, 853, 850, 420, 0, 'CGM for all diabetics (not per A1c guidelines) • Brand-only test strips (no generic) • Testing 8x daily orders for Type 2 patients', 'Reserve CGM for A1c >8% or hypoglycemia risk • Generic test strip formulary (saves $2,400) • Reduce testing frequency for stable Type 2 patients', 3 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-dme' AND d.name = 'Dr. Jennifer Park';

-- Medical Drugs (Specialty)
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 22100, 3, 7367, 4200, 3100, 75, 'Starts biologics without DMARD trial (0% step therapy compliance) • No biosimilar switches despite 3 eligible patients • Uses hospital infusion center vs office (adds $1,200/infusion)', 'Implement step therapy: methotrexate before biologics (saves $18K/patient) • Switch to Hadlima biosimilar (saves $4,200/patient/year) • Move infusions to office setting', 1 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-specialty-drugs' AND d.name = 'Dr. Robert Kim';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 19800, 2, 9900, 4200, 3100, 136, 'Immunotherapy at hospital outpatient rates ($4,800 vs $2,100 office) • No 340B pharmacy utilization • Extended 24-cycle treatment vs 12-cycle standard', 'Shift infusions to physician office site (saves $5,400/patient) • Utilize 340B pricing where eligible • Review treatment duration per NCCN guidelines', 2 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-specialty-drugs' AND d.name = 'Dr. Lisa Anderson';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 16500, 4, 4125, 4200, 3100, -2, 'Quick escalation to IV therapies (avg 6 weeks on oral) • Specialty pharmacy with 23% markup vs health system pharmacy • No oral therapy optimization', 'Extend oral therapy trial to 12 weeks per guidelines • Switch to health system specialty pharmacy (saves $3,200) • Consider lower-cost IV alternatives', 3 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-specialty-drugs' AND d.name = 'Dr. James Wilson';

-- Outpatient Surgery
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 14200, 6, 2367, 1650, 1200, 43, 'Low threshold for arthroscopy (4/6 patients had no PT trial) • Uses highest-cost ASC in network ($3,200 vs $1,800 avg) • MRI for all knee pain without conservative trial', 'Require 6-week PT trial before surgical referral • Steer to lower-cost ASC facilities (saves $8,400) • Clinical pathway for knee pain workup', 1 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-outpatient-surgery' AND d.name = 'Dr. Amanda Rodriguez';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 12900, 5, 2580, 1650, 1200, 56, 'Premium IOLs for all cataracts ($2,400 vs $800 standard) • Hospital-based surgery center vs ASC ($4,200 difference) • Laser-assisted on 100% (vs 30% appropriate)', 'Reserve premium IOLs for documented need • Shift to ASC (saves $4,200/case) • Laser-assist only when clinically indicated (saves $1,200/case)', 2 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-outpatient-surgery' AND d.name = 'Dr. David Lee';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 11400, 7, 1629, 1650, 1200, -1, '4+ epidural injections in 6 months (3 patients) • No pain psychology referrals (0/7 patients) • Rapid escalation to RFA without injection trial', 'Limit epidurals to 3/year per guidelines • Mandatory pain psychology eval for chronic pain • Require 2+ diagnostic injections before RFA', 3 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-outpatient-surgery' AND d.name = 'Dr. Emily Watson';

-- Inpatient Surgery
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 16800, 4, 4200, 3200, 2800, 31, 'Extended ICU stays post-CABG (avg 4.2 days vs 2.1 benchmark) • Premium device selection on all cases • LOS 8 days (benchmark 5) • 1 readmission within 30 days', 'ICU step-down protocol after day 2 (saves $3,600/patient) • Standard device formulary (saves $2,400/case) • Enhanced recovery pathway for cardiac surgery', 1 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-inpatient-surgery' AND d.name = 'Dr. Thomas Brown';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 14500, 3, 4833, 3200, 2800, 51, 'Robotic surgery standard on all cases (adds $8K) • 67% SNF discharge rate (vs 20% benchmark) • No same-day discharge protocol • Avg LOS 6 days (benchmark 2)', 'Reserve robotic for complex cases only • Implement home-with-PT discharge pathway • Same-day THA protocol for appropriate patients (saves $12K/case)', 2 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-inpatient-surgery' AND d.name = 'Dr. Maria Garcia';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 12200, 5, 2440, 3200, 2800, -24, 'Premium spinal hardware on 100% ($12K above standard) • No conservative care trial (0/5 patients tried PT first) • Extended LOS avg 5 days (benchmark 3)', 'Standard implant formulary with premium exceptions • Require 12-week conservative care trial • Spine surgery ERAS protocol (target 2-day LOS)', 3 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-inpatient-surgery' AND d.name = 'Dr. Kevin Patel';

-- Post-Acute Rehab
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 13400, 8, 1675, 980, 550, 71, 'SNF referrals when home health appropriate (5/8 patients) • Uses highest-cost SNF ($450/day vs $280 network avg) • No early discharge planning • Avg SNF stay 24 days (benchmark 14)', 'Home health assessment for all discharges • Preferred SNF network (saves $170/day) • Discharge planning starting day 1 • Target 14-day SNF stays', 1 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-post-acute' AND d.name = 'Dr. Patricia Martinez';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 11900, 6, 1983, 980, 550, 102, 'IRF for patients meeting SNF criteria (4/6 inappropriate level) • Extended rehab stays avg 21 days • No home health coordination • Family preference drives facility over clinical need', 'InterQual criteria for IRF vs SNF • Weekly utilization review • Home health bridge program • Family education on home recovery benefits', 2 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-post-acute' AND d.name = 'Dr. Christopher Lee';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 10200, 9, 1133, 980, 550, 16, 'Facility-based cardiac rehab vs outpatient (6/9 patients) • Delayed discharge decisions (avg 3 days past ready) • Limited family engagement in discharge planning', 'Outpatient cardiac rehab pathway (saves $8K/patient) • Daily discharge readiness rounds • Family meeting within 48 hours of admission', 3 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-post-acute' AND d.name = 'Dr. Nicole Johnson';

-- Inpatient Medical
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 9200, 7, 1314, 1100, 850, 19, 'High CHF readmission rate (43% vs 18% benchmark) • No transitional care protocols • Limited outpatient follow-up coordination • Avg LOS 6.2 days (benchmark 4.5)', 'CHF nurse navigator program • 48-hour post-discharge call • Cardiology follow-up within 7 days • Daily diuretic titration protocol', 1 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-inpatient-medical' AND d.name = 'Dr. Steven White';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 8100, 5, 1620, 1100, 850, 47, 'COPD admits without pulmonary rehab referral (0/5 patients) • No smoking cessation program enrollment • Extended observation stays (avg 2.1 days before admit decision)', 'Pulmonary rehab referral at discharge • Tobacco treatment service consult • Observation decision within 24 hours • Home BiPAP program for frequent exacerbators', 2 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-inpatient-medical' AND d.name = 'Dr. Rachel Green';
INSERT INTO gap_top_doctors (gap_category_id, doctor_id, spend, patient_count, avg_per_patient, benchmark_avg, top_performer_avg, percent_above_benchmark, cost_drivers, opportunities, rank)
SELECT gc.id, d.id, 7400, 6, 1233, 1100, 850, 12, 'Delayed IV-to-oral antibiotic conversion (avg day 5 vs day 3) • Social admits without case management (2/6 patients) • Low vaccination rates (33% pneumococcal, 50% influenza)', 'Antibiotic stewardship with pharmacy-driven IV-to-PO • Case management screen for all admits • Standing vaccine orders for eligible patients', 3 FROM gap_categories gc, doctors d WHERE gc.slug = 'gap-inpatient-medical' AND d.name = 'Dr. Daniel Kim';

-- Insert gap_top_patients (linking patients to gap categories with spend data)
-- DME and Supplies
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 8450, 'Wheelchair & mobility aids', '3 power wheelchairs in 18 months • Non-preferred vendor ($2,400 above contract) • No prior auth on 2nd replacement', 1 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-dme' AND p.name = 'Margaret Williams';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 6200, 'CPAP equipment', '2 CPAP machines (lost first) • Premium mask replacements monthly • Out-of-network supplier', 2 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-dme' AND p.name = 'Robert Johnson';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 5800, 'Diabetic supplies', 'CGM sensors + insulin pump supplies • Testing 8x daily (above guidelines) • Brand-only test strips', 3 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-dme' AND p.name = 'Linda Martinez';

-- Medical Drugs (Specialty)
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 45200, 'Rheumatoid arthritis biologics', 'Humira biweekly x 8 months • Failed step therapy (started on biologic) • No biosimilar consideration', 1 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-specialty-drugs' AND p.name = 'Patricia Thompson';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 38900, 'Cancer immunotherapy', 'Keytruda infusions x 6 cycles • Hospital outpatient vs. physician office • No 340B pricing utilized', 2 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-specialty-drugs' AND p.name = 'William Davis';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 32400, 'Multiple sclerosis drugs', 'Ocrevus infusions • Switched from oral therapy after 2 months • Specialty pharmacy markup 23%', 3 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-specialty-drugs' AND p.name = 'Susan Miller';

-- Outpatient Surgery
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 18500, 'Orthopedic procedures', '3 knee injections then arthroscopy • No conservative PT trial • ASC cost 2x benchmark', 1 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-outpatient-surgery' AND p.name = 'James Anderson';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 15200, 'Cataract surgery', 'Bilateral cataracts + premium IOLs • Hospital-based vs. ASC ($4,200 difference) • Laser-assisted add-on', 2 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-outpatient-surgery' AND p.name = 'Barbara Taylor';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 12800, 'Pain management procedures', '4 epidural injections in 6 months • Facet joint ablation • No pain psychology referral', 3 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-outpatient-surgery' AND p.name = 'Richard Moore';

-- Inpatient Surgery
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 52400, 'Cardiac surgery', 'CABG x 3 vessels • 8-day LOS (benchmark 5) • ICU 4 days for afib management • Readmitted day 12', 1 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-inpatient-surgery' AND p.name = 'Charles Wilson';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 48900, 'Hip replacement', 'Total hip arthroplasty • 6-day LOS (benchmark 2) • Robotic-assisted ($8K implant premium) • SNF discharge', 2 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-inpatient-surgery' AND p.name = 'Dorothy Brown';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 41200, 'Spinal surgery', 'L4-L5 fusion • No conservative care trial • Premium hardware ($12K above standard) • 5-day LOS', 3 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-inpatient-surgery' AND p.name = 'Thomas Garcia';

-- Post-Acute Rehab
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 28400, 'Post-stroke rehab', 'SNF 28 days (benchmark 14) • Could have done home health day 10 • High-cost facility ($450/day vs. $280)', 1 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-post-acute' AND p.name = 'Elizabeth Jackson';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 24900, 'Post-surgical rehab', 'IRF 21 days post-hip surgery • Met home discharge criteria day 7 • Family preference for facility', 2 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-post-acute' AND p.name = 'George White';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 21200, 'Cardiac rehab', 'SNF 18 days for cardiac rehab • Outpatient cardiac rehab available • No care coordination at discharge', 3 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-post-acute' AND p.name = 'Nancy Harris';

-- Inpatient Medical
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 32100, 'CHF exacerbation', '3 admissions in 6 months • Poor med adherence (diuretics) • No home health follow-up • Missed cardiology f/u', 1 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-inpatient-medical' AND p.name = 'Kenneth Clark';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 28400, 'COPD exacerbation', '2 admissions + 1 observation • Still smoking • No pulmonary rehab • Rescue inhaler overuse', 2 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-inpatient-medical' AND p.name = 'Betty Lewis';
INSERT INTO gap_top_patients (gap_category_id, patient_id, spend, spend_category, cost_drivers, rank)
SELECT gc.id, p.id, 24900, 'Pneumonia', '7-day LOS (benchmark 4) • Delayed abx switch to oral • Social admit (lives alone) • No vaccines', 3 FROM gap_categories gc, patients p WHERE gc.slug = 'gap-inpatient-medical' AND p.name = 'Donald Robinson';

-- Care Gaps seed data
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Annual Wellness Visit', '2024-08-15', 98, 'Sarah Johnson', 'open' FROM patients WHERE name = 'Margaret Williams';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Diabetic Eye Exam', '2024-09-01', 81, 'Michael Chen', 'open' FROM patients WHERE name = 'Robert Johnson';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'HbA1c Test', '2024-09-15', 67, 'Sarah Johnson', 'open' FROM patients WHERE name = 'Linda Martinez';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Mammogram', '2024-10-01', 51, 'Emily Rodriguez', 'open' FROM patients WHERE name = 'Patricia Thompson';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Colonoscopy', '2024-07-20', 124, 'Michael Chen', 'open' FROM patients WHERE name = 'William Davis';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Bone Density Scan', '2024-10-10', 42, 'Sarah Johnson', 'open' FROM patients WHERE name = 'Susan Miller';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Flu Vaccination', '2024-10-20', 32, 'Emily Rodriguez', 'open' FROM patients WHERE name = 'James Anderson';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Blood Pressure Check', '2024-11-01', 20, 'Michael Chen', 'open' FROM patients WHERE name = 'Barbara Taylor';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Lipid Panel', '2024-08-30', 83, 'Sarah Johnson', 'open' FROM patients WHERE name = 'Richard Moore';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Cardiac Stress Test', '2024-09-20', 62, 'Emily Rodriguez', 'open' FROM patients WHERE name = 'Charles Wilson';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Pneumonia Vaccine', '2024-10-05', 47, 'Michael Chen', 'open' FROM patients WHERE name = 'Dorothy Brown';
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status)
SELECT id, 'Annual Wellness Visit', '2024-11-05', 16, 'Sarah Johnson', 'open' FROM patients WHERE name = 'Thomas Garcia';
