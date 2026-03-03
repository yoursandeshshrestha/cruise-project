-- =============================================================================
-- SEED DATA
-- =============================================================================
-- Initial data for all tables
-- =============================================================================

-- capacity_config seed (365 days with 100 capacity)
INSERT INTO capacity_config (date, max_capacity)
SELECT CURRENT_DATE + i, 100
FROM generate_series(0, 365) AS i;

-- pricing_rules seed (Standard Pricing with flat daily rate of £15/day and 0% VAT)
-- Vans: Final price = standard total × van_multiplier (rounded to nearest pound)
INSERT INTO pricing_rules (
  name, price_per_day, van_multiplier, vat_rate, is_active, display_order, priority
) VALUES (
  'Standard Pricing', 15.00, 1.5, 0.00, true, 0, 2
);

-- add_ons seed
INSERT INTO add_ons (slug, name, description, icon, price, display_order) VALUES
  ('ev-charging', 'EV Charging', 'Full charge while you cruise', 'Zap', 3500, 1),
  ('exterior-wash', 'Exterior Wash', 'Professional exterior cleaning', 'Droplets', 1500, 2),
  ('full-valet', 'Full Valet', 'Complete interior and exterior valet', 'Sparkles', 4500, 3);

-- admin_users seed
INSERT INTO admin_users (email, role, is_active)
VALUES ('admin@simplecruiseparking.com', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- terminals seed
INSERT INTO terminals (name, code, location, description, is_active, display_order) VALUES
  ('Ocean Terminal', 'OCN', 'Southampton', 'Modern cruise terminal with excellent facilities and easy access to the city center. Ideal for large cruise ships.', true, 1),
  ('Mayflower Terminal', 'MF', 'Southampton', 'Historic terminal named after the famous Mayflower ship. Features convenient parking and passenger amenities.', true, 2),
  ('City Cruise Terminal', 'CC', 'Southampton', 'Located in the heart of Southampton, offering quick access to local attractions and transport links.', true, 3),
  ('QEII Terminal', 'QEII', 'Southampton', 'Named after the Queen Elizabeth II. Premium terminal with luxury facilities for international cruise departures.', true, 4),
  ('Horizon Cruise Terminal', 'HOR', 'Southampton', 'State-of-the-art terminal designed for modern cruise operations with comprehensive passenger services.', true, 5);

-- cruise_lines seed
INSERT INTO cruise_lines (name, ships, is_active, display_order) VALUES
  ('P&O Cruises', '["Iona", "Arvia", "Britannia", "Ventura", "Arcadia", "Aurora"]'::jsonb, true, 1),
  ('Cunard', '["Queen Mary 2", "Queen Victoria", "Queen Anne"]'::jsonb, true, 2),
  ('Royal Caribbean', '["Anthem of the Seas", "Independence of the Seas"]'::jsonb, true, 3),
  ('MSC Cruises', '["MSC Virtuosa", "MSC Preziosa"]'::jsonb, true, 4),
  ('Princess Cruises', '["Sky Princess", "Regal Princess"]'::jsonb, true, 5),
  ('Celebrity Cruises', '["Celebrity Apex", "Celebrity Silhouette"]'::jsonb, true, 6);

-- promo_codes seed
INSERT INTO promo_codes (code, description, discount_type, discount_value, valid_from, valid_until, is_active)
VALUES ('FIRST10', 'First booking 10% discount', 'percentage', 10, NOW(), NOW() + INTERVAL '1 year', true);

-- system_settings seed
INSERT INTO system_settings (group_name, settings) VALUES
  ('business', '{"company_name": "Simple Cruise Parking", "company_email": "info@simplecruiseparking.com", "company_phone": "+44 (0) 23 8000 0000", "company_address": "Southampton, UK"}'::jsonb),
  ('capacity', '{"default_daily_capacity": 100, "buffer_spaces": 10}'::jsonb),
  ('operational', '{"operating_hours_open": "06:00", "operating_hours_close": "22:00", "booking_cutoff_hours": 24}'::jsonb),
  ('features', '{"booking_enabled": true, "maintenance_mode": false, "promo_codes_enabled": true, "show_cancellation_policy": true, "cancellation_policy_text": "Free cancellation up to 48 hours before arrival."}'::jsonb),
  ('notifications', '{"email_notifications_enabled": true, "sms_notifications_enabled": false}'::jsonb);
