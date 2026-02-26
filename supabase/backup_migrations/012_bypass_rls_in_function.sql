-- Recreate increment function to properly bypass RLS
-- The function must disable row security within its execution

DROP FUNCTION IF EXISTS increment_promo_code_usage(VARCHAR(50));

CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code VARCHAR(50))
RETURNS VOID
SECURITY DEFINER -- Run with privileges of function owner
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Temporarily disable RLS for this function execution
  SET LOCAL row_security = off;

  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE code = p_code AND is_active = true;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION increment_promo_code_usage(VARCHAR(50)) TO anon;
GRANT EXECUTE ON FUNCTION increment_promo_code_usage(VARCHAR(50)) TO authenticated;

-- Also ensure validate_promo_code function has proper grants
GRANT EXECUTE ON FUNCTION validate_promo_code(VARCHAR(50), DECIMAL(10,2)) TO anon;
GRANT EXECUTE ON FUNCTION validate_promo_code(VARCHAR(50), DECIMAL(10,2)) TO authenticated;
