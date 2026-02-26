-- =============================================================================
-- Bookings Table
-- =============================================================================
-- Customer parking reservations with payment and status tracking
-- RLS: Properly configured to allow anon users to create bookings (public form)
--      and authenticated users (admins) to manage all bookings
-- Created: 2026-02-26
-- Replaces: Original 002 + fixes from 013-023
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,

  -- Customer Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,

  -- Vehicle Information
  vehicle_registration VARCHAR(20) NOT NULL,
  vehicle_make VARCHAR(100) NOT NULL,

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
  stripe_checkout_session_id VARCHAR(255),
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
  cancelled_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_dates CHECK (return_datetime > drop_off_datetime)
);

-- INDEXES
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_drop_off ON bookings(drop_off_datetime);
CREATE INDEX idx_bookings_return ON bookings(return_datetime);
CREATE INDEX idx_bookings_vehicle_reg ON bookings(vehicle_registration);
CREATE INDEX idx_bookings_dates ON bookings(drop_off_datetime, return_datetime);
CREATE INDEX idx_bookings_checkout_session ON bookings(stripe_checkout_session_id);

-- TRIGGER
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY - PROPERLY CONFIGURED
-- =============================================================================
-- This is the FINAL WORKING configuration from migration 021
-- Key insight: RLS policies need table-level GRANTs to work properly

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Grant table-level permissions BEFORE creating policies
GRANT SELECT, INSERT ON TABLE bookings TO anon;
GRANT ALL ON TABLE bookings TO authenticated;

-- Anon users: Can INSERT (create bookings via public form)
CREATE POLICY "anon_can_insert_bookings"
  ON bookings
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon users: Can SELECT (view their booking via lookup)
CREATE POLICY "anon_can_select_bookings"
  ON bookings
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users: Can SELECT all bookings
CREATE POLICY "auth_can_select_bookings"
  ON bookings
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users: Can UPDATE bookings
CREATE POLICY "auth_can_update_bookings"
  ON bookings
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users: Can DELETE bookings
CREATE POLICY "auth_can_delete_bookings"
  ON bookings
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (true);

-- COMMENTS
COMMENT ON TABLE bookings IS 'Customer parking bookings - RLS: anon (INSERT+SELECT), authenticated (full CRUD)';
COMMENT ON COLUMN bookings.booking_reference IS 'Unique reference (SCP-XXXX) for customer lookup';
COMMENT ON COLUMN bookings.add_ons IS 'JSONB array of add-on IDs selected by customer';
COMMENT ON COLUMN bookings.subtotal IS 'Price before VAT in pence';
COMMENT ON COLUMN bookings.vat IS 'VAT amount in pence';
COMMENT ON COLUMN bookings.total IS 'Final price including VAT and discounts in pence';
COMMENT ON COLUMN bookings.stripe_checkout_session_id IS 'Stripe Checkout Session ID for redirect payment flow';
