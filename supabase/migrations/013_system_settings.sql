-- =============================================================================
-- SYSTEM_SETTINGS TABLE
-- =============================================================================
-- Group-based JSONB configuration storage
-- =============================================================================

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(50) UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_system_settings_group ON system_settings(group_name);

-- Triggers
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE system_settings IS 'Group-based JSONB configuration storage';
COMMENT ON COLUMN system_settings.group_name IS 'Setting group identifier (e.g., "business", "capacity", "features")';
COMMENT ON COLUMN system_settings.settings IS 'JSONB object containing group settings';
