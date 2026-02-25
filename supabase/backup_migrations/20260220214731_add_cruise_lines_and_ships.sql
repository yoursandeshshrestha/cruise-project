-- Add Cruise Lines and Ships Configuration Tables
-- This allows admins to manage cruise lines, ships, and terminals from the admin panel

-- =============================================================================
-- CRUISE LINES TABLE
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

CREATE INDEX idx_cruise_lines_active ON cruise_lines(is_active);
CREATE INDEX idx_cruise_lines_order ON cruise_lines(display_order);

-- =============================================================================
-- TERMINALS TABLE
-- =============================================================================

CREATE TABLE terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE,
  address TEXT,
  postcode VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_terminals_active ON terminals(is_active);
CREATE INDEX idx_terminals_order ON terminals(display_order);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_cruise_lines_updated_at
  BEFORE UPDATE ON cruise_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER update_terminals_updated_at
  BEFORE UPDATE ON terminals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE cruise_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active cruise lines"
  ON cruise_lines FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active terminals"
  ON terminals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage cruise lines"
  ON cruise_lines
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage terminals"
  ON terminals
  USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- SEED DATA
-- =============================================================================

INSERT INTO cruise_lines (name, ships, is_active, display_order) VALUES
  ('P&O Cruises', '["Iona", "Arvia", "Britannia", "Ventura", "Arcadia", "Aurora"]'::jsonb, true, 1),
  ('Cunard', '["Queen Mary 2", "Queen Victoria", "Queen Anne"]'::jsonb, true, 2),
  ('Royal Caribbean', '["Anthem of the Seas", "Independence of the Seas"]'::jsonb, true, 3),
  ('MSC Cruises', '["MSC Virtuosa", "MSC Preziosa"]'::jsonb, true, 4),
  ('Princess Cruises', '["Sky Princess", "Regal Princess"]'::jsonb, true, 5),
  ('Celebrity Cruises', '["Celebrity Apex", "Celebrity Silhouette"]'::jsonb, true, 6);

INSERT INTO terminals (name, code, is_active, display_order) VALUES
  ('Ocean Terminal', 'OCN', true, 1),
  ('Mayflower Terminal', 'MF', true, 2),
  ('City Cruise Terminal', 'CC', true, 3),
  ('QEII Terminal', 'QEII', true, 4),
  ('Horizon Cruise Terminal', 'HOR', true, 5);

-- =============================================================================
-- VIEWS
-- =============================================================================

CREATE VIEW cruise_lines_with_ship_counts AS
SELECT cl.id, cl.name, cl.ships, cl.is_active, cl.display_order,
       jsonb_array_length(cl.ships) as ships_count, cl.created_at, cl.updated_at
FROM cruise_lines cl
ORDER BY cl.display_order, cl.name;

COMMENT ON TABLE cruise_lines IS 'Admin-configurable cruise line companies with ships stored as JSONB array';
COMMENT ON TABLE terminals IS 'Southampton cruise terminals, configurable by admin';
