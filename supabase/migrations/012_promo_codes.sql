-- =============================================================================
-- Promo Codes Table
-- =============================================================================
-- Promotional discount codes with validation and usage tracking
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value INTEGER NOT NULL CHECK (discount_value > 0), -- percentage (1-100) or pence
  minimum_spend INTEGER CHECK (minimum_spend IS NULL OR minimum_spend > 0), -- in pence
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  current_uses INTEGER DEFAULT 0 CHECK (current_uses >= 0),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (valid_until > valid_from)
);

-- INDEXES
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_valid_dates ON promo_codes(valid_from, valid_until);

-- TRIGGER
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- PROMO CODE FUNCTIONS
-- =============================================================================

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_promo_code(VARCHAR(50), INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION validate_promo_code(VARCHAR(50), INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_promo_code_usage(VARCHAR(50)) TO anon;
GRANT EXECUTE ON FUNCTION increment_promo_code_usage(VARCHAR(50)) TO authenticated;

-- ROW LEVEL SECURITY
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Public can view active promo codes (for validation), authenticated can manage
CREATE POLICY "promo_codes_select_anon"
  ON promo_codes FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "promo_codes_select_authenticated"
  ON promo_codes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "promo_codes_insert_authenticated"
  ON promo_codes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "promo_codes_update_authenticated"
  ON promo_codes FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "promo_codes_delete_authenticated"
  ON promo_codes FOR DELETE TO authenticated
  USING (true);

-- SEED DATA
-- Sample promo code for first-time customers
INSERT INTO promo_codes (code, description, discount_type, discount_value, valid_from, valid_until, is_active)
VALUES (
  'FIRST10',
  'First booking 10% discount',
  'percentage',
  10,
  NOW(),
  NOW() + INTERVAL '1 year',
  true
);

-- COMMENTS
COMMENT ON TABLE promo_codes IS 'Promotional discount codes with validation - RLS: anon (active only), authenticated (full)';
COMMENT ON COLUMN promo_codes.discount_type IS 'Either "percentage" (1-100) or "fixed" (amount in pence)';
COMMENT ON COLUMN promo_codes.discount_value IS 'Either percentage (10 = 10%) or pence (1000 = £10)';
COMMENT ON FUNCTION validate_promo_code(VARCHAR(50), INTEGER) IS 'Validates promo code and calculates discount amount';
COMMENT ON FUNCTION increment_promo_code_usage(VARCHAR(50)) IS 'Increments usage counter (SECURITY DEFINER to bypass RLS)';
