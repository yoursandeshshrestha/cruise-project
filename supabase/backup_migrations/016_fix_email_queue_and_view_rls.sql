-- Fix RLS for email_queue table and cruise_lines_with_ship_counts view
-- Follow the same pattern as other tables (TO authenticated with USING/WITH CHECK true)

-- =============================================================================
-- 1. FIX EMAIL_QUEUE TABLE RLS
-- =============================================================================

-- Enable RLS on email_queue table (currently disabled)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "email_queue_select_authenticated" ON email_queue;
DROP POLICY IF EXISTS "email_queue_insert_authenticated" ON email_queue;
DROP POLICY IF EXISTS "email_queue_update_authenticated" ON email_queue;
DROP POLICY IF EXISTS "email_queue_delete_authenticated" ON email_queue;

-- Policy 1: Allow authenticated users to view email queue
CREATE POLICY "email_queue_select_authenticated"
  ON email_queue
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow authenticated users to insert emails (system operations)
CREATE POLICY "email_queue_insert_authenticated"
  ON email_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Allow authenticated users to update email queue (mark as sent/failed)
CREATE POLICY "email_queue_update_authenticated"
  ON email_queue
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete from email queue
CREATE POLICY "email_queue_delete_authenticated"
  ON email_queue
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- 2. FIX CRUISE_LINES_WITH_SHIP_COUNTS VIEW PERMISSIONS
-- =============================================================================

-- Views don't have RLS policies themselves, but we need to grant proper access
-- Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON cruise_lines_with_ship_counts TO authenticated;
GRANT SELECT ON cruise_lines_with_ship_counts TO anon;

-- Add comments
COMMENT ON TABLE email_queue IS 'Email queue table - RLS enabled with authenticated role policies';
COMMENT ON VIEW cruise_lines_with_ship_counts IS 'View for cruise lines with ship counts - inherits RLS from cruise_lines table';
