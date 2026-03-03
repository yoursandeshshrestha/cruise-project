-- =============================================================================
-- PRICING_RULES TABLE
-- =============================================================================
-- Parking pricing rules with flat daily rate
-- Vans: Final price = standard total × van_multiplier (rounded to nearest pound)
-- =============================================================================

CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL DEFAULT 15.00,
  van_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.5,
  vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2)),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pricing_rules_dates ON pricing_rules(start_date, end_date);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX idx_pricing_rules_priority_dates ON pricing_rules(priority, start_date, end_date);

-- Triggers
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE pricing_rules IS 'Parking pricing rules with flat daily rate';
COMMENT ON COLUMN pricing_rules.price_per_day IS 'Flat daily rate for standard vehicles in pounds (e.g., 15.00 = £15/day)';
COMMENT ON COLUMN pricing_rules.van_multiplier IS 'Multiplier for van pricing (e.g., 1.5 means vans cost 1.5× car price, rounded to nearest £)';
COMMENT ON COLUMN pricing_rules.vat_rate IS 'VAT rate as decimal (e.g., 0.20 for 20%, 0.00 for 0%)';
COMMENT ON COLUMN pricing_rules.display_order IS 'Display order for admin UI (lower numbers first)';
COMMENT ON COLUMN pricing_rules.priority IS 'Priority level: 1 = custom pricing (overrides base), 2 = standard/base pricing';
COMMENT ON COLUMN pricing_rules.reason IS 'Optional explanation for custom pricing (e.g., "Peak season", "Special event")';
