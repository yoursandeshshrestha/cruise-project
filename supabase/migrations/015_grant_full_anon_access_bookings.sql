-- Temporarily grant FULL access to anonymous users on bookings table
-- This is for debugging - we'll narrow it down once we confirm it works

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bookings') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', r.policyname);
    END LOOP;
END
$$;

-- Create a single permissive policy for ALL operations for anon users
CREATE POLICY "anon_full_access_bookings"
  ON bookings
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Also keep auth users access
CREATE POLICY "auth_full_access_bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE bookings IS 'Bookings table - temporary full access for debugging RLS issue';
