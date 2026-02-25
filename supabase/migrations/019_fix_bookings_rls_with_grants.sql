-- COMPREHENSIVE FIX: Bookings RLS with Table-Level Grants
-- This ensures both RLS policies AND table-level permissions are correct

-- Step 1: Disable RLS temporarily for cleanup
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies comprehensively
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'bookings'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', r.policyname);
    END LOOP;
END
$$;

-- Step 3: Ensure table-level permissions are granted to anon and authenticated roles
-- This is CRITICAL - RLS policies won't work without table-level grants
GRANT SELECT, INSERT ON bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookings TO authenticated;

-- Step 4: Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple, working policies for anonymous users

-- Policy 1: Allow anonymous users to INSERT bookings
CREATE POLICY "bookings_anon_insert"
    ON bookings
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy 2: Allow anonymous users to SELECT bookings
-- NOTE: Supabase client automatically SELECTs after INSERT to return the new row
-- This is why BOTH INSERT and SELECT policies are required
CREATE POLICY "bookings_anon_select"
    ON bookings
    FOR SELECT
    TO anon
    USING (true);

-- Step 6: Create policies for authenticated users (admin)

-- Policy 3: Allow authenticated users to SELECT all bookings
CREATE POLICY "bookings_auth_select"
    ON bookings
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 4: Allow authenticated users to UPDATE bookings
CREATE POLICY "bookings_auth_update"
    ON bookings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 5: Allow authenticated users to DELETE bookings
CREATE POLICY "bookings_auth_delete"
    ON bookings
    FOR DELETE
    TO authenticated
    USING (true);

-- Step 7: Verify RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 8: Add documentation comment
COMMENT ON TABLE bookings IS 'Bookings table with RLS enabled and table-level grants. Anonymous users: INSERT + SELECT. Authenticated users: Full CRUD.';

-- Verification queries (informational, won't affect execution)
-- To verify this worked, run these queries separately:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'bookings';
-- SELECT * FROM pg_policies WHERE tablename = 'bookings' ORDER BY policyname;
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'bookings';
