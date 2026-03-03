-- =============================================================================
-- CAPACITY_CONFIG TABLE
-- =============================================================================
-- Daily parking capacity configuration with override capability
-- =============================================================================

CREATE TABLE capacity_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
  current_bookings INTEGER DEFAULT 0 CHECK (current_bookings >= 0),
  override_capacity INTEGER CHECK (override_capacity IS NULL OR override_capacity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_capacity_date ON capacity_config(date);

-- Triggers
CREATE TRIGGER update_capacity_config_updated_at
  BEFORE UPDATE ON capacity_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE capacity_config IS 'Daily parking capacity configuration with override capability';
COMMENT ON COLUMN capacity_config.override_capacity IS 'Optional override for specific dates (e.g., special events)';
COMMENT ON COLUMN capacity_config.current_bookings IS 'Denormalized count of bookings for this date';
