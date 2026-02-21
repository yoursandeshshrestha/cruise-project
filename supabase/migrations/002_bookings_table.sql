-- Bookings Table
-- Main table for storing all parking reservations
-- Consolidated from: 002_create_bookings_table.sql + 018_fix_bookings_rls_consistent.sql

-- Create bookings table
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

-- Indexes for performance
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_drop_off ON bookings(drop_off_datetime);
CREATE INDEX idx_bookings_return ON bookings(return_datetime);
CREATE INDEX idx_bookings_vehicle_reg ON bookings(vehicle_registration);
CREATE INDEX idx_bookings_dates ON bookings(drop_off_datetime, return_datetime);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anonymous users can create bookings (public booking form)
CREATE POLICY "bookings_insert_anon"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Anonymous users can view bookings (for booking lookup by reference/email)
CREATE POLICY "bookings_select_anon"
  ON bookings
  FOR SELECT
  TO anon
  USING (true);

-- Policy 3: Authenticated users can view all bookings
CREATE POLICY "bookings_select_authenticated"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Authenticated users can update bookings
CREATE POLICY "bookings_update_authenticated"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Authenticated users can delete bookings
CREATE POLICY "bookings_delete_authenticated"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE bookings IS 'Bookings table - RLS enabled with anon (create/read) and authenticated (full CRUD) policies';
