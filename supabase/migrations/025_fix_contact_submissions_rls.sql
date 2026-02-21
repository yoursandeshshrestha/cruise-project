-- Fix Contact Submissions RLS Policies
-- Drop existing policies and recreate them to match bookings pattern

-- Drop old policies if they exist
DROP POLICY IF EXISTS "anon_can_insert_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "auth_can_select_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "auth_can_update_contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_insert_anon" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_anon" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_authenticated" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_update_authenticated" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_delete_authenticated" ON contact_submissions;

-- Revoke any explicit grants
REVOKE ALL ON contact_submissions FROM anon;
REVOKE ALL ON contact_submissions FROM authenticated;

-- Grant table-level permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON contact_submissions TO anon;
GRANT ALL ON contact_submissions TO authenticated;

-- Recreate policies matching bookings table pattern
-- Policy 1: Anonymous users can insert (submit contact form)
CREATE POLICY "contact_submissions_insert_anon"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Anonymous users can view submissions (for confirmation)
CREATE POLICY "contact_submissions_select_anon"
  ON contact_submissions
  FOR SELECT
  TO anon
  USING (true);

-- Policy 3: Authenticated users can view all submissions
CREATE POLICY "contact_submissions_select_authenticated"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Authenticated users can update submissions
CREATE POLICY "contact_submissions_update_authenticated"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Authenticated users can delete submissions
CREATE POLICY "contact_submissions_delete_authenticated"
  ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (true);
