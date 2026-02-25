-- COMPREHENSIVE RLS FIX - Nuclear Option
-- This completely resets permissions and policies from scratch

-- Step 1: Temporarily disable RLS
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Step 2: Revoke all existing permissions
REVOKE ALL ON bookings FROM PUBLIC;
REVOKE ALL ON bookings FROM anon;
REVOKE ALL ON bookings FROM authenticated;

-- Step 3: Drop all existing policies
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

-- Step 4: Grant explicit table-level permissions
-- For anon role (public users creating bookings)
GRANT SELECT, INSERT ON TABLE bookings TO anon;

-- For authenticated role (admin users)
GRANT ALL ON TABLE bookings TO authenticated;

-- Note: No sequence grants needed as bookings.id is UUID with gen_random_uuid()

-- Step 5: Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies with PERMISSIVE mode (default, but explicit)

-- Anonymous users: INSERT policy
CREATE POLICY "anon_can_insert_bookings"
    ON bookings
    AS PERMISSIVE
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Anonymous users: SELECT policy
CREATE POLICY "anon_can_select_bookings"
    ON bookings
    AS PERMISSIVE
    FOR SELECT
    TO anon
    USING (true);

-- Authenticated users: SELECT policy
CREATE POLICY "auth_can_select_bookings"
    ON bookings
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users: UPDATE policy
CREATE POLICY "auth_can_update_bookings"
    ON bookings
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users: DELETE policy
CREATE POLICY "auth_can_delete_bookings"
    ON bookings
    AS PERMISSIVE
    FOR DELETE
    TO authenticated
    USING (true);

-- Step 7: Add comment for documentation
COMMENT ON TABLE bookings IS 'Bookings with RLS - anon: INSERT+SELECT, authenticated: full CRUD';

-- Step 8: Force a schema cache refresh (PostgreSQL)
NOTIFY pgrst, 'reload schema';
