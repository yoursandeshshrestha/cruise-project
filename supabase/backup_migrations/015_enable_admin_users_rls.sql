-- Enable proper RLS on admin_users table
-- Follow the same pattern as cruise_lines and promo_codes

-- Drop any existing policies
DROP POLICY IF EXISTS "Authenticated users can view their own admin record" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can update their own last_login" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to view all admin users
-- (Needed to check if a user is an admin during login/authorization)
CREATE POLICY "admin_users_select_authenticated"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow authenticated users to insert admin users
CREATE POLICY "admin_users_insert_authenticated"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Allow authenticated users to update admin users
CREATE POLICY "admin_users_update_authenticated"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete admin users
CREATE POLICY "admin_users_delete_authenticated"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (true);

-- Update table comment
COMMENT ON TABLE admin_users IS 'Admin users table - RLS enabled with authenticated role policies';
