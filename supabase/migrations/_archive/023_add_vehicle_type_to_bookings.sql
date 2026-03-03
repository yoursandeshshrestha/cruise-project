-- =============================================================================
-- Add vehicle_type column to bookings table
-- =============================================================================
-- Adds support for car/van selection with 40% surcharge for vans
-- Created: 2026-02-27
-- =============================================================================

-- Add vehicle_type column with default value 'car' for existing records
ALTER TABLE bookings
ADD COLUMN vehicle_type VARCHAR(10) NOT NULL DEFAULT 'car'
CHECK (vehicle_type IN ('car', 'van'));

-- Add index for faster filtering by vehicle type
CREATE INDEX idx_bookings_vehicle_type ON bookings(vehicle_type);

-- Add comment
COMMENT ON COLUMN bookings.vehicle_type IS 'Vehicle type: car or van (van has 40% surcharge)';
