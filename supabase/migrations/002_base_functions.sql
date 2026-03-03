-- =============================================================================
-- BASE FUNCTIONS
-- =============================================================================
-- Basic utility functions with no table dependencies
-- =============================================================================

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Trigger function to automatically update updated_at timestamp on row updates';
