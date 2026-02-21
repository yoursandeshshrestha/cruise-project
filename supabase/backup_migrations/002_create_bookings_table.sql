-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS bookings CASCADE;

-- Create bookings table with correct types
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,

  -- Customer details
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,

  -- Vehicle details
  vehicle_registration VARCHAR(20) NOT NULL,
  vehicle_make VARCHAR(100) NOT NULL,

  -- Trip details
  cruise_line VARCHAR(100) NOT NULL,
  ship_name VARCHAR(100) NOT NULL,
  terminal VARCHAR(100),
  drop_off_datetime TIMESTAMPTZ NOT NULL,
  return_datetime TIMESTAMPTZ NOT NULL,
  number_of_passengers INTEGER NOT NULL DEFAULT 1,

  -- Parking & extras
  parking_type VARCHAR(50) NOT NULL DEFAULT 'park_and_ride',
  add_ons JSONB DEFAULT '[]'::jsonb,

  -- Pricing (DECIMAL not INTEGER)
  subtotal DECIMAL(10,2) NOT NULL,
  vat DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  promo_code VARCHAR(50),

  -- Payment
  stripe_payment_intent_id VARCHAR(100),
  stripe_charge_id VARCHAR(100),
  payment_status VARCHAR(50),

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  cancellation_reason TEXT,
  refund_amount DECIMAL(10,2),
  refund_processed_at TIMESTAMPTZ,
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled')),
  CONSTRAINT valid_passengers CHECK (number_of_passengers > 0),
  CONSTRAINT valid_dates CHECK (return_datetime > drop_off_datetime)
);

-- Create indexes for performance
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_drop_off ON bookings(drop_off_datetime);
CREATE INDEX idx_bookings_return ON bookings(return_datetime);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookings_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a booking (public booking form)
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read all bookings (for public lookup)
CREATE POLICY "Anyone can read bookings"
  ON bookings
  FOR SELECT
  USING (true);

-- Policy: Only authenticated admins can update bookings
CREATE POLICY "Only admins can update bookings"
  ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.%'
    )
  );

-- Policy: Only authenticated admins can delete bookings
CREATE POLICY "Only admins can delete bookings"
  ON bookings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.%'
    )
  );
