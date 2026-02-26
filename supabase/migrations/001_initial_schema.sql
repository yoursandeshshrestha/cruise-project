-- Simple Cruise Parking - Initial Schema
-- PostgreSQL / Supabase
-- Last Updated: 2026-02-21

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'checked_in',
  'completed',
  'cancelled'
);

CREATE TYPE admin_role AS ENUM (
  'admin',
  'manager',
  'staff'
);

CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed'
);

-- =============================================================================
-- BASE TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Capacity Configuration
-- -----------------------------------------------------------------------------
CREATE TABLE capacity_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
  current_bookings INTEGER DEFAULT 0 CHECK (current_bookings >= 0),
  override_capacity INTEGER CHECK (override_capacity IS NULL OR override_capacity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capacity_date ON capacity_config(date);

-- -----------------------------------------------------------------------------
-- Pricing Rules (for seasonal pricing)
-- -----------------------------------------------------------------------------
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_day INTEGER NOT NULL CHECK (price_per_day > 0), -- in pence
  minimum_charge INTEGER NOT NULL CHECK (minimum_charge > 0), -- in pence
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority rules override lower ones
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pricing_rules_dates ON pricing_rules(start_date, end_date);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);

-- -----------------------------------------------------------------------------
-- Add-ons
-- -----------------------------------------------------------------------------
CREATE TABLE add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0), -- in pence
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_add_ons_active ON add_ons(is_active);
CREATE INDEX idx_add_ons_order ON add_ons(display_order);

-- -----------------------------------------------------------------------------
-- Admin Users
-- -----------------------------------------------------------------------------
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role admin_role DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- -----------------------------------------------------------------------------
-- Audit Logs
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- -----------------------------------------------------------------------------
-- Email Queue (for reliable email delivery)
-- -----------------------------------------------------------------------------
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email VARCHAR(255) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_variables JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  mailgun_message_id VARCHAR(255),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  new_reference TEXT;
  reference_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate reference like SCP-1234
    new_reference := 'SCP-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Check if reference already exists
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_reference = new_reference) INTO reference_exists;

    EXIT WHEN NOT reference_exists;
  END LOOP;

  RETURN new_reference;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_capacity_config_updated_at
  BEFORE UPDATE ON capacity_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_add_ons_updated_at
  BEFORE UPDATE ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE capacity_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Capacity Config: Authenticated users only
CREATE POLICY "capacity_config_select_authenticated"
  ON capacity_config FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "capacity_config_insert_authenticated"
  ON capacity_config FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "capacity_config_update_authenticated"
  ON capacity_config FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "capacity_config_delete_authenticated"
  ON capacity_config FOR DELETE TO authenticated
  USING (true);

-- Pricing Rules: Public can view active, authenticated can manage
CREATE POLICY "pricing_rules_select_anon"
  ON pricing_rules FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "pricing_rules_select_authenticated"
  ON pricing_rules FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "pricing_rules_insert_authenticated"
  ON pricing_rules FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "pricing_rules_update_authenticated"
  ON pricing_rules FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "pricing_rules_delete_authenticated"
  ON pricing_rules FOR DELETE TO authenticated
  USING (true);

-- Add-ons: Public can view active, authenticated can manage
CREATE POLICY "add_ons_select_anon"
  ON add_ons FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "add_ons_select_authenticated"
  ON add_ons FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "add_ons_insert_authenticated"
  ON add_ons FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "add_ons_update_authenticated"
  ON add_ons FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "add_ons_delete_authenticated"
  ON add_ons FOR DELETE TO authenticated
  USING (true);

-- Audit Logs: Authenticated users only
CREATE POLICY "audit_logs_select_authenticated"
  ON audit_logs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audit_logs_insert_authenticated"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "audit_logs_update_authenticated"
  ON audit_logs FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "audit_logs_delete_authenticated"
  ON audit_logs FOR DELETE TO authenticated
  USING (true);

-- Email Queue: Authenticated users only
CREATE POLICY "email_queue_select_authenticated"
  ON email_queue FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "email_queue_insert_authenticated"
  ON email_queue FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "email_queue_update_authenticated"
  ON email_queue FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "email_queue_delete_authenticated"
  ON email_queue FOR DELETE TO authenticated
  USING (true);

-- =============================================================================
-- INITIAL SEED DATA
-- =============================================================================

-- Default pricing rule
INSERT INTO pricing_rules (name, description, price_per_day, minimum_charge, is_active, priority)
VALUES (
  'Standard Pricing',
  'Default £12.50 per day with £45 minimum',
  1250, -- £12.50 in pence
  4500, -- £45 in pence
  true,
  0
);

-- Add-ons
INSERT INTO add_ons (slug, name, description, price, display_order) VALUES
  ('ev-charging', 'EV Charging', 'Full charge while you cruise', 3500, 1),
  ('exterior-wash', 'Exterior Wash', 'External cleaning', 1500, 2),
  ('full-valet', 'Full Valet', 'Complete interior and exterior valet', 4500, 3);

-- Default capacity (100 spaces per day for next year)
INSERT INTO capacity_config (date, max_capacity)
SELECT
  CURRENT_DATE + i,
  100
FROM generate_series(0, 365) AS i;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE capacity_config IS 'Capacity configuration table - RLS enabled with authenticated role policies';
COMMENT ON TABLE pricing_rules IS 'Pricing rules table - RLS enabled with anon (active only) and authenticated policies';
COMMENT ON TABLE add_ons IS 'Add-ons table - RLS enabled with anon (active only) and authenticated policies';
COMMENT ON TABLE admin_users IS 'Admin users table - RLS enabled with authenticated role policies';
COMMENT ON TABLE audit_logs IS 'Audit logs table - RLS enabled with authenticated role policies';
COMMENT ON TABLE email_queue IS 'Email queue table - RLS enabled with authenticated role policies';
