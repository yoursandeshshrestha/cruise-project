-- =====================================================
-- URGENT FIX: Contact Form RLS - Run this in SQL Editor
-- =====================================================

-- 1. Disable RLS temporarily to clear everything
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies
DROP POLICY IF EXISTS "contact_submissions_insert_anon" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_anon" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_select_authenticated" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_update_authenticated" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_delete_authenticated" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for anon users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable select for anon users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON contact_submissions;

-- 3. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE contact_submissions TO anon;
GRANT SELECT ON TABLE contact_submissions TO anon;

-- 4. Re-enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Create simple, working policy for anon inserts
CREATE POLICY "anon_can_insert_contact"
ON contact_submissions
FOR INSERT
TO anon
WITH CHECK (true);

-- 6. Create policy for anon selects (optional, for confirmation)
CREATE POLICY "anon_can_select_contact"
ON contact_submissions
FOR SELECT
TO anon
USING (true);

-- 7. Admin policies
CREATE POLICY "authenticated_full_access"
ON contact_submissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'contact_submissions';
