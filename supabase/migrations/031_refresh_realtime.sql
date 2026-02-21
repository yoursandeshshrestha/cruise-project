-- Refresh Realtime publication by removing and re-adding tables
-- This helps resolve "mismatch between server and client bindings" errors

-- Remove tables from publication (ignore errors if not present)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE bookings;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE contact_submissions;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Re-add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;

-- Verify tables are in publication
DO $$
DECLARE
  bookings_count INTEGER;
  contact_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bookings_count
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime' AND tablename = 'bookings';

  SELECT COUNT(*) INTO contact_count
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime' AND tablename = 'contact_submissions';

  IF bookings_count = 0 THEN
    RAISE EXCEPTION 'bookings table not in supabase_realtime publication';
  END IF;

  IF contact_count = 0 THEN
    RAISE EXCEPTION 'contact_submissions table not in supabase_realtime publication';
  END IF;

  RAISE NOTICE 'Both tables successfully added to supabase_realtime publication';
END $$;
