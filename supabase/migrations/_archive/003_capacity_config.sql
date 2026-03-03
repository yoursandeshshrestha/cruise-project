-- =============================================================================
-- Capacity Configuration Table
-- =============================================================================
-- Manages daily parking capacity with override capability
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
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

-- INDEXES
CREATE INDEX idx_capacity_date ON capacity_config(date);

-- TRIGGER
CREATE TRIGGER update_capacity_config_updated_at
  BEFORE UPDATE ON capacity_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY
ALTER TABLE capacity_config ENABLE ROW LEVEL SECURITY;

-- Authenticated users only (admins manage capacity)
CREATE POLICY "capacity_config_select_authenticated"
  ON capacity_config FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "capacity_config_insert_authenticated"
  ON capacity_config FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "capacity_config_update_authenticated"
  ON capacity_config FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "capacity_config_delete_authenticated"
  ON capacity_config FOR DELETE TO authenticated
  USING (true);

-- SEED DATA
-- Default capacity of 100 spaces per day for the next year
INSERT INTO capacity_config (date, max_capacity)
SELECT
  CURRENT_DATE + i,
  100
FROM generate_series(0, 365) AS i;

-- COMMENTS
COMMENT ON TABLE capacity_config IS 'Daily parking capacity configuration with override capability - RLS: authenticated only';
COMMENT ON COLUMN capacity_config.override_capacity IS 'Optional override for specific dates (e.g., special events)';
COMMENT ON COLUMN capacity_config.current_bookings IS 'Denormalized count of bookings for this date';
