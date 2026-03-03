-- =============================================================================
-- Enums
-- =============================================================================
-- All enum types used across the database
-- Created: 2026-02-26
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

COMMENT ON TYPE booking_status IS 'Status values for parking bookings lifecycle';
COMMENT ON TYPE admin_role IS 'Admin user permission levels';
COMMENT ON TYPE discount_type IS 'Promo code discount calculation methods';
