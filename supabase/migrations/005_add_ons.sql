-- =============================================================================
-- ADD_ONS TABLE
-- =============================================================================
-- Optional services available during parking
-- =============================================================================

CREATE TABLE add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  price INTEGER NOT NULL CHECK (price >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_add_ons_active ON add_ons(is_active);
CREATE INDEX idx_add_ons_order ON add_ons(display_order);

-- Triggers
CREATE TRIGGER update_add_ons_updated_at
  BEFORE UPDATE ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE add_ons IS 'Optional services available during parking';
COMMENT ON COLUMN add_ons.slug IS 'URL-friendly identifier (e.g., "ev-charging")';
COMMENT ON COLUMN add_ons.icon IS 'Lucide icon name for UI display';
COMMENT ON COLUMN add_ons.price IS 'Price in pence (e.g., 3500 = £35.00)';
