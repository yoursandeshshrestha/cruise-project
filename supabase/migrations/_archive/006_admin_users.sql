-- =============================================================================
-- Admin Users Table
-- =============================================================================
-- Admin user accounts synced with Supabase Auth
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role admin_role DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- TRIGGER
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- FUNCTION: Delete current user account
CREATE OR REPLACE FUNCTION delete_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  current_user_email text;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();

  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user email for logging
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;

  -- Delete from admin_users table
  DELETE FROM admin_users
  WHERE id = current_user_id;

  -- Delete from auth.users table
  DELETE FROM auth.users
  WHERE id = current_user_id;

  -- Log the deletion
  RAISE NOTICE 'Deleted user account: %', current_user_email;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_current_user() TO authenticated;

-- ROW LEVEL SECURITY
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Authenticated users only (admin management)
CREATE POLICY "admin_users_select_authenticated"
  ON admin_users FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_users_insert_authenticated"
  ON admin_users FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_users_update_authenticated"
  ON admin_users FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_users_delete_authenticated"
  ON admin_users FOR DELETE TO authenticated
  USING (true);

-- SEED DATA
-- Default admin user
INSERT INTO admin_users (email, role, is_active)
VALUES ('admin@simplecruiseparking.com', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- COMMENTS
COMMENT ON TABLE admin_users IS 'Admin user accounts synced with Supabase Auth - RLS: authenticated only';
COMMENT ON COLUMN admin_users.role IS 'Permission level: admin (full access), manager (most features), staff (limited)';
COMMENT ON FUNCTION delete_current_user() IS 'Allows authenticated users to delete their own account from both admin_users and auth.users';
