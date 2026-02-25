-- Migration: Update cruise_lines table to use JSONB ships column
-- This migration modifies the cruise_lines table to store ships as a JSONB array
-- instead of using a separate ships table.

-- =============================================================================
-- 1. DROP EXISTING SHIPS TABLE AND RELATED VIEWS
-- =============================================================================

-- Drop views first
DROP VIEW IF EXISTS ships_with_cruise_lines CASCADE;
DROP VIEW IF EXISTS cruise_lines_with_ships CASCADE;

-- Drop the separate ships table (ships will now be stored in cruise_lines as JSONB)
DROP TABLE IF EXISTS ships CASCADE;

-- =============================================================================
-- 2. ADD SHIPS COLUMN TO CRUISE_LINES TABLE
-- =============================================================================

-- Add ships JSONB column to cruise_lines
ALTER TABLE cruise_lines
ADD COLUMN IF NOT EXISTS ships JSONB NOT NULL DEFAULT '[]';

-- =============================================================================
-- 3. CLEAR AND RE-SEED CRUISE LINES DATA WITH SHIPS
-- =============================================================================

-- Clear existing cruise lines (since we need to add ships data)
TRUNCATE TABLE cruise_lines CASCADE;

-- Insert cruise lines with ships as JSONB arrays
INSERT INTO cruise_lines (name, ships, is_active, display_order) VALUES
  ('P&O Cruises', '["Iona", "Arvia", "Britannia", "Ventura", "Arcadia", "Aurora"]'::jsonb, true, 1),
  ('Cunard', '["Queen Mary 2", "Queen Victoria", "Queen Anne"]'::jsonb, true, 2),
  ('Royal Caribbean', '["Anthem of the Seas", "Independence of the Seas"]'::jsonb, true, 3),
  ('MSC Cruises', '["MSC Virtuosa", "MSC Preziosa"]'::jsonb, true, 4),
  ('Princess Cruises', '["Sky Princess", "Regal Princess"]'::jsonb, true, 5),
  ('Celebrity Cruises', '["Celebrity Apex", "Celebrity Silhouette"]'::jsonb, true, 6)
ON CONFLICT (name) DO UPDATE SET
  ships = EXCLUDED.ships,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- =============================================================================
-- 4. CREATE NEW VIEW WITH SHIP COUNTS
-- =============================================================================

CREATE VIEW cruise_lines_with_ship_counts AS
SELECT cl.id, cl.name, cl.ships, cl.is_active, cl.display_order,
       jsonb_array_length(cl.ships) as ships_count, cl.created_at, cl.updated_at
FROM cruise_lines cl
ORDER BY cl.display_order, cl.name;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- To verify the migration worked:
-- SELECT name, ships, jsonb_array_length(ships) as ship_count FROM cruise_lines ORDER BY display_order;
