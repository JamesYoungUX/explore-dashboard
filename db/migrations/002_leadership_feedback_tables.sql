-- Migration 002: Leadership Feedback Tables
-- Created: 2025-12-04
-- Description: Add tables for cost performance insights, recommendations, and enhanced cost categories

-- ============================================================================
-- PERFORMANCE PERIODS
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_periods (
  id SERIAL PRIMARY KEY,
  period_key VARCHAR(50) UNIQUE NOT NULL,
  period_label VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE METRICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES performance_periods(id),
  metric_type VARCHAR(100) NOT NULL,
  current_value DECIMAL(15,2) NOT NULL,
  previous_value DECIMAL(15,2),
  change_percent DECIMAL(5,2),
  change_direction VARCHAR(10),
  benchmark_value DECIMAL(15,2),
  is_above_benchmark BOOLEAN,
  display_format VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_id, metric_type)
);

-- ============================================================================
-- COST CATEGORIES (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cost_categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  period_id INTEGER REFERENCES performance_periods(id),

  -- Spending Metrics
  spending_pmpm_actual DECIMAL(10,2) NOT NULL,
  spending_pmpm_benchmark DECIMAL(10,2) NOT NULL,
  spending_variance_amount DECIMAL(10,2),
  spending_variance_percent DECIMAL(5,2),

  -- Utilization Metrics
  utilization_actual DECIMAL(10,2) NOT NULL,
  utilization_benchmark DECIMAL(10,2) NOT NULL,
  utilization_variance_percent DECIMAL(5,2),
  utilization_unit VARCHAR(50),

  -- Performance Status
  performance_status VARCHAR(20) NOT NULL,
  is_opportunity BOOLEAN DEFAULT false,
  is_strength BOOLEAN DEFAULT false,

  -- Ranking
  aco_rank INTEGER,
  total_categories INTEGER,

  -- Metadata
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cost_categories_period ON cost_categories(period_id);
CREATE INDEX IF NOT EXISTS idx_cost_categories_status ON cost_categories(performance_status);

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Status Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  priority VARCHAR(20),

  -- Impact Metrics
  estimated_savings DECIMAL(10,2),
  affected_lives INTEGER,
  implementation_complexity VARCHAR(20),

  -- Patient Cohort Targeting
  patient_cohort TEXT,
  cohort_size INTEGER,

  -- Program Details
  has_program_details BOOLEAN DEFAULT false,
  program_overview TEXT,
  video_url VARCHAR(500),

  -- Workflow Conversion
  can_convert_to_workflow BOOLEAN DEFAULT false,
  workflow_type VARCHAR(50),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_changed_at TIMESTAMP,
  status_changed_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(priority);

-- ============================================================================
-- RECOMMENDATION COST CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendation_cost_categories (
  id SERIAL PRIMARY KEY,
  recommendation_id INTEGER REFERENCES recommendations(id) ON DELETE CASCADE,
  cost_category_id INTEGER REFERENCES cost_categories(id) ON DELETE CASCADE,
  impact_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recommendation_id, cost_category_id)
);

CREATE INDEX IF NOT EXISTS idx_rec_cost_cat_recommendation ON recommendation_cost_categories(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_rec_cost_cat_category ON recommendation_cost_categories(cost_category_id);

-- ============================================================================
-- PROGRAM RESOURCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS program_resources (
  id SERIAL PRIMARY KEY,
  recommendation_id INTEGER REFERENCES recommendations(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  display_order INTEGER,
  author VARCHAR(255),
  author_role VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_program_resources_rec ON program_resources(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_program_resources_type ON program_resources(resource_type);

-- ============================================================================
-- EFFICIENCY KPIS
-- ============================================================================
CREATE TABLE IF NOT EXISTS efficiency_kpis (
  id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES performance_periods(id),
  kpi_type VARCHAR(100) NOT NULL,
  kpi_label VARCHAR(255) NOT NULL,

  -- Values
  actual_value DECIMAL(10,2) NOT NULL,
  aco_benchmark DECIMAL(10,2),
  milliman_benchmark DECIMAL(10,2),

  -- Performance
  variance_percent DECIMAL(5,2),
  performance_status VARCHAR(20),

  -- Metadata
  display_format VARCHAR(50),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_id, kpi_type)
);

CREATE INDEX IF NOT EXISTS idx_efficiency_kpis_period ON efficiency_kpis(period_id);

-- ============================================================================
-- COST OPPORTUNITIES SUMMARY
-- ============================================================================
CREATE TABLE IF NOT EXISTS cost_opportunities (
  id SERIAL PRIMARY KEY,
  period_id INTEGER REFERENCES performance_periods(id),
  cost_category_id INTEGER REFERENCES cost_categories(id),

  -- Classification
  opportunity_type VARCHAR(50) NOT NULL,

  -- Metrics
  amount_variance DECIMAL(10,2),
  percent_variance DECIMAL(5,2),
  aco_rank INTEGER,

  -- Display
  display_order INTEGER,
  show_on_dashboard BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_id, cost_category_id)
);

CREATE INDEX IF NOT EXISTS idx_cost_opportunities_period ON cost_opportunities(period_id);
CREATE INDEX IF NOT EXISTS idx_cost_opportunities_type ON cost_opportunities(opportunity_type);

-- ============================================================================
-- COST CATEGORY DETAIL TABLES
-- ============================================================================

-- Hospitals
CREATE TABLE IF NOT EXISTS cost_category_hospitals (
  id SERIAL PRIMARY KEY,
  cost_category_id INTEGER REFERENCES cost_categories(id) ON DELETE CASCADE,
  hospital_name VARCHAR(255) NOT NULL,
  discharges INTEGER,
  avg_los DECIMAL(5,2),
  spend DECIMAL(10,2),
  readmission_rate DECIMAL(5,2),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DRGs
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

-- Discharging Hospitals
CREATE TABLE IF NOT EXISTS cost_category_discharging_hospitals (
  id SERIAL PRIMARY KEY,
  cost_category_id INTEGER REFERENCES cost_categories(id) ON DELETE CASCADE,
  hospital_name VARCHAR(255) NOT NULL,
  discharges INTEGER,
  percent_discharged_to_irf DECIMAL(5,2),
  percent_discharged_to_irf_benchmark DECIMAL(5,2),
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Current cost categories with period info
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

-- Recommendations with affected categories
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
