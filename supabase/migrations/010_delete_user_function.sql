-- Migration: Add function to delete current user account
-- This function allows authenticated users to delete their own account
-- It deletes both the admin_users record and the auth user

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
  -- This requires the function to be SECURITY DEFINER
  DELETE FROM auth.users
  WHERE id = current_user_id;

  -- Log the deletion (optional)
  RAISE NOTICE 'Deleted user account: %', current_user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_current_user() TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_current_user() IS 'Allows authenticated users to delete their own account from both admin_users and auth.users tables';
