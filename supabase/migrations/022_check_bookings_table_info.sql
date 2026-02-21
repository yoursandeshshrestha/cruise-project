-- Check detailed information about the bookings table

-- 1. Show all columns with their types and defaults
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'bookings'
ORDER BY ordinal_position;

-- 2. Check for any triggers on bookings table
SELECT
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table = 'bookings';

-- 3. Check constraints
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
    AND table_name = 'bookings';
