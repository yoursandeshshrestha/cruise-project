-- Create Terminals Table
-- Dedicated table for managing cruise terminals

-- Drop existing table if it exists
DROP TABLE IF EXISTS terminals CASCADE;

-- Create terminals table
CREATE TABLE terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  location VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_terminals_active ON terminals(is_active);
CREATE INDEX idx_terminals_order ON terminals(display_order);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_terminals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_terminals_timestamp
  BEFORE UPDATE ON terminals
  FOR EACH ROW
  EXECUTE FUNCTION update_terminals_updated_at();

-- Row Level Security (RLS)
ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;

-- Public can read active terminals
CREATE POLICY "Public can read active terminals"
  ON terminals
  FOR SELECT
  USING (true);

-- Authenticated users can manage terminals
CREATE POLICY "Authenticated users can manage terminals"
  ON terminals
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Seed default terminals (from existing settings)
INSERT INTO terminals (name, location, is_active, display_order) VALUES
  ('Ocean Terminal', 'Southampton', true, 1),
  ('Mayflower Terminal', 'Southampton', true, 2),
  ('City Cruise Terminal', 'Southampton', true, 3),
  ('QEII Terminal', 'Southampton', true, 4),
  ('Horizon Cruise Terminal', 'Southampton', true, 5);
