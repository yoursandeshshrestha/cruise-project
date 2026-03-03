-- Function to automatically cancel old pending bookings
-- This releases capacity that was held by abandoned checkout sessions
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
  -- 3. Created more than 2 hours ago (Stripe checkout expires after 24 hours, but we're more aggressive)
  UPDATE bookings
  SET
    status = 'cancelled',
    payment_status = 'cancelled',
    cancellation_reason = 'Automatically cancelled - payment not completed within time limit',
    cancelled_at = now()
  WHERE
    status = 'pending'
    AND payment_status = 'pending'
    AND created_at < (now() - INTERVAL '2 hours')
    AND cancelled_at IS NULL;

  GET DIAGNOSTICS cancelled_count = ROW_COUNT;

  RETURN cancelled_count;
END;
$$;

COMMENT ON FUNCTION cancel_expired_pending_bookings() IS 'Cancels pending bookings older than 2 hours to release capacity';

-- Create a scheduled job to run this every hour (if pg_cron is available)
-- Note: This requires pg_cron extension which may not be available in all Supabase projects
-- If pg_cron is not available, you can call this function manually or via a cron job/scheduled task

-- Try to create the scheduled job (will fail silently if pg_cron is not available)
DO $$
BEGIN
  -- Check if pg_cron extension exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove existing job if it exists
    PERFORM cron.unschedule('cancel-expired-bookings');

    -- Schedule the job to run every hour
    PERFORM cron.schedule(
      'cancel-expired-bookings',
      '0 * * * *', -- Every hour at minute 0
      'SELECT cancel_expired_pending_bookings();'
    );

    RAISE NOTICE 'Scheduled job created successfully';
  ELSE
    RAISE NOTICE 'pg_cron extension not available - you will need to call cancel_expired_pending_bookings() manually or use an external cron job';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create scheduled job: %', SQLERRM;
END $$;
