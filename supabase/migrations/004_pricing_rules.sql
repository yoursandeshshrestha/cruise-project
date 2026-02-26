-- =============================================================================
-- Pricing Rules Table
-- =============================================================================
-- Parking pricing rules including seasonal and date-based pricing
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price_per_day INTEGER NOT NULL CHECK (price_per_day > 0), -- in pence
  minimum_charge INTEGER NOT NULL CHECK (minimum_charge > 0), -- in pence
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_pricing_rules_dates ON pricing_rules(start_date, end_date);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);

-- TRIGGER
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

-- Public can view active pricing, authenticated can manage
CREATE POLICY "pricing_rules_select_anon"
  ON pricing_rules FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "pricing_rules_select_authenticated"
  ON pricing_rules FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "pricing_rules_insert_authenticated"
  ON pricing_rules FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "pricing_rules_update_authenticated"
  ON pricing_rules FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "pricing_rules_delete_authenticated"
  ON pricing_rules FOR DELETE TO authenticated
  USING (true);

-- SEED DATA
-- Default pricing: £12.50/day with £45 minimum and 20% VAT
INSERT INTO pricing_rules (name, price_per_day, minimum_charge, vat_rate, is_active, display_order)
VALUES (
  'Standard Pricing',
  1250, -- £12.50 in pence
  4500, -- £45 in pence
  0.20, -- 20% VAT
  true,
  0
);

-- COMMENTS
COMMENT ON TABLE pricing_rules IS 'Parking pricing rules with seasonal support - RLS: anon (active only), authenticated (full)';
COMMENT ON COLUMN pricing_rules.price_per_day IS 'Price per day in pence (e.g., 1250 = £12.50)';
COMMENT ON COLUMN pricing_rules.minimum_charge IS 'Minimum charge in pence regardless of duration';
COMMENT ON COLUMN pricing_rules.vat_rate IS 'VAT rate as decimal (e.g., 0.20 for 20%, 0.15 for 15%)';
COMMENT ON COLUMN pricing_rules.display_order IS 'Display order for admin UI (lower numbers first)';
