-- Migration 003: Add 'acknowledged' status and measurable tracking
-- This migration adds the ability to acknowledge recommendations and track if they're measurable in ACO software

-- Add is_measurable field to recommendations table
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS is_measurable BOOLEAN DEFAULT true;

-- Update the status check constraint to include 'acknowledged'
-- First drop the existing constraint
ALTER TABLE recommendations
DROP CONSTRAINT IF EXISTS recommendations_status_check;

-- Add the new constraint with 'acknowledged' status
ALTER TABLE recommendations
ADD CONSTRAINT recommendations_status_check
CHECK (status IN ('not_started', 'acknowledged', 'accepted', 'rejected', 'already_doing', 'in_progress', 'completed'));

-- Update existing recommendations to set is_measurable based on their type
-- Measurable: readmissions, ED visits, care gaps, medication adherence, etc.
-- External: staffing, contracts, facility changes, etc.

UPDATE recommendations
SET is_measurable = true
WHERE title ILIKE ANY (ARRAY[
  '%readmission%',
  '%care gap%',
  '%medication%',
  '%adherence%',
  '%ed visit%',
  '%emergency%',
  '%utilization%',
  '%care management%',
  '%quality%',
  '%screening%'
]);

UPDATE recommendations
SET is_measurable = false
WHERE title ILIKE ANY (ARRAY[
  '%clinic hours%',
  '%renegotiate%',
  '%contract%',
  '%negotiate%',
  '%staffing%',
  '%hire%',
  '%partner%',
  '%facility%'
]);

-- Add index for filtering by measurable status
CREATE INDEX IF NOT EXISTS idx_recommendations_is_measurable ON recommendations(is_measurable);

-- Add index for filtering by status (if not exists)
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
