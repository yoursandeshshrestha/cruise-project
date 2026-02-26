-- =============================================================================
-- Cruise Lines Table
-- =============================================================================
-- Cruise line companies with their ships
-- Ships stored as JSONB array for flexibility
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE cruise_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  ships JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_cruise_lines_active ON cruise_lines(is_active);
CREATE INDEX idx_cruise_lines_order ON cruise_lines(display_order);

-- TRIGGER
CREATE TRIGGER update_cruise_lines_updated_at
  BEFORE UPDATE ON cruise_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY
ALTER TABLE cruise_lines ENABLE ROW LEVEL SECURITY;

-- Public can view active cruise lines, authenticated can manage
CREATE POLICY "cruise_lines_select_anon"
  ON cruise_lines FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "cruise_lines_select_authenticated"
  ON cruise_lines FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "cruise_lines_insert_authenticated"
  ON cruise_lines FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "cruise_lines_update_authenticated"
  ON cruise_lines FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "cruise_lines_delete_authenticated"
  ON cruise_lines FOR DELETE TO authenticated
  USING (true);

-- SEED DATA
-- Major cruise lines operating from Southampton
INSERT INTO cruise_lines (name, ships, is_active, display_order) VALUES
  ('P&O Cruises', '["Iona", "Arvia", "Britannia", "Ventura", "Arcadia", "Aurora"]'::jsonb, true, 1),
  ('Cunard', '["Queen Mary 2", "Queen Victoria", "Queen Anne"]'::jsonb, true, 2),
  ('Royal Caribbean', '["Anthem of the Seas", "Independence of the Seas"]'::jsonb, true, 3),
  ('MSC Cruises', '["MSC Virtuosa", "MSC Preziosa"]'::jsonb, true, 4),
  ('Princess Cruises', '["Sky Princess", "Regal Princess"]'::jsonb, true, 5),
  ('Celebrity Cruises', '["Celebrity Apex", "Celebrity Silhouette"]'::jsonb, true, 6);

-- COMMENTS
COMMENT ON TABLE cruise_lines IS 'Cruise line companies with ships as JSONB array - RLS: anon (active only), authenticated (full)';
COMMENT ON COLUMN cruise_lines.ships IS 'JSONB array of ship names (e.g., ["Ship 1", "Ship 2"])';
