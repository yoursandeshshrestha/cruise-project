-- System Settings
-- This migration creates tables for managing system-wide configuration

-- Drop existing tables if they exist
DROP TABLE IF EXISTS capacity_overrides CASCADE;
DROP TABLE IF EXISTS seasonal_pricing CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- =============================================================================
-- System Settings Table (General Configuration)
-- =============================================================================
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  category VARCHAR(50), -- 'pricing', 'capacity', 'operational', 'taxes'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index for fast lookups
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- =============================================================================
-- Add-ons Table
-- =============================================================================
CREATE TABLE add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_add_ons_active ON add_ons(is_active);
CREATE INDEX idx_add_ons_order ON add_ons(display_order);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_add_ons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_add_ons_timestamp
  BEFORE UPDATE ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_add_ons_updated_at();

-- =============================================================================
-- Seasonal Pricing Rules Table
-- =============================================================================
CREATE TABLE seasonal_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  daily_rate DECIMAL(10,2) NOT NULL CHECK (daily_rate > 0),
  minimum_cost DECIMAL(10,2) NOT NULL CHECK (minimum_cost > 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority = used first
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_seasonal_pricing_dates ON seasonal_pricing(start_date, end_date);
CREATE INDEX idx_seasonal_pricing_active ON seasonal_pricing(is_active);
CREATE INDEX idx_seasonal_pricing_priority ON seasonal_pricing(priority DESC);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_seasonal_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seasonal_pricing_timestamp
  BEFORE UPDATE ON seasonal_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_seasonal_pricing_updated_at();

-- =============================================================================
-- Capacity Overrides Table (Per-Day Capacity Management)
-- =============================================================================
CREATE TABLE capacity_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  max_capacity INTEGER NOT NULL CHECK (max_capacity >= 0),
  current_bookings INTEGER DEFAULT 0 CHECK (current_bookings >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_capacity_overrides_date ON capacity_overrides(date);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_capacity_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_capacity_overrides_timestamp
  BEFORE UPDATE ON capacity_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_capacity_overrides_updated_at();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- System Settings: Public read, admin write
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read system settings"
  ON system_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update system settings"
  ON system_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.%'
    )
  );

-- Add-ons: Public read active, admin manage all
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active add-ons"
  ON add_ons
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE '%@admin.%'
  ));

CREATE POLICY "Only admins can manage add-ons"
  ON add_ons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.%'
    )
  );

-- Seasonal Pricing: Public read active, admin manage all
ALTER TABLE seasonal_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active seasonal pricing"
  ON seasonal_pricing
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE '%@admin.%'
  ));

CREATE POLICY "Only admins can manage seasonal pricing"
  ON seasonal_pricing
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.%'
    )
  );

-- Capacity Overrides: Admins only
ALTER TABLE capacity_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage capacity overrides"
  ON capacity_overrides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.%'
    )
  );

-- =============================================================================
-- Seed Default Settings
-- =============================================================================

-- Base Pricing Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
  ('daily_rate', '12.50', 'number', 'Standard daily parking rate in GBP', 'pricing'),
  ('minimum_stay_cost', '45.00', 'number', 'Minimum cost for any booking in GBP', 'pricing'),
  ('vat_rate', '0.20', 'number', 'VAT rate (20% = 0.20)', 'taxes');

-- Capacity Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
  ('default_daily_capacity', '100', 'number', 'Default number of parking spaces available per day', 'capacity'),
  ('buffer_spaces', '10', 'number', 'Reserve spaces held back from online booking', 'capacity');

-- Operational Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
  ('operating_hours_open', '06:00', 'string', 'Daily opening time (24-hour format)', 'operational'),
  ('operating_hours_close', '22:00', 'string', 'Daily closing time (24-hour format)', 'operational'),
  ('terminals', '["Ocean Terminal", "Mayflower Terminal", "City Cruise Terminal", "QEII Terminal", "Horizon Cruise Terminal"]', 'json', 'Available cruise terminals', 'operational');

-- Seed Default Add-ons
INSERT INTO add_ons (slug, name, description, price, icon, is_active, display_order) VALUES
  ('ev-charge', 'EV Charging', 'Fully charged ready for your journey home.', 35.00, 'Zap', true, 1),
  ('wash-ext', 'Exterior Wash', 'Hand wash and chamois dry.', 15.00, 'Droplets', true, 2),
  ('wash-full', 'Full Valet', 'Interior vacuum and exterior wash.', 45.00, 'Sparkles', true, 3);

-- =============================================================================
-- Helper Functions
-- =============================================================================

-- Function to get setting value by key
CREATE OR REPLACE FUNCTION get_setting(key VARCHAR)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT setting_value INTO result
  FROM system_settings
  WHERE setting_key = key;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get applicable pricing for a date
CREATE OR REPLACE FUNCTION get_pricing_for_date(booking_date DATE)
RETURNS TABLE(daily_rate DECIMAL, minimum_cost DECIMAL) AS $$
BEGIN
  -- Check if there's an active seasonal pricing rule for this date
  RETURN QUERY
  SELECT sp.daily_rate, sp.minimum_cost
  FROM seasonal_pricing sp
  WHERE sp.is_active = true
    AND booking_date BETWEEN sp.start_date AND sp.end_date
  ORDER BY sp.priority DESC
  LIMIT 1;

  -- If no seasonal pricing found, return default rates
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      CAST(get_setting('daily_rate') AS DECIMAL(10,2)),
      CAST(get_setting('minimum_stay_cost') AS DECIMAL(10,2));
  END IF;
END;
$$ LANGUAGE plpgsql;
