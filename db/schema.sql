-- ACO Dashboard Database Schema

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  mrn VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  risk_score DECIMAL(5,2),
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- High cost patients
CREATE TABLE IF NOT EXISTS high_cost_patients (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  total_cost DECIMAL(10,2),
  primary_diagnosis VARCHAR(255),
  case_manager VARCHAR(255),
  status VARCHAR(50),
  days_open INTEGER,
  expected_savings DECIMAL(10,2),
  next_action VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Readmissions
CREATE TABLE IF NOT EXISTS readmissions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  admission_date DATE,
  readmission_date DATE,
  days_between INTEGER,
  diagnosis VARCHAR(255),
  case_manager VARCHAR(255),
  status VARCHAR(50),
  expected_savings DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ED visits
CREATE TABLE IF NOT EXISTS ed_visits (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  visit_date DATE,
  reason VARCHAR(255),
  preventable BOOLEAN,
  cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication adherence
CREATE TABLE IF NOT EXISTS medication_adherence (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  medication VARCHAR(255),
  adherence_rate DECIMAL(5,2),
  case_manager VARCHAR(255),
  status VARCHAR(50),
  last_fill_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Care gaps
CREATE TABLE IF NOT EXISTS care_gaps (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  gap_type VARCHAR(255),
  due_date DATE,
  days_overdue INTEGER,
  case_manager VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  referral_date DATE,
  specialty VARCHAR(255),
  in_network BOOLEAN,
  cost DECIMAL(10,2),
  case_manager VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard metrics (for caching aggregated data)
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) UNIQUE NOT NULL,
  metric_value JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gap categories for cost saving opportunities
CREATE TABLE IF NOT EXISTS gap_categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  percent INTEGER NOT NULL,
  description VARCHAR(255),
  current_spend VARCHAR(100),
  last_year_spend VARCHAR(100),
  top_performer_spend VARCHAR(100),
  solutions TEXT[],
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Top doctors by gap category
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

-- Top patients by gap category
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
