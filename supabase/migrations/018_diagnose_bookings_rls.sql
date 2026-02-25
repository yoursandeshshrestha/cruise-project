-- Diagnostic script to check current RLS state for bookings table
-- Run this to understand what's actually configured

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'bookings' AND schemaname = 'public';

-- 2. List all current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'bookings' AND schemaname = 'public'
ORDER BY policyname;

-- 3. Check table-level privileges for anon role
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND table_name = 'bookings'
    AND grantee IN ('anon', 'authenticated', 'postgres');

-- 4. Check column-level privileges
SELECT
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'bookings';
