-- =============================================================================
-- REALTIME CONFIGURATION
-- =============================================================================
-- Enable realtime subscriptions for bookings and contact_submissions
-- =============================================================================

-- Enable replica identity FULL for realtime updates and deletes
ALTER TABLE bookings REPLICA IDENTITY FULL;
ALTER TABLE contact_submissions REPLICA IDENTITY FULL;

-- Create supabase_realtime publication if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Comments
COMMENT ON TABLE bookings IS 'Bookings table with realtime enabled - subscribe for live updates';
COMMENT ON TABLE contact_submissions IS 'Contact submissions with realtime enabled - subscribe for live updates';
