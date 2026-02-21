-- Complete reset of contact_submissions RLS
-- This will completely remove and recreate all policies

-- Disable RLS temporarily
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies (including any duplicates)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_submissions')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON contact_submissions';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Recreate policies (exactly matching bookings pattern)
CREATE POLICY "contact_submissions_insert_anon"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "contact_submissions_select_anon"
  ON contact_submissions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "contact_submissions_select_authenticated"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "contact_submissions_update_authenticated"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "contact_submissions_delete_authenticated"
  ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (true);
