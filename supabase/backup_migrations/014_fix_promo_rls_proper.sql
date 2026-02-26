-- Fix Promo Codes RLS - Follow cruise_lines pattern exactly
-- Use role-based policies with TO authenticated and USING (true) WITH CHECK (true)

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Public can read active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can insert promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can update promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Allow usage counter increment" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can delete promo codes" ON promo_codes;

-- Policy 1: Allow anonymous users to view active promo codes (for validation during booking)
CREATE POLICY "promo_codes_select_anon"
  ON promo_codes
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy 2: Allow authenticated users to view all promo codes
CREATE POLICY "promo_codes_select_authenticated"
  ON promo_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Allow authenticated users to insert promo codes
CREATE POLICY "promo_codes_insert_authenticated"
  ON promo_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to update promo codes
-- IMPORTANT: UPDATE requires both USING (for selection) and WITH CHECK (for the new values)
CREATE POLICY "promo_codes_update_authenticated"
  ON promo_codes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Allow authenticated users to delete promo codes
CREATE POLICY "promo_codes_delete_authenticated"
  ON promo_codes
  FOR DELETE
  TO authenticated
  USING (true);
