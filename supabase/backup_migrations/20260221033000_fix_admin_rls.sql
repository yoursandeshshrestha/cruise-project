-- Migration: Fix Admin Users RLS Policies
-- Description: Allow authenticated users to read admin_users if their email matches

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;

-- Create new policies that check if the authenticated user's email exists in admin_users
CREATE POLICY "Authenticated users can view their own admin record"
  ON admin_users FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Authenticated users can update their own last_login"
  ON admin_users FOR UPDATE
  USING (auth.email() = email)
  WITH CHECK (auth.email() = email);

-- Only allow admins (checked via email in admin_users) to insert/delete
CREATE POLICY "Admins can manage all admin users"
  ON admin_users FOR ALL
  USING (
    auth.email() IN (
      SELECT email FROM admin_users WHERE role = 'admin' AND is_active = true
    )
  );
