-- =============================================================================
-- Add-ons Table
-- =============================================================================
-- Optional services (EV charging, car wash, valet) available during parking
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  price INTEGER NOT NULL CHECK (price >= 0), -- in pence
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_add_ons_active ON add_ons(is_active);
CREATE INDEX idx_add_ons_order ON add_ons(display_order);

-- TRIGGER
CREATE TRIGGER update_add_ons_updated_at
  BEFORE UPDATE ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

-- Public can view active add-ons, authenticated can manage
CREATE POLICY "add_ons_select_anon"
  ON add_ons FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "add_ons_select_authenticated"
  ON add_ons FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "add_ons_insert_authenticated"
  ON add_ons FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "add_ons_update_authenticated"
  ON add_ons FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "add_ons_delete_authenticated"
  ON add_ons FOR DELETE TO authenticated
  USING (true);

-- SEED DATA
-- Default add-on services
INSERT INTO add_ons (slug, name, description, icon, price, display_order) VALUES
  ('ev-charging', 'EV Charging', 'Full charge while you cruise', 'Zap', 3500, 1),
  ('exterior-wash', 'Exterior Wash', 'Professional exterior cleaning', 'Droplets', 1500, 2),
  ('full-valet', 'Full Valet', 'Complete interior and exterior valet', 'Sparkles', 4500, 3);

-- COMMENTS
COMMENT ON TABLE add_ons IS 'Optional services available during parking - RLS: anon (active only), authenticated (full)';
COMMENT ON COLUMN add_ons.slug IS 'URL-friendly identifier (e.g., "ev-charging")';
COMMENT ON COLUMN add_ons.icon IS 'Lucide icon name for UI display';
COMMENT ON COLUMN add_ons.price IS 'Price in pence (e.g., 3500 = £35.00)';
