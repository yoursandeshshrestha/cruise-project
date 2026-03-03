-- =============================================================================
-- PROMO_CODES TABLE
-- =============================================================================
-- Promotional discount codes with validation
-- =============================================================================

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  minimum_spend INTEGER CHECK (minimum_spend IS NULL OR minimum_spend > 0),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  current_uses INTEGER DEFAULT 0 CHECK (current_uses >= 0),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (valid_until > valid_from)
);

-- Indexes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_valid_dates ON promo_codes(valid_from, valid_until);

-- Triggers
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE promo_codes IS 'Promotional discount codes with validation';
COMMENT ON COLUMN promo_codes.discount_type IS 'Either "percentage" (1-100) or "fixed" (amount in pence)';
COMMENT ON COLUMN promo_codes.discount_value IS 'Either percentage (10 = 10%) or pence (1000 = £10)';
