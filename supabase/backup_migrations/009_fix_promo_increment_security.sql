-- Fix Promo Code Increment Function
-- Add SECURITY DEFINER so the function can update promo_codes when called by anonymous users

-- Recreate the increment function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code VARCHAR(50))
RETURNS VOID
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE code = p_code AND is_active = true;
END;
$$ LANGUAGE plpgsql;
