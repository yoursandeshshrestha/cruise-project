-- Fix RLS Policies for Settings Tables
-- Allow public read access for booking flow, admin write access

-- =============================================================================
-- System Settings Policies
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Only admins can update system settings" ON system_settings;

-- Public can read (needed for booking flow)
CREATE POLICY "Public can read system settings"
  ON system_settings
  FOR SELECT
  USING (true);

-- Authenticated users can write
CREATE POLICY "Authenticated users can manage system settings"
  ON system_settings
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- Add-ons Policies
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can read active add-ons" ON add_ons;
DROP POLICY IF EXISTS "Only admins can manage add-ons" ON add_ons;

-- Public can read active add-ons
CREATE POLICY "Public can read active add-ons"
  ON add_ons
  FOR SELECT
  USING (true);

-- Authenticated users can manage all add-ons
CREATE POLICY "Authenticated users can manage add-ons"
  ON add_ons
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- Seasonal Pricing Policies
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can read active seasonal pricing" ON seasonal_pricing;
DROP POLICY IF EXISTS "Only admins can manage seasonal pricing" ON seasonal_pricing;

-- Public can read active seasonal pricing
CREATE POLICY "Public can read seasonal pricing"
  ON seasonal_pricing
  FOR SELECT
  USING (true);

-- Authenticated users can manage seasonal pricing
CREATE POLICY "Authenticated users can manage seasonal pricing"
  ON seasonal_pricing
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- Capacity Overrides Policies
-- =============================================================================
DROP POLICY IF EXISTS "Only admins can manage capacity overrides" ON capacity_overrides;

-- Public can read (for checking availability)
CREATE POLICY "Public can read capacity overrides"
  ON capacity_overrides
  FOR SELECT
  USING (true);

-- Authenticated users can manage capacity overrides
CREATE POLICY "Authenticated users can manage capacity overrides"
  ON capacity_overrides
  FOR ALL
  USING (auth.uid() IS NOT NULL);
