-- Terminals Table
-- Dedicated table for managing cruise terminals
-- Consolidated from: 005_create_terminals_table.sql + 20260220214731 (terminals portion)

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

-- Create indexes
CREATE INDEX idx_terminals_active ON terminals(is_active);
CREATE INDEX idx_terminals_order ON terminals(display_order);

-- Auto-update timestamp
CREATE TRIGGER update_terminals_updated_at
  BEFORE UPDATE ON terminals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read active terminals
CREATE POLICY "terminals_select_anon"
  ON terminals
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy 2: Authenticated users can view all terminals
CREATE POLICY "terminals_select_authenticated"
  ON terminals
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Authenticated users can insert terminals
CREATE POLICY "terminals_insert_authenticated"
  ON terminals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 4: Authenticated users can update terminals
CREATE POLICY "terminals_update_authenticated"
  ON terminals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Authenticated users can delete terminals
CREATE POLICY "terminals_delete_authenticated"
  ON terminals
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Seed default terminals
INSERT INTO terminals (name, code, location, description, is_active, display_order) VALUES
  ('Ocean Terminal', 'OCN', 'Southampton', 'Modern cruise terminal with excellent facilities and easy access to the city center. Ideal for large cruise ships.', true, 1),
  ('Mayflower Terminal', 'MF', 'Southampton', 'Historic terminal named after the famous Mayflower ship. Features convenient parking and passenger amenities.', true, 2),
  ('City Cruise Terminal', 'CC', 'Southampton', 'Located in the heart of Southampton, offering quick access to local attractions and transport links.', true, 3),
  ('QEII Terminal', 'QEII', 'Southampton', 'Named after the Queen Elizabeth II. Premium terminal with luxury facilities for international cruise departures.', true, 4),
  ('Horizon Cruise Terminal', 'HOR', 'Southampton', 'State-of-the-art terminal designed for modern cruise operations with comprehensive passenger services.', true, 5);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE terminals IS 'Southampton cruise terminals - RLS enabled with anon (active only) and authenticated policies';
