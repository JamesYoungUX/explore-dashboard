# New Database Schema Explanation

## Overview
This document explains the new database schema designed to support the leadership feedback redesign. The schema enables a cost-focused dashboard with spending + utilization metrics, unified recommendations, and balanced performance views (showing both problems AND strengths).

---

## Key Design Principles

### 1. **Period-Based Data**
Everything is tied to a `performance_period` so users can filter by:
- Year to Date (YTD)
- Last 12 Months
- Last Quarter
- Custom periods

### 2. **Spending + Utilization Side-by-Side**
The `cost_categories` table stores BOTH:
- **Spending metrics:** PMPM actual vs benchmark
- **Utilization metrics:** Admits/K, Visits/K vs benchmark

This lets users understand if something is expensive OR just overused.

### 3. **Green/Yellow/Red Performance**
Categories are marked as:
- 🔴 **Red:** Priority issues (overspending)
- 🟡 **Yellow:** Opportunities (moderate issues)
- 🟢 **Green:** Strengths (performing well, saving money)

This shows **balanced performance**, not just problems.

### 4. **Unified Recommendations**
One `recommendations` table instead of separate "opportunities" and "initiatives":
- Status tracking: `not_started`, `accepted`, `rejected`, `already_doing`
- Convertible to workflows
- Can affect multiple cost categories (many-to-many relationship)

### 5. **Database-Driven, No Mock Data**
All data comes from the database via API. No hardcoded values in components.

---

## Core Tables

### 1. `performance_periods`
**Purpose:** Store time period definitions for filtering

| Column | Type | Description |
|--------|------|-------------|
| period_key | VARCHAR(50) | Unique key: 'ytd', 'last_12_months' |
| period_label | VARCHAR(100) | Display label: "Year to Date" |
| start_date | DATE | Period start date |
| end_date | DATE | Period end date |
| is_active | BOOLEAN | Is this the current active period? |

**Example:**
```sql
INSERT INTO performance_periods (period_key, period_label, start_date, end_date, is_active)
VALUES ('ytd', 'Year to Date', '2025-01-01', '2025-12-31', true);
```

---

### 2. `performance_metrics`
**Purpose:** Top-level metrics with period-over-period trending

| Column | Type | Description |
|--------|------|-------------|
| period_id | INTEGER | Reference to performance_periods |
| metric_type | VARCHAR(100) | 'total_cost', 'patient_count', etc. |
| current_value | DECIMAL(15,2) | Current period value |
| previous_value | DECIMAL(15,2) | Previous period value |
| change_percent | DECIMAL(5,2) | % change (e.g., -4.2) |
| change_direction | VARCHAR(10) | 'up', 'down', 'flat' |
| benchmark_value | DECIMAL(15,2) | Benchmark value |

**Supports:** Top metrics section with ↑↓ trending indicators

**Example:**
```sql
INSERT INTO performance_metrics (period_id, metric_type, current_value, previous_value, change_percent, change_direction)
VALUES (1, 'total_cost', 1680000, 1742000, -3.6, 'down');
```

---

### 3. `cost_categories` ⭐ **Key Table**
**Purpose:** Enhanced cost categories with spending AND utilization

| Column | Type | Description |
|--------|------|-------------|
| slug | VARCHAR(50) | 'acute-rehab', 'op-surgical' |
| category_name | VARCHAR(255) | 'Acute Rehab', 'OP Surgical' |
| **Spending Metrics** |
| spending_pmpm_actual | DECIMAL(10,2) | Actual spending PMPM |
| spending_pmpm_benchmark | DECIMAL(10,2) | Benchmark PMPM |
| spending_variance_amount | DECIMAL(10,2) | Dollar variance |
| spending_variance_percent | DECIMAL(5,2) | Percent variance (22% above) |
| **Utilization Metrics** |
| utilization_actual | DECIMAL(10,2) | Admits/K, Visits/K |
| utilization_benchmark | DECIMAL(10,2) | Benchmark utilization |
| utilization_variance_percent | DECIMAL(5,2) | Percent variance |
| utilization_unit | VARCHAR(50) | 'admits_per_k', 'visits_per_k' |
| **Performance Status** |
| performance_status | VARCHAR(20) | 'red', 'yellow', 'green' |
| is_opportunity | BOOLEAN | Is this an opportunity? |
| is_strength | BOOLEAN | Is this a strength? |
| aco_rank | INTEGER | Rank within ACO |

**Why This Design:**
- Shows if category is expensive vs overused
- Supports balanced view (problems + strengths)
- Enables "you're saving $80K here" messaging

**Example (RED - Overspending):**
```sql
INSERT INTO cost_categories (
  slug, category_name, period_id,
  spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_percent,
  utilization_actual, utilization_benchmark, utilization_variance_percent,
  performance_status, is_opportunity, aco_rank
) VALUES (
  'acute-rehab', 'Acute Rehab', 1,
  150.00, 84.10, 22, -- 22% above benchmark spending
  9.8, 9.0, 8.9, -- 8.9% above benchmark utilization
  'red', true, 15 -- Ranked 15th in ACO (worse)
);
```

**Example (GREEN - Efficient):**
```sql
INSERT INTO cost_categories (
  slug, category_name, period_id,
  spending_pmpm_actual, spending_pmpm_benchmark, spending_variance_percent,
  utilization_actual, utilization_benchmark, utilization_variance_percent,
  performance_status, is_strength, aco_rank
) VALUES (
  'primary-care', 'Primary Care', 1,
  180.00, 210.00, -14.3, -- 14% BELOW benchmark (saving money!)
  4.2, 4.5, -6.7, -- Lower utilization too
  'green', true, 3 -- Ranked 3rd in ACO (excellent)
);
```

---

### 4. `recommendations` ⭐ **Key Table**
**Purpose:** Unified recommendations (replaces opportunities + initiatives)

| Column | Type | Description |
|--------|------|-------------|
| title | VARCHAR(255) | Recommendation title |
| description | TEXT | Detailed description |
| **Status Tracking** |
| status | VARCHAR(50) | 'not_started', 'accepted', 'rejected', 'already_doing' |
| priority | VARCHAR(20) | 'high', 'medium', 'low' |
| **Impact Metrics** |
| estimated_savings | DECIMAL(10,2) | Estimated cost savings |
| affected_lives | INTEGER | Number of patients affected |
| **Patient Cohort** |
| patient_cohort | TEXT | 'dementia patients', 'all patients' |
| cohort_size | INTEGER | Size of cohort |
| **Program Details** |
| has_program_details | BOOLEAN | Has implementation resources? |
| program_overview | TEXT | Overview for program page |
| video_url | VARCHAR(500) | Video embed URL |
| **Workflow Conversion** |
| can_convert_to_workflow | BOOLEAN | Can be actioned in-app? |
| workflow_type | VARCHAR(50) | Type of workflow |

**Example:**
```sql
INSERT INTO recommendations (
  title, description, status, priority,
  estimated_savings, affected_lives,
  patient_cohort, cohort_size,
  has_program_details, can_convert_to_workflow
) VALUES (
  'Implement care management program for high-cost patients',
  'Deploy specialized care coordinators to manage top 5% highest-cost patients with complex conditions',
  'not_started', 'high',
  85000, 412,
  'high-cost patients (top 5%)', 76,
  true, true
);
```

---

### 5. `recommendation_cost_categories`
**Purpose:** Many-to-many mapping of recommendations to cost categories

| Column | Type | Description |
|--------|------|-------------|
| recommendation_id | INTEGER | Reference to recommendations |
| cost_category_id | INTEGER | Reference to cost_categories |
| impact_amount | DECIMAL(10,2) | How much this affects this category |

**Why:** A single recommendation can impact multiple cost categories.

**Example:**
```sql
-- Dementia care program affects ED spending AND inpatient medical
INSERT INTO recommendation_cost_categories (recommendation_id, cost_category_id, impact_amount)
VALUES (1, 5, 45000), (1, 8, 28000);
```

---

### 6. `program_resources`
**Purpose:** Store best practices, testimonials, implementation steps

| Column | Type | Description |
|--------|------|-------------|
| recommendation_id | INTEGER | Reference to recommendations |
| resource_type | VARCHAR(50) | 'best_practice', 'testimonial', 'implementation_step' |
| content | TEXT | Resource content |
| author | VARCHAR(255) | For testimonials |
| display_order | INTEGER | Sort order |

**Example:**
```sql
INSERT INTO program_resources (recommendation_id, resource_type, title, content, display_order)
VALUES (1, 'implementation_step', 'Step 1', 'Identify top 5% high-cost patients using claims data', 1);

INSERT INTO program_resources (recommendation_id, resource_type, content, author, author_role, display_order)
VALUES (1, 'testimonial', 'This program reduced our high-cost spend by 18% in 6 months', 'Dr. Sarah Chen', 'CMO, Valley Medical Group', 1);
```

---

### 7. `efficiency_kpis`
**Purpose:** Store quality/efficiency KPIs compared to ACO benchmarks

| Column | Type | Description |
|--------|------|-------------|
| period_id | INTEGER | Reference to performance_periods |
| kpi_type | VARCHAR(100) | 'readmission_rate', 'ed_rate' |
| kpi_label | VARCHAR(255) | Display label |
| actual_value | DECIMAL(10,2) | Actual value |
| aco_benchmark | DECIMAL(10,2) | ACO benchmark |
| milliman_benchmark | DECIMAL(10,2) | Optional Milliman |
| performance_status | VARCHAR(20) | 'good', 'warning', 'poor' |

**Example:**
```sql
INSERT INTO efficiency_kpis (period_id, kpi_type, kpi_label, actual_value, aco_benchmark, performance_status)
VALUES (1, 'readmission_rate', 'Readmission Rate', 8.2, 6.5, 'warning');
```

---

### 8. `cost_opportunities`
**Purpose:** Summary table for dashboard "Cost Opportunities" section

| Column | Type | Description |
|--------|------|-------------|
| period_id | INTEGER | Reference to performance_periods |
| cost_category_id | INTEGER | Reference to cost_categories |
| opportunity_type | VARCHAR(50) | 'overspending', 'efficient', 'neutral' |
| amount_variance | DECIMAL(10,2) | Dollar variance |
| aco_rank | INTEGER | ACO ranking |
| show_on_dashboard | BOOLEAN | Show on main dashboard? |

**Why:** Pre-computed view for fast dashboard loading.

---

### 9. Drill-Down Tables

#### `cost_category_hospitals`
Hospital-level detail for cost categories.

#### `cost_category_drgs`
DRG (Diagnosis Related Group) detail.

#### `cost_category_discharging_hospitals`
Discharging hospital detail (for post-acute rehab, etc.).

---

## Key Views

### `v_current_cost_categories`
Combines cost_categories with active period info.

### `v_recommendations_with_categories`
Shows recommendations with all affected cost categories as JSON array.

---

## How This Addresses Leadership Feedback

### ✅ Cost-Focused
- `performance_metrics` stores top cost metrics
- `cost_categories` is the primary organizing principle
- All data shows cost impact

### ✅ Spending + Utilization Side-by-Side
- `cost_categories` has both spending and utilization columns
- Shows if category is expensive vs overused

### ✅ Balanced View (Problems + Wins)
- `performance_status` = 'green', 'yellow', 'red'
- `is_strength` flag highlights efficient areas
- `cost_opportunities` includes 'efficient' type
- **Shows categories that offset shortfalls**

### ✅ Unified Recommendations
- Single `recommendations` table
- Status tracking (not_started → accepted → workflow)
- Maps to multiple cost categories

### ✅ Period Filtering
- `performance_periods` table
- All metrics tied to periods
- YTD, Last 12 months, Last quarter support

### ✅ Program Implementation
- `program_resources` table
- Supports videos, best practices, testimonials
- Implementation steps

### ✅ Database-Driven
- No mock data in code
- All data from API endpoints
- Flexible JSONB where needed

### ✅ Workflow Conversion
- `can_convert_to_workflow` flag
- `status` tracking
- Ready to integrate with workflow system

---

## Migration Strategy

### Phase 1: Create New Tables
```bash
psql $DATABASE_URL -f db/schema-new-tables.sql
```

### Phase 2: Seed Initial Data
1. Create performance periods (YTD, Last 12 months, etc.)
2. Populate cost_categories with balanced data (red/yellow/green)
3. Create recommendations
4. Map recommendations to cost categories
5. Add program resources

### Phase 3: Keep Old Tables
**DO NOT DROP:**
- `gap_categories` (old system still needs it)
- All existing workflow tables

**Coexistence Strategy:**
- Old DashboardOverview uses old tables
- New CostPerformanceInsights uses new tables
- Both work simultaneously during transition

---

## Next Steps

1. ✅ Schema designed
2. Create migration file
3. Build seed data script
4. Create API endpoints
5. Build frontend components
6. Test coexistence with old system

---

## Questions or Issues?

See `BACKUP_DOCUMENTATION.md` for rollback instructions if needed.
