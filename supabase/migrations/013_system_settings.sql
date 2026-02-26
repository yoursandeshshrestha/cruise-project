-- =============================================================================
-- System Settings Table
-- =============================================================================
-- Group-based JSONB configuration storage for platform settings
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(50) UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_system_settings_group ON system_settings(group_name);

-- TRIGGER
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- HELPER FUNCTION
-- =============================================================================

-- Get setting value by group and key
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

GRANT EXECUTE ON FUNCTION get_setting(VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION get_setting(VARCHAR, VARCHAR) TO authenticated;

-- ROW LEVEL SECURITY
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings, authenticated can manage
CREATE POLICY "system_settings_select_anon"
  ON system_settings FOR SELECT TO anon
  USING (true);

CREATE POLICY "system_settings_select_authenticated"
  ON system_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "system_settings_insert_authenticated"
  ON system_settings FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "system_settings_update_authenticated"
  ON system_settings FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "system_settings_delete_authenticated"
  ON system_settings FOR DELETE TO authenticated
  USING (true);

-- SEED DATA
-- Default system configuration
INSERT INTO system_settings (group_name, settings) VALUES
  ('business', '{
    "company_name": "Simple Cruise Parking",
    "company_email": "info@simplecruiseparking.com",
    "company_phone": "+44 (0) 23 8000 0000",
    "company_address": "Southampton, UK"
  }'::jsonb),
  ('capacity', '{
    "default_daily_capacity": 100,
    "buffer_spaces": 10
  }'::jsonb),
  ('operational', '{
    "operating_hours_open": "06:00",
    "operating_hours_close": "22:00",
    "booking_cutoff_hours": 24
  }'::jsonb),
  ('features', '{
    "booking_enabled": true,
    "maintenance_mode": false,
    "promo_codes_enabled": true,
    "show_cancellation_policy": true,
    "cancellation_policy_text": "Free cancellation up to 48 hours before arrival."
  }'::jsonb),
  ('notifications', '{
    "email_notifications_enabled": true,
    "sms_notifications_enabled": false
  }'::jsonb);

-- COMMENTS
COMMENT ON TABLE system_settings IS 'Group-based JSONB configuration storage - RLS: anon (read), authenticated (full)';
COMMENT ON COLUMN system_settings.group_name IS 'Setting group identifier (e.g., "business", "capacity", "features")';
COMMENT ON COLUMN system_settings.settings IS 'JSONB object containing group settings';
COMMENT ON FUNCTION get_setting(VARCHAR, VARCHAR) IS 'Helper to retrieve setting value: get_setting(''business'', ''company_name'')';
