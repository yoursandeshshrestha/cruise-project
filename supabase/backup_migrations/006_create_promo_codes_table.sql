-- Create Promo Codes Table
-- Dedicated table for managing promotional discount codes

-- Drop existing table if it exists
DROP TABLE IF EXISTS promo_codes CASCADE;

-- Create promo_codes table
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
  minimum_spend DECIMAL(10,2) DEFAULT 0 CHECK (minimum_spend >= 0),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  current_uses INTEGER DEFAULT 0 CHECK (current_uses >= 0),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from),
  CONSTRAINT valid_discount_percentage CHECK (discount_type != 'percentage' OR discount_value <= 100)
);

-- Create indexes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_valid_dates ON promo_codes(valid_from, valid_until);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_promo_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promo_codes_timestamp
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_codes_updated_at();

-- Row Level Security (RLS)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Public can read active promo codes (to validate codes during booking)
CREATE POLICY "Public can read active promo codes"
  ON promo_codes
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage promo codes
CREATE POLICY "Authenticated users can insert promo codes"
  ON promo_codes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update promo codes"
  ON promo_codes
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete promo codes"
  ON promo_codes
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code VARCHAR(50),
  p_booking_amount DECIMAL(10,2)
)
RETURNS TABLE(
  is_valid BOOLEAN,
  discount_amount DECIMAL(10,2),
  message TEXT
) AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_discount DECIMAL(10,2);
BEGIN
  -- Find the promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = p_code
    AND is_active = true;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Invalid promo code';
    RETURN;
  END IF;

  -- Check validity dates
  IF v_promo.valid_from IS NOT NULL AND NOW() < v_promo.valid_from THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Promo code not yet valid';
    RETURN;
  END IF;

  IF v_promo.valid_until IS NOT NULL AND NOW() > v_promo.valid_until THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Promo code has expired';
    RETURN;
  END IF;

  -- Check usage limit
  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Promo code usage limit reached';
    RETURN;
  END IF;

  -- Check minimum spend
  IF p_booking_amount < v_promo.minimum_spend THEN
    RETURN QUERY SELECT
      false,
      0::DECIMAL(10,2),
      'Minimum spend of £' || v_promo.minimum_spend || ' required';
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

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code VARCHAR(50))
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE code = p_code AND is_active = true;
END;
$$ LANGUAGE plpgsql;
