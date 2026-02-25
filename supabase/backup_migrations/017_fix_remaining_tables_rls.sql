-- Fix RLS for remaining tables: customers, capacity_config, pricing_rules, add_ons, audit_logs
-- Follow the same pattern: TO authenticated/anon with USING/WITH CHECK true

-- =============================================================================
-- 1. FIX CUSTOMERS TABLE
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
DROP POLICY IF EXISTS "Users can view own customer record" ON customers;

-- Policy: Authenticated users can view all customers
CREATE POLICY "customers_select_authenticated"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create customers
CREATE POLICY "customers_insert_authenticated"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update customers
CREATE POLICY "customers_update_authenticated"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete customers
CREATE POLICY "customers_delete_authenticated"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- 2. FIX CAPACITY_CONFIG TABLE
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage capacity" ON capacity_config;

-- Policy: Authenticated users can view capacity config
CREATE POLICY "capacity_config_select_authenticated"
  ON capacity_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create capacity config
CREATE POLICY "capacity_config_insert_authenticated"
  ON capacity_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update capacity config
CREATE POLICY "capacity_config_update_authenticated"
  ON capacity_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete capacity config
CREATE POLICY "capacity_config_delete_authenticated"
  ON capacity_config
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- 3. FIX PRICING_RULES TABLE
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view pricing rules" ON pricing_rules;
DROP POLICY IF EXISTS "Admins can manage pricing rules" ON pricing_rules;

-- Policy: Anonymous users can view active pricing rules (for booking calculations)
CREATE POLICY "pricing_rules_select_anon"
  ON pricing_rules
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy: Authenticated users can view all pricing rules
CREATE POLICY "pricing_rules_select_authenticated"
  ON pricing_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create pricing rules
CREATE POLICY "pricing_rules_insert_authenticated"
  ON pricing_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update pricing rules
CREATE POLICY "pricing_rules_update_authenticated"
  ON pricing_rules
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete pricing rules
CREATE POLICY "pricing_rules_delete_authenticated"
  ON pricing_rules
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- 4. FIX ADD_ONS TABLE
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view add-ons" ON add_ons;
DROP POLICY IF EXISTS "Admins can manage add-ons" ON add_ons;

-- Policy: Anonymous users can view active add-ons (for booking selections)
CREATE POLICY "add_ons_select_anon"
  ON add_ons
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy: Authenticated users can view all add-ons
CREATE POLICY "add_ons_select_authenticated"
  ON add_ons
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create add-ons
CREATE POLICY "add_ons_insert_authenticated"
  ON add_ons
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update add-ons
CREATE POLICY "add_ons_update_authenticated"
  ON add_ons
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete add-ons
CREATE POLICY "add_ons_delete_authenticated"
  ON add_ons
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- 5. FIX AUDIT_LOGS TABLE
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;

-- Policy: Authenticated users can view audit logs
CREATE POLICY "audit_logs_select_authenticated"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create audit logs (system operations)
CREATE POLICY "audit_logs_insert_authenticated"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update audit logs (if needed)
CREATE POLICY "audit_logs_update_authenticated"
  ON audit_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete audit logs
CREATE POLICY "audit_logs_delete_authenticated"
  ON audit_logs
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- ADD COMMENTS
-- =============================================================================

COMMENT ON TABLE customers IS 'Customers table - RLS enabled with authenticated role policies';
COMMENT ON TABLE capacity_config IS 'Capacity configuration table - RLS enabled with authenticated role policies';
COMMENT ON TABLE pricing_rules IS 'Pricing rules table - RLS enabled with anon (active only) and authenticated policies';
COMMENT ON TABLE add_ons IS 'Add-ons table - RLS enabled with anon (active only) and authenticated policies';
COMMENT ON TABLE audit_logs IS 'Audit logs table - RLS enabled with authenticated role policies';
