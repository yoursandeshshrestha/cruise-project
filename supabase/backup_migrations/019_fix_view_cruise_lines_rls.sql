-- Fix cruise_lines_with_ship_counts view RLS
-- Views can have RLS enabled in PostgreSQL/Supabase

-- Drop and recreate the view
DROP VIEW IF EXISTS cruise_lines_with_ship_counts CASCADE;

CREATE VIEW cruise_lines_with_ship_counts AS
SELECT cl.id, cl.name, cl.ships, cl.is_active, cl.display_order,
       jsonb_array_length(cl.ships) as ships_count, cl.created_at, cl.updated_at
FROM cruise_lines cl
ORDER BY cl.display_order, cl.name;

-- Enable RLS on the view
ALTER VIEW cruise_lines_with_ship_counts SET (security_invoker = true);

-- Grant permissions
GRANT SELECT ON cruise_lines_with_ship_counts TO anon;
GRANT SELECT ON cruise_lines_with_ship_counts TO authenticated;

-- Add comment
COMMENT ON VIEW cruise_lines_with_ship_counts IS 'View for cruise lines with ship counts - security_invoker enabled to inherit RLS from cruise_lines table';
