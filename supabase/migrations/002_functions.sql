-- =============================================================================
-- Shared Utility Functions
-- =============================================================================
-- Common functions used across multiple tables
-- Created: 2026-02-26
-- =============================================================================

-- Generate unique booking reference (SCP-XXXX format)
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

COMMENT ON FUNCTION generate_booking_reference() IS 'Generates unique booking reference in SCP-XXXX format';

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Trigger function to automatically update updated_at timestamp on row updates';
