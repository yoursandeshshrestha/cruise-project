-- Update booking expiration time from 2 hours to 15 minutes
-- This reduces parking capacity blocking time for unpaid bookings

CREATE OR REPLACE FUNCTION cancel_expired_pending_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cancelled_count INTEGER;
BEGIN
  -- Cancel bookings that are:
  -- 1. Still in pending status
  -- 2. Still have pending payment status
  -- 3. Created more than 15 minutes ago
  UPDATE bookings
  SET
    status = 'cancelled',
    payment_status = 'cancelled',
    cancellation_reason = 'Automatically cancelled - payment not completed within time limit',
    cancelled_at = now()
  WHERE
    status = 'pending'
    AND payment_status = 'pending'
    AND created_at < (now() - INTERVAL '15 minutes')
    AND cancelled_at IS NULL;

  GET DIAGNOSTICS cancelled_count = ROW_COUNT;

  RETURN cancelled_count;
END;
$$;

COMMENT ON FUNCTION cancel_expired_pending_bookings() IS 'Cancels pending bookings older than 15 minutes to release capacity quickly';
