-- Enable Realtime for bookings and contact_submissions tables
-- This allows real-time subscriptions to work properly

-- Enable replica identity for bookings (needed for realtime updates/deletes)
ALTER TABLE bookings REPLICA IDENTITY FULL;

-- Enable replica identity for contact_submissions
ALTER TABLE contact_submissions REPLICA IDENTITY FULL;

-- Add publication for realtime (this makes the tables available to the realtime server)
-- Note: In Supabase, the 'supabase_realtime' publication is automatically created
-- We just need to add our tables to it

DO $$
BEGIN
  -- Check if supabase_realtime publication exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;

-- Add comment
COMMENT ON TABLE bookings IS 'Bookings table with realtime enabled';
COMMENT ON TABLE contact_submissions IS 'Contact submissions table with realtime enabled';
