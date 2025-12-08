# Changelog

## 2025-12-08

### Fixed
- **Performance Metrics Display Order**: Corrected the order of metrics in the Cost Performance Insights page top card
  - New order: Patient Count → Risk Score → Cost PMPM → Total Cost → Cost Savings Opportunity
  - Total Cost now appears between Cost PMPM and Cost Savings Opportunity as intended
  - Database migration: `db/reorder-metrics.js` (already applied to production database)
