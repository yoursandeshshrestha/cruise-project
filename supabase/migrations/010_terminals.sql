-- =============================================================================
-- TERMINALS TABLE
-- =============================================================================
-- Southampton cruise terminals
-- =============================================================================

CREATE TABLE terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE,
  address TEXT,
  postcode VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_terminals_active ON terminals(is_active);
CREATE INDEX idx_terminals_order ON terminals(display_order);

-- Triggers
CREATE TRIGGER update_terminals_updated_at
  BEFORE UPDATE ON terminals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE terminals IS 'Southampton cruise terminals';
COMMENT ON COLUMN terminals.code IS 'Short code for terminal (e.g., OCN, MF)';
COMMENT ON COLUMN terminals.description IS 'Detailed description shown to customers during booking';
