-- =============================================================================
-- Grant Sequence Permissions
-- =============================================================================
-- Ensure anon role can use sequences for auto-generated columns
-- Created: 2026-02-26
-- =============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant sequence permissions for all tables
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Set default privileges for future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Sequence permissions granted successfully';
END $$;
