-- Migration 004: Fix cost_categories slug constraint
-- Allow same slug across different periods

-- Drop the unique constraint on slug alone
ALTER TABLE cost_categories DROP CONSTRAINT IF EXISTS cost_categories_slug_key;

-- Add a composite unique constraint on (slug, period_id)
ALTER TABLE cost_categories ADD CONSTRAINT cost_categories_slug_period_unique UNIQUE (slug, period_id);
