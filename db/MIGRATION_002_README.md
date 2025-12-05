# Migration 002: Leadership Feedback Tables

## Overview
This migration adds all new tables required for the leadership feedback implementation, including:
- Performance periods and metrics
- Enhanced cost categories with utilization
- Unified recommendations system
- Program resources
- Efficiency KPIs
- Cost opportunities
- Detail tables for drill-downs

## Prerequisites

### 1. Environment Setup
Ensure your `.env` file has the `DATABASE_URL` variable set:
```bash
DATABASE_URL=postgresql://your-neon-connection-string
```

### 2. Existing Database
The original schema should already be in place. This migration will ADD new tables without affecting existing ones.

## Running the Migration

### Option 1: Run Migration Script (Recommended)
```bash
node db/run-migration-002.js
```

This script will:
- ✓ Create all new tables
- ✓ Create indexes for performance
- ✓ Create views for common queries
- ✓ Skip tables that already exist (idempotent)
- ✓ Verify all tables were created successfully

### Option 2: Manual psql Execution
```bash
psql $DATABASE_URL -f db/migrations/002_leadership_feedback_tables.sql
```

## What Gets Created

### Core Tables (11 total)

1. **`performance_periods`** - Time period definitions
   - YTD, Last 12 months, Last quarter, etc.

2. **`performance_metrics`** - Top-level metrics with trending
   - Total cost, patient count, quality scores
   - Period-over-period changes

3. **`cost_categories`** - Enhanced cost categories
   - Spending metrics (PMPM actual vs benchmark)
   - Utilization metrics (admits/K, visits/K)
   - Performance status (red/yellow/green)
   - ACO rankings

4. **`recommendations`** - Unified recommendations
   - Status tracking (not_started → accepted → rejected → already_doing)
   - Impact metrics
   - Patient cohort targeting
   - Workflow conversion flags

5. **`recommendation_cost_categories`** - Many-to-many mapping
   - Links recommendations to affected cost categories

6. **`program_resources`** - Implementation resources
   - Best practices
   - Testimonials
   - Implementation steps

7. **`efficiency_kpis`** - Quality/efficiency metrics
   - Readmission rate, ED rate, etc.
   - ACO and Milliman benchmarks

8. **`cost_opportunities`** - Dashboard summary
   - Pre-computed overspending/efficient areas

9. **`cost_category_hospitals`** - Hospital drill-down data

10. **`cost_category_drgs`** - DRG drill-down data

11. **`cost_category_discharging_hospitals`** - Discharging hospital data

### Views (2 total)

1. **`v_current_cost_categories`** - Current period cost categories with labels

2. **`v_recommendations_with_categories`** - Recommendations with affected categories as JSON

## Verification

After running the migration, verify tables exist:

```bash
psql $DATABASE_URL -c "\dt"
```

You should see all 11 new tables listed.

Check table structure:
```bash
psql $DATABASE_URL -c "\d cost_categories"
```

## Rollback

If you need to remove these tables:

```sql
DROP VIEW IF EXISTS v_recommendations_with_categories CASCADE;
DROP VIEW IF EXISTS v_current_cost_categories CASCADE;

DROP TABLE IF EXISTS cost_category_discharging_hospitals CASCADE;
DROP TABLE IF EXISTS cost_category_drgs CASCADE;
DROP TABLE IF EXISTS cost_category_hospitals CASCADE;
DROP TABLE IF EXISTS cost_opportunities CASCADE;
DROP TABLE IF EXISTS efficiency_kpis CASCADE;
DROP TABLE IF EXISTS program_resources CASCADE;
DROP TABLE IF EXISTS recommendation_cost_categories CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS cost_categories CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS performance_periods CASCADE;
```

**⚠️ Warning:** This will delete all data in these tables. Make sure you have a backup!

## Next Steps

After running this migration:

1. **Seed the database** with initial data
   ```bash
   node db/seed-new-data.js
   ```

2. **Build API endpoints** to expose this data
   - `/api/performance-insights`
   - `/api/cost-categories`
   - `/api/recommendations`

3. **Create frontend components** to consume the API
   - CostPerformanceInsights
   - CostSavingDeepDive
   - Recommendations
   - ProgramImplementation

## Troubleshooting

### Error: "DATABASE_URL is not set"
Make sure your `.env` file exists and contains:
```
DATABASE_URL=postgresql://...
```

### Error: "relation already exists"
This is normal if you've run the migration before. The script will skip existing tables.

### Error: "could not connect to server"
Check that your Neon database is running and the connection string is correct.

### Permission errors
Make sure your database user has CREATE TABLE permissions.

## Migration Details

- **File:** `db/migrations/002_leadership_feedback_tables.sql`
- **Runner:** `db/run-migration-002.js`
- **Created:** 2025-12-04
- **Estimated time:** ~30 seconds
- **Idempotent:** Yes (can run multiple times safely)
- **Breaking changes:** None (only adds new tables)

## Schema Documentation

For detailed schema documentation, see:
- `db/NEW_SCHEMA_EXPLANATION.md` - Full schema guide with examples
- `db/schema-new-tables.sql` - Schema file with inline comments
