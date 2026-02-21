-- Add missing INSERT policy for authenticated users
-- The authenticated role had table-level GRANT ALL but no RLS INSERT policy

CREATE POLICY "auth_can_insert_bookings"
    ON bookings
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Add comment
COMMENT ON POLICY "auth_can_insert_bookings" ON bookings IS 'Allows authenticated admin users to create bookings';
