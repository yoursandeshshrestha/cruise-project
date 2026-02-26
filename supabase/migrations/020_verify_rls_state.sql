-- Verification script to check actual RLS state
-- This will show us what's really configured

-- Show current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'bookings' AND schemaname = 'public'
ORDER BY policyname;

-- Show table-level grants
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'bookings'
ORDER BY grantee, privilege_type;

-- Check if RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'bookings' AND schemaname = 'public';
