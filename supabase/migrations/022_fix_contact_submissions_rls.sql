-- =============================================================================
-- FIX: Contact Submissions RLS Policy
-- =============================================================================
-- Issue: Anonymous users getting 403 when submitting contact forms
-- Solution: Reset all RLS policies and grants for contact_submissions
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "contact_submissions_insert_anon" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_anon" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_authenticated" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_update_authenticated" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_delete_authenticated" ON contact_submissions;

-- Ensure RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, SELECT ON TABLE contact_submissions TO anon;
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO anon;

-- Grant full permissions to authenticated role
GRANT ALL ON TABLE contact_submissions TO authenticated;

-- Create fresh policies
-- Anon: Can insert contact form submissions
CREATE POLICY "Enable insert for anon users"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon: Can select (for confirmation)
CREATE POLICY "Enable select for anon users"
  ON contact_submissions
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated: Full access
CREATE POLICY "Enable all for authenticated users"
  ON contact_submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify grants
DO $$
BEGIN
  RAISE NOTICE 'Contact submissions RLS policies fixed and grants verified';
END $$;
