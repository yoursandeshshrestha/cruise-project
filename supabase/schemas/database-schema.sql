-- Simple Cruise Parking - Database Schema
-- PostgreSQL / Supabase
-- Last Updated: 2026-02-21

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Customers (Optional - for customer accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);

-- -----------------------------------------------------------------------------
-- Bookings
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,

  -- Customer Information
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,

  -- Vehicle Information
  vehicle_registration VARCHAR(20) NOT NULL,
  vehicle_make VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(10) DEFAULT 'car',

  -- Trip Information
  cruise_line VARCHAR(100) NOT NULL,
  ship_name VARCHAR(100) NOT NULL,
  terminal VARCHAR(100),
  drop_off_datetime TIMESTAMPTZ NOT NULL,
  return_datetime TIMESTAMPTZ NOT NULL,
  number_of_passengers INTEGER NOT NULL CHECK (number_of_passengers >= 1 AND number_of_passengers <= 8),

  -- Parking
  parking_type VARCHAR(50) DEFAULT 'Park and Ride',

  -- Add-ons (stored as JSON array of IDs)
  add_ons JSONB DEFAULT '[]'::jsonb,

  -- Pricing (stored in pence to avoid floating point issues)
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  vat INTEGER NOT NULL CHECK (vat >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  discount INTEGER DEFAULT 0 CHECK (discount >= 0),
  promo_code VARCHAR(50),

  -- Payment
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  payment_status VARCHAR(50),

  -- Status
  status booking_status DEFAULT 'pending',
  cancellation_reason TEXT,
  refund_amount INTEGER,
  refund_processed_at TIMESTAMPTZ,

  -- Admin Notes
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_drop_off ON bookings(drop_off_datetime);
CREATE INDEX idx_bookings_return ON bookings(return_datetime);
CREATE INDEX idx_bookings_vehicle_reg ON bookings(vehicle_registration);
CREATE INDEX idx_bookings_dates ON bookings(drop_off_datetime, return_datetime);

-- -----------------------------------------------------------------------------
-- Capacity Configuration
-- -----------------------------------------------------------------------------
CREATE TABLE capacity_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0), -- in pence
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_add_ons_active ON add_ons(is_active);
CREATE INDEX idx_add_ons_order ON add_ons(display_order);

-- -----------------------------------------------------------------------------
-- Promo Codes
-- -----------------------------------------------------------------------------
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value INTEGER NOT NULL CHECK (discount_value > 0), -- percentage (1-100) or pence
  minimum_spend INTEGER CHECK (minimum_spend IS NULL OR minimum_spend > 0), -- in pence
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  current_uses INTEGER DEFAULT 0 CHECK (current_uses >= 0),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (valid_until > valid_from)
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);

-- -----------------------------------------------------------------------------
-- Admin Users
-- -----------------------------------------------------------------------------
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Function to update capacity count
CREATE OR REPLACE FUNCTION update_capacity_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When booking is confirmed, increment capacity
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- Implementation in Edge Function
    NULL;
  END IF;

  -- When booking is cancelled, decrement capacity
  IF NEW.status = 'cancelled' AND OLD.status IN ('confirmed', 'checked_in') THEN
    -- Implementation in Edge Function
    NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

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

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
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
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Bookings Policies
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admin full access to bookings
CREATE POLICY "Admins can do everything on bookings"
  ON bookings
  USING (auth.jwt() ->> 'role' = 'admin');

-- Public read access to pricing and add-ons
CREATE POLICY "Public can view pricing rules"
  ON pricing_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view add-ons"
  ON add_ons FOR SELECT
  USING (is_active = true);

-- Admin access to all tables
CREATE POLICY "Admins can manage capacity"
  ON capacity_config
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage promo codes"
  ON promo_codes
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage admin users"
  ON admin_users
  USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- INITIAL SEED DATA
-- =============================================================================

-- Default pricing rule
INSERT INTO pricing_rules (name, description, price_per_day, minimum_charge, is_active, priority)
VALUES (
  'Standard Pricing',
  'Tiered pricing from £26/day. See pricing page for full schedule.',
  2600, -- £26.00 in pence
  2600, -- £26.00 in pence
  true,
  0
);

-- Add-ons
INSERT INTO add_ons (slug, name, description, price, icon, display_order) VALUES
  ('ev-charging', 'EV Charging', 'Full charge while you cruise', 3500, 'zap', 1),
  ('exterior-wash', 'Exterior Wash', 'Professional exterior cleaning', 1500, 'droplet', 2),
  ('full-valet', 'Full Valet', 'Complete interior and exterior valet', 4500, 'sparkles', 3);

-- Default capacity (100 spaces per day for next year)
INSERT INTO capacity_config (date, max_capacity)
SELECT
  CURRENT_DATE + i,
  100
FROM generate_series(0, 365) AS i;

-- Sample promo code
INSERT INTO promo_codes (code, description, discount_type, discount_value, valid_from, valid_until, is_active)
VALUES (
  'FIRST10',
  'First booking 10% discount',
  'percentage',
  10,
  NOW(),
  NOW() + INTERVAL '1 year',
  true
);

-- =============================================================================
-- VIEWS (for common queries)
-- =============================================================================

-- Daily arrivals view
CREATE VIEW daily_arrivals AS
SELECT
  DATE(drop_off_datetime) as arrival_date,
  COUNT(*) as arrivals_count,
  SUM(total) as total_revenue
FROM bookings
WHERE status IN ('confirmed', 'checked_in')
GROUP BY DATE(drop_off_datetime)
ORDER BY arrival_date;

-- Daily departures view
CREATE VIEW daily_departures AS
SELECT
  DATE(return_datetime) as departure_date,
  COUNT(*) as departures_count
FROM bookings
WHERE status IN ('confirmed', 'checked_in', 'completed')
GROUP BY DATE(return_datetime)
ORDER BY departure_date;

-- Revenue summary view
CREATE VIEW revenue_summary AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as bookings_count,
  SUM(total) as total_revenue,
  SUM(CASE WHEN status = 'confirmed' THEN total ELSE 0 END) as confirmed_revenue,
  SUM(CASE WHEN status = 'cancelled' THEN refund_amount ELSE 0 END) as refunds
FROM bookings
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE bookings IS 'Main bookings table storing all parking reservations';
COMMENT ON TABLE capacity_config IS 'Daily capacity management for parking spaces';
COMMENT ON TABLE pricing_rules IS 'Configurable pricing rules including seasonal rates';
COMMENT ON TABLE add_ons IS 'Available add-on services';
COMMENT ON TABLE promo_codes IS 'Promotional discount codes';
COMMENT ON TABLE admin_users IS 'Admin user management';
COMMENT ON TABLE audit_logs IS 'System audit trail for all important actions';

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
