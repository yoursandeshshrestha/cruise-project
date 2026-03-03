-- =============================================================================
-- CRUISE_LINES TABLE
-- =============================================================================
-- Cruise line companies with ships as JSONB array
-- =============================================================================

CREATE TABLE cruise_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  ships JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cruise_lines_active ON cruise_lines(is_active);
CREATE INDEX idx_cruise_lines_order ON cruise_lines(display_order);

-- Triggers
CREATE TRIGGER update_cruise_lines_updated_at
  BEFORE UPDATE ON cruise_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE cruise_lines IS 'Cruise line companies with ships as JSONB array';
COMMENT ON COLUMN cruise_lines.ships IS 'JSONB array of ship names (e.g., ["Ship 1", "Ship 2"])';
