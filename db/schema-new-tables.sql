-- New Database Schema for Leadership Feedback Implementation
-- Created: 2025-12-04
-- Purpose: Support cost-focused performance insights with recommendations

-- ============================================================================
-- PERFORMANCE PERIODS
-- Stores different time periods for filtering (YTD, Last 12 months, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_periods (
  id SERIAL PRIMARY KEY,
  period_key VARCHAR(50) UNIQUE NOT NULL,        -- 'ytd', 'last_12_months', 'last_quarter'
  period_label VARCHAR(100) NOT NULL,             -- 'Year to Date', 'Last 12 Months'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE METRICS
-- Top-level metrics with period-over-period trending
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES performance_periods(id),
  metric_type VARCHAR(100) NOT NULL,              -- 'total_cost', 'patient_count', etc.
  current_value DECIMAL(15,2) NOT NULL,
  previous_value DECIMAL(15,2),
  change_percent DECIMAL(5,2),                    -- e.g., -4.2 (negative is good for cost)
  change_direction VARCHAR(10),                    -- 'up', 'down', 'flat'
  benchmark_value DECIMAL(15,2),
  is_above_benchmark BOOLEAN,
  display_format VARCHAR(50),                      -- 'currency', 'number', 'percent'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_id, metric_type)
);

-- ============================================================================
-- COST CATEGORIES (Enhanced with Utilization)
-- Replaces gap_categories with spending AND utilization data
-- ============================================================================
CREATE TABLE IF NOT EXISTS cost_categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,               -- 'acute-rehab', 'op-surgical', etc.
  category_name VARCHAR(255) NOT NULL,            -- 'Acute Rehab', 'OP Surgical'
  period_id INTEGER REFERENCES performance_periods(id),

  -- Spending Metrics
  spending_pmpm_actual DECIMAL(10,2) NOT NULL,    -- Actual spending PMPM
  spending_pmpm_benchmark DECIMAL(10,2) NOT NULL, -- Benchmark spending PMPM
  spending_variance_amount DECIMAL(10,2),         -- Dollar variance from benchmark
  spending_variance_percent DECIMAL(5,2),         -- Percent variance (22% above)

  -- Utilization Metrics
  utilization_actual DECIMAL(10,2) NOT NULL,      -- Admits/K, Visits/K, etc.
  utilization_benchmark DECIMAL(10,2) NOT NULL,   -- Benchmark utilization
  utilization_variance_percent DECIMAL(5,2),      -- Percent variance
  utilization_unit VARCHAR(50),                   -- 'admits_per_k', 'visits_per_k'

  -- Performance Status
  performance_status VARCHAR(20) NOT NULL,        -- 'red', 'yellow', 'green'
  is_opportunity BOOLEAN DEFAULT false,           -- Is this an opportunity area?
  is_strength BOOLEAN DEFAULT false,              -- Is this a strength area?

  -- Ranking
  aco_rank INTEGER,                               -- Rank within ACO (1 = best)
  total_categories INTEGER,                       -- Total number of categories for context

  -- Metadata
  description TEXT,                               -- Brief description of status
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast filtering by period and performance status
CREATE INDEX idx_cost_categories_period ON cost_categories(period_id);
CREATE INDEX idx_cost_categories_status ON cost_categories(performance_status);

-- ============================================================================
-- RECOMMENDATIONS (Unified Concept)
-- Replaces separate "opportunities" and "initiatives" with one unified system
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Status Tracking (convertible to workflows)
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',  -- 'not_started', 'accepted', 'rejected', 'already_doing'
  priority VARCHAR(20),                                -- 'high', 'medium', 'low'

  -- Impact Metrics
  estimated_savings DECIMAL(10,2),                     -- Estimated cost savings
  affected_lives INTEGER,                              -- Number of patients affected
  implementation_complexity VARCHAR(20),               -- 'low', 'medium', 'high'

  -- Patient Cohort Targeting
  patient_cohort TEXT,                                 -- 'dementia patients', 'diabetes patients', 'all patients'
  cohort_size INTEGER,                                 -- Number of patients in cohort

  -- Program Details
  has_program_details BOOLEAN DEFAULT false,           -- Does this have implementation resources?
  program_overview TEXT,                               -- Overview text for program page
  video_url VARCHAR(500),                              -- Video embed URL

  -- Workflow Conversion
  can_convert_to_workflow BOOLEAN DEFAULT false,       -- Can this be actioned in-app?
  workflow_type VARCHAR(50),                           -- Type of workflow if convertible

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_changed_at TIMESTAMP,
  status_changed_by VARCHAR(255)
);

-- Index for filtering by status and priority
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);

-- ============================================================================
-- RECOMMENDATION COST CATEGORIES (Many-to-Many Relationship)
-- Maps recommendations to the cost categories they affect
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendation_cost_categories (
  id SERIAL PRIMARY KEY,
  recommendation_id INTEGER REFERENCES recommendations(id) ON DELETE CASCADE,
  cost_category_id INTEGER REFERENCES cost_categories(id) ON DELETE CASCADE,
  impact_amount DECIMAL(10,2),                     -- How much this rec impacts this category
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recommendation_id, cost_category_id)
);

-- Index for fast lookups
CREATE INDEX idx_rec_cost_cat_recommendation ON recommendation_cost_categories(recommendation_id);
CREATE INDEX idx_rec_cost_cat_category ON recommendation_cost_categories(cost_category_id);

-- ============================================================================
-- PROGRAM RESOURCES
-- Implementation resources for recommendations
-- ============================================================================
CREATE TABLE IF NOT EXISTS program_resources (
  id SERIAL PRIMARY KEY,
  recommendation_id INTEGER REFERENCES recommendations(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,              -- 'best_practice', 'testimonial', 'implementation_step'
  title VARCHAR(255),
  content TEXT NOT NULL,
  display_order INTEGER,
  author VARCHAR(255),                             -- For testimonials
  author_role VARCHAR(255),                        -- For testimonials
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast filtering by recommendation and type
CREATE INDEX idx_program_resources_rec ON program_resources(recommendation_id);
CREATE INDEX idx_program_resources_type ON program_resources(resource_type);

-- ============================================================================
-- EFFICIENCY KPIS
-- Quality and efficiency KPIs compared to ACO benchmarks
-- ============================================================================
CREATE TABLE IF NOT EXISTS efficiency_kpis (
  id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES performance_periods(id),
  kpi_type VARCHAR(100) NOT NULL,                  -- 'readmission_rate', 'ed_rate', 'imaging_rate'
  kpi_label VARCHAR(255) NOT NULL,                 -- 'Readmission Rate', 'ED Visits per 1000'

  -- Values
  actual_value DECIMAL(10,2) NOT NULL,
  aco_benchmark DECIMAL(10,2),
  milliman_benchmark DECIMAL(10,2),                -- Optional Milliman benchmark

  -- Performance
  variance_percent DECIMAL(5,2),
  performance_status VARCHAR(20),                  -- 'good', 'warning', 'poor'

  -- Metadata
  display_format VARCHAR(50),                      -- 'percent', 'per_thousand', 'number'
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_id, kpi_type)
);

-- Index for fast filtering by period
CREATE INDEX idx_efficiency_kpis_period ON efficiency_kpis(period_id);

-- ============================================================================
-- COST OPPORTUNITIES SUMMARY
-- Top overspending and efficient areas for dashboard overview
-- ============================================================================
CREATE TABLE IF NOT EXISTS cost_opportunities (
  id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES performance_periods(id),
  cost_category_id INTEGER REFERENCES cost_categories(id),

  -- Classification
  opportunity_type VARCHAR(50) NOT NULL,           -- 'overspending', 'efficient', 'neutral'

  -- Metrics
  amount_variance DECIMAL(10,2),                   -- Dollar amount over/under benchmark
  percent_variance DECIMAL(5,2),                   -- Percent over/under
  aco_rank INTEGER,                                -- Ranking within ACO

  -- Display
  display_order INTEGER,
  show_on_dashboard BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_id, cost_category_id)
);

-- Index for fast dashboard queries
CREATE INDEX idx_cost_opportunities_period ON cost_opportunities(period_id);
CREATE INDEX idx_cost_opportunities_type ON cost_opportunities(opportunity_type);

-- ============================================================================
-- COST CATEGORY DETAIL TABLES
-- Detailed drill-down data for cost categories
-- ============================================================================

-- Hospitals contributing to cost categories
CREATE TABLE IF NOT EXISTS cost_category_hospitals (
  id SERIAL PRIMARY KEY,
  cost_category_id INTEGER REFERENCES cost_categories(id) ON DELETE CASCADE,
  hospital_name VARCHAR(255) NOT NULL,
  discharges INTEGER,
  avg_los DECIMAL(5,2),                            -- Average length of stay
  spend DECIMAL(10,2),
  readmission_rate DECIMAL(5,2),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DRGs (Diagnosis Related Groups) contributing to cost categories
CREATE TABLE IF NOT EXISTS cost_category_drgs (
  id SERIAL PRIMARY KEY,
  cost_category_id INTEGER REFERENCES cost_categories(id) ON DELETE CASCADE,
  drg_code VARCHAR(20),
  drg_description VARCHAR(500) NOT NULL,
  patient_count INTEGER,
  total_spend DECIMAL(10,2),
  avg_spend_per_patient DECIMAL(10,2),
  benchmark_avg DECIMAL(10,2),
  percent_above_benchmark DECIMAL(5,2),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discharging hospitals (for post-acute categories)
CREATE TABLE IF NOT EXISTS cost_category_discharging_hospitals (
  id SERIAL PRIMARY KEY,
  cost_category_id INTEGER REFERENCES cost_categories(id) ON DELETE CASCADE,
  hospital_name VARCHAR(255) NOT NULL,
  discharges INTEGER,
  percent_discharged_to_irf DECIMAL(5,2),         -- Percent to Inpatient Rehab Facility
  percent_discharged_to_irf_benchmark DECIMAL(5,2),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for current period cost categories with full details
CREATE OR REPLACE VIEW v_current_cost_categories AS
SELECT
  cc.*,
  pp.period_label,
  pp.period_key,
  CASE
    WHEN cc.performance_status = 'green' THEN 'Efficient'
    WHEN cc.performance_status = 'yellow' THEN 'Opportunity'
    WHEN cc.performance_status = 'red' THEN 'Priority'
    ELSE 'Unknown'
  END as status_label
FROM cost_categories cc
JOIN performance_periods pp ON cc.period_id = pp.id
WHERE pp.is_active = true;

-- View for recommendations with affected cost categories
CREATE OR REPLACE VIEW v_recommendations_with_categories AS
SELECT
  r.*,
  json_agg(
    json_build_object(
      'category_id', cc.id,
      'category_name', cc.category_name,
      'category_slug', cc.slug,
      'impact_amount', rcc.impact_amount
    )
  ) FILTER (WHERE cc.id IS NOT NULL) as affected_categories
FROM recommendations r
LEFT JOIN recommendation_cost_categories rcc ON r.id = rcc.recommendation_id
LEFT JOIN cost_categories cc ON rcc.cost_category_id = cc.id
GROUP BY r.id;

-- ============================================================================
-- SAMPLE DATA COMMENTS
-- ============================================================================

-- Example Performance Period:
-- INSERT INTO performance_periods (period_key, period_label, start_date, end_date)
-- VALUES ('ytd', 'Year to Date', '2025-01-01', '2025-12-31');

-- Example Cost Category (GREEN - Efficient):
-- INSERT INTO cost_categories (
--   slug, category_name, period_id,
--   spending_pmpm_actual, spending_pmpm_benchmark,
--   utilization_actual, utilization_benchmark,
--   performance_status, is_strength
-- ) VALUES (
--   'primary-care', 'Primary Care', 1,
--   180.00, 210.00, -- $30 PMPM below benchmark
--   4.2, 4.5, -- Slightly lower utilization
--   'green', true
-- );

-- Example Recommendation:
-- INSERT INTO recommendations (
--   title, description, status, priority,
--   estimated_savings, affected_lives,
--   patient_cohort, has_program_details
-- ) VALUES (
--   'Implement care management program for dementia patients',
--   'Deploy specialized care coordinators...',
--   'not_started', 'high',
--   85000, 412,
--   'dementia patients', true
-- );

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- This schema is designed to:
-- 1. Coexist with existing gap_categories table (don't drop it)
-- 2. Support period-based filtering (YTD, Last 12 months, etc.)
-- 3. Show BOTH spending and utilization metrics side-by-side
-- 4. Support green/yellow/red performance statuses
-- 5. Enable unified recommendations with status tracking
-- 6. Map recommendations to multiple cost categories
-- 7. Store program implementation resources
-- 8. Support drill-down views with hospitals, DRGs, etc.

