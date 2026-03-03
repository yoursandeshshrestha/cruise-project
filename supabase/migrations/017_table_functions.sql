-- =============================================================================
-- TABLE-DEPENDENT FUNCTIONS
-- =============================================================================
-- Functions that reference tables (created after tables exist)
-- =============================================================================

-- Generate unique booking reference (SCP-XXXX format)
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  new_reference TEXT;
  reference_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate reference like SCP-1234
    new_reference := 'SCP-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Check if reference already exists
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_reference = new_reference) INTO reference_exists;

    EXIT WHEN NOT reference_exists;
  END LOOP;

  RETURN new_reference;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_booking_reference() IS 'Generates unique booking reference in SCP-XXXX format';

-- Delete current user account
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

COMMENT ON FUNCTION delete_current_user() IS 'Allows authenticated users to delete their own account from both admin_users and auth.users';

-- Validate promo code and calculate discount
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code VARCHAR(50),
  p_booking_amount INTEGER
)
RETURNS TABLE(
  is_valid BOOLEAN,
  discount_amount INTEGER,
  message TEXT
) AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_discount INTEGER;
BEGIN
  -- Find the promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = p_code
    AND is_active = true;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Invalid promo code';
    RETURN;
  END IF;

  -- Check validity dates
  IF v_promo.valid_from IS NOT NULL AND NOW() < v_promo.valid_from THEN
    RETURN QUERY SELECT false, 0, 'Promo code not yet valid';
    RETURN;
  END IF;

  IF v_promo.valid_until IS NOT NULL AND NOW() > v_promo.valid_until THEN
    RETURN QUERY SELECT false, 0, 'Promo code has expired';
    RETURN;
  END IF;

  -- Check usage limit
  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, 0, 'Promo code usage limit reached';
    RETURN;
  END IF;

  -- Check minimum spend
  IF v_promo.minimum_spend IS NOT NULL AND p_booking_amount < v_promo.minimum_spend THEN
    RETURN QUERY SELECT
      false,
      0,
      'Minimum spend of £' || (v_promo.minimum_spend::DECIMAL / 100)::TEXT || ' required';
    RETURN;
  END IF;

  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_discount := (p_booking_amount * v_promo.discount_value / 100);
  ELSE
    v_discount := v_promo.discount_value;
  END IF;

  -- Ensure discount doesn't exceed booking amount
  IF v_discount > p_booking_amount THEN
    v_discount := p_booking_amount;
  END IF;

  -- Return success
  RETURN QUERY SELECT true, v_discount, 'Promo code applied successfully';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_promo_code(VARCHAR(50), INTEGER) IS 'Validates promo code and calculates discount amount';

-- Increment promo code usage (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code VARCHAR(50))
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE code = p_code AND is_active = true;
END;
$$;

COMMENT ON FUNCTION increment_promo_code_usage(VARCHAR(50)) IS 'Increments usage counter (SECURITY DEFINER to bypass RLS)';

-- Get setting value by group and key
CREATE OR REPLACE FUNCTION get_setting(p_group VARCHAR, p_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT settings ->> p_key INTO result
  FROM system_settings
  WHERE group_name = p_group;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_setting(VARCHAR, VARCHAR) IS 'Helper to retrieve setting value: get_setting(''business'', ''company_name'')';

-- Function to automatically cancel old pending bookings
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
  -- 3. Created more than 2 hours ago
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

-- Try to create scheduled job for booking cleanup
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('cancel-expired-bookings');
    PERFORM cron.schedule(
      'cancel-expired-bookings',
      '0 * * * *',
      'SELECT cancel_expired_pending_bookings();'
    );
    RAISE NOTICE 'Scheduled job created successfully';
  ELSE
    RAISE NOTICE 'pg_cron extension not available - call cancel_expired_pending_bookings() manually';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create scheduled job: %', SQLERRM;
END $$;
