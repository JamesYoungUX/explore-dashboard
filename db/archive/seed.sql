-- Seed data for ACO Dashboard

-- Insert sample patients
INSERT INTO patients (mrn, name, age, risk_score, total_cost) VALUES
('MRN001', 'Robert Martinez', 67, 4.2, 187500),
('MRN002', 'Patricia Chen', 72, 3.8, 156200),
('MRN003', 'James Wilson', 58, 3.5, 98400),
('MRN004', 'Linda Thompson', 65, 2.9, 54300),
('MRN005', 'Michael Brown', 70, 2.1, 42100);

-- Insert high cost patients
INSERT INTO high_cost_patients (patient_id, total_cost, primary_diagnosis, case_manager, status, days_open, expected_savings, next_action) VALUES
(1, 187500, 'CHF, COPD, Diabetes', 'Sarah Johnson', 'In Progress', 45, 75000, 'Schedule care coordination meeting'),
(2, 156200, 'ESRD, Hypertension', 'Michael Chen', 'In Progress', 32, 62000, 'Review medication adherence'),
(3, 98400, 'Cancer Treatment', 'Sarah Johnson', 'New', 12, 39000, 'Initial assessment scheduled'),
(4, 54300, 'Multiple Chronic Conditions', 'Emily Rodriguez', 'In Progress', 28, 22000, 'Follow-up with PCP'),
(5, 42100, 'Post-Surgical Complications', 'Michael Chen', 'Monitoring', 67, 17000, 'Monthly check-in');

-- Insert readmissions
INSERT INTO readmissions (patient_id, admission_date, readmission_date, days_between, diagnosis, case_manager, status, expected_savings) VALUES
(1, '2024-10-15', '2024-10-28', 13, 'CHF Exacerbation', 'Sarah Johnson', 'Active', 28000),
(2, '2024-09-20', '2024-10-05', 15, 'Infection', 'Michael Chen', 'Resolved', 18000),
(3, '2024-10-01', '2024-10-18', 17, 'Dehydration', 'Emily Rodriguez', 'Active', 23000);

-- Insert medication adherence records
INSERT INTO medication_adherence (patient_id, medication, adherence_rate, case_manager, status, last_fill_date) VALUES
(1, 'Metformin', 45, 'Sarah Johnson', 'Critical', '2024-09-15'),
(2, 'Lisinopril', 52, 'Michael Chen', 'At Risk', '2024-10-01'),
(3, 'Atorvastatin', 38, 'Emily Rodriguez', 'Critical', '2024-08-20'),
(4, 'Warfarin', 58, 'Sarah Johnson', 'At Risk', '2024-10-10');

-- Insert care gaps
INSERT INTO care_gaps (patient_id, gap_type, due_date, days_overdue, case_manager, status) VALUES
(1, 'Annual Wellness Visit', '2024-09-01', 45, 'Sarah Johnson', 'Overdue'),
(2, 'Diabetic Eye Exam', '2024-08-15', 62, 'Michael Chen', 'Overdue'),
(3, 'Colorectal Screening', '2024-10-01', 15, 'Emily Rodriguez', 'Overdue'),
(4, 'HbA1c Test', '2024-09-20', 26, 'Sarah Johnson', 'Overdue');

-- Insert dashboard metrics
INSERT INTO dashboard_metrics (metric_name, metric_value) VALUES
('total_cost', '{"value": 12450000, "label": "12.45M"}'),
('total_patients', '{"value": 1487}'),
('quality_measures', '{"value": 87}'),
('cost_distribution', '{"high_cost": 538, "readmissions": 69, "ed": 38, "other": 1205}'),
('cost_trend', '[
  {"month": "May", "cost2024": 1020, "cost2025": 985},
  {"month": "Jun", "cost2024": 1035, "cost2025": 998},
  {"month": "Jul", "cost2024": 1048, "cost2025": 1015},
  {"month": "Aug", "cost2024": 1062, "cost2025": 1028},
  {"month": "Sep", "cost2024": 1055, "cost2025": 1042},
  {"month": "Oct", "cost2024": 1042, "cost2025": 1035}
]'),
('medication_adherence', '{"adherent": 52, "non_adherent": 48}');
