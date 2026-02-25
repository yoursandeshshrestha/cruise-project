-- Add vehicle_type column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(10) DEFAULT 'car';
