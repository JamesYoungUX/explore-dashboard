# Archived Database Scripts

This folder contains old, unused, or one-time database scripts that are no longer needed for regular operations.

## Archived Files

### Old Seed Files
- `seed.sql` - Original seed file (replaced by seed-v2.sql)
- `seed-gaps.sql` - Gap-specific seed data (integrated into main seed)
- `reset-to-initial-state.js` - Old reset script (replaced by API reset endpoint)
- `reset-prototype.js` - Prototype reset script (replaced by API reset endpoint)
- `manual-seed-complete.js` - Manual seeding script (no longer needed)
- `add-cost-opportunities.js` - One-time script to add cost opportunities

### One-Time Fix Scripts (2025-12-05)
These scripts were created to fix data issues and are no longer needed:
- `fix-ip-surgical.js` - Replaced Specialty Drugs with IP Surgical
- `fix-display-order.js` - Fixed display order for cost opportunities
- `fix-all-cost-opportunities.js` - Comprehensive fix for all cost opportunities
- `update-cost-opportunities.js` - Updated cost opportunity display orders

### Diagnostic Scripts
- `check-cost-opportunities.js` - Checked cost opportunities in database
- `check-categories.js` - Checked categories for YTD period
- `test-api-data.js` - Tested API data retrieval
- `test-reset-state.js` - Verified database state after reset

## Active Files (in parent db/ directory)

### Seed Files (DO NOT ARCHIVE)
- `seed-v2.sql` - **PRIMARY SEED FILE** - Used by Reset Database button in Settings
- `seed-new-data.sql` - Identical to seed-v2.sql, used by seed-full-data.js
- `seed-full-data.js` - Script to run seed-new-data.sql

### Utility Scripts (DO NOT ARCHIVE)
- `check-db-state.js` - General database state checker
- `check-good-kpis.js` - KPI verification
- Various `update-*.js` scripts - Active update scripts for specific data

## Notes
- The Reset Database button in Settings uses `seed-v2.sql`
- Both `seed-v2.sql` and `seed-new-data.sql` are identical and contain the correct data
- If you need to modify seed data, update BOTH files to keep them in sync
