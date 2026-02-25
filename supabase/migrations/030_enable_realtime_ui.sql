-- Alternative way to enable realtime - ensure replication is enabled for these tables
-- This should be done via the Supabase Dashboard UI at Database > Replication
-- But if that doesn't work, this SQL can help

-- First check if the publication exists and has the tables
DO $$
BEGIN
  -- Verify the publication exists
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE NOTICE 'supabase_realtime publication exists';
  ELSE
    RAISE EXCEPTION 'supabase_realtime publication does not exist';
  END IF;
END $$;

-- Verify tables are in the publication
SELECT
  schemaname,
  tablename,
  pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('bookings', 'contact_submissions');
