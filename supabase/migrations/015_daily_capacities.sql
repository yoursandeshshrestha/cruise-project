-- =============================================================================
-- DAILY_CAPACITIES TABLE
-- =============================================================================
-- Day-specific capacity overrides
-- =============================================================================

CREATE TABLE daily_capacities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_capacities_date ON daily_capacities(date);

-- Comments
COMMENT ON TABLE daily_capacities IS 'Day-specific capacity overrides';
