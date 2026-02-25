-- Complete reset of bookings RLS policies
-- Drop ALL existing policies to start fresh

-- Disable RLS temporarily
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (comprehensive list)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bookings') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', r.policyname);
    END LOOP;
END
$$;

-- Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create fresh policies with clear names

-- Policy 1: Allow anonymous users to INSERT bookings (public booking form)
CREATE POLICY "allow_anon_insert_bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Allow anonymous users to SELECT bookings (for lookup)
CREATE POLICY "allow_anon_select_bookings"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

-- Policy 3: Allow authenticated users to SELECT all bookings
CREATE POLICY "allow_auth_select_bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Allow authenticated users to UPDATE bookings
CREATE POLICY "allow_auth_update_bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Allow authenticated users to DELETE bookings
CREATE POLICY "allow_auth_delete_bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- Add table comment
COMMENT ON TABLE bookings IS 'Bookings table with RLS - anonymous users can create and read, authenticated users have full CRUD';
