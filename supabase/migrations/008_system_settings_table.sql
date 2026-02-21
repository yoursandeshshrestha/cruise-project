-- System Settings Table
-- Group-based JSONB storage for platform configuration

-- =============================================================================
-- TABLE DEFINITION
-- =============================================================================

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(50) UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_system_settings_group ON system_settings(group_name);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anonymous users can read all settings
CREATE POLICY "system_settings_select_anon"
  ON system_settings
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Authenticated users can view all settings
CREATE POLICY "system_settings_select_authenticated"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create settings
CREATE POLICY "system_settings_insert_authenticated"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update settings
CREATE POLICY "system_settings_update_authenticated"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete settings
CREATE POLICY "system_settings_delete_authenticated"
  ON system_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get setting value by group and key
CREATE OR REPLACE FUNCTION get_setting(p_group VARCHAR, p_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT settings ->> p_key INTO result
  FROM system_settings
  WHERE group_name = p_group;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_setting(VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION get_setting(VARCHAR, VARCHAR) TO authenticated;

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Business information
INSERT INTO system_settings (group_name, settings) VALUES (
  'business',
  '{
    "company_name": "Simple Cruise Parking",
    "company_email": "info@simplecruiseparking.com",
    "company_phone": "+44 (0) 23 8000 0000",
    "company_address": "Southampton, UK"
  }'::jsonb
);

-- Capacity settings
INSERT INTO system_settings (group_name, settings) VALUES (
  'capacity',
  '{
    "default_daily_capacity": 100,
    "buffer_spaces": 10
  }'::jsonb
);

-- Operational settings
INSERT INTO system_settings (group_name, settings) VALUES (
  'operational',
  '{
    "operating_hours_open": "06:00",
    "operating_hours_close": "22:00",
    "booking_cutoff_hours": 24
  }'::jsonb
);

-- Feature flags
INSERT INTO system_settings (group_name, settings) VALUES (
  'features',
  '{
    "booking_enabled": true,
    "maintenance_mode": false,
    "promo_codes_enabled": true,
    "show_cancellation_policy": true,
    "cancellation_policy_text": "Free cancellation up to 48 hours before arrival."
  }'::jsonb
);

-- Notification settings
INSERT INTO system_settings (group_name, settings) VALUES (
  'notifications',
  '{
    "email_notifications_enabled": true,
    "sms_notifications_enabled": false
  }'::jsonb
);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE system_settings IS 'System settings table - Group-based JSONB storage for platform configuration. Each row represents a settings group. RLS enabled with anon (read) and authenticated (full CRUD) policies';
COMMENT ON FUNCTION get_setting(VARCHAR, VARCHAR) IS 'Helper function to retrieve setting value by group and key (e.g., get_setting(''pricing'', ''daily_parking_rate''))';
