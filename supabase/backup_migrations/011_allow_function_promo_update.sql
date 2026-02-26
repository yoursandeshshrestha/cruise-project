-- Allow promo code usage increment from public function
-- Add a specific policy that allows updating current_uses field

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can read active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can insert promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can update promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can delete promo codes" ON promo_codes;

-- Public can read active promo codes (for validation)
CREATE POLICY "Public can read active promo codes"
  ON promo_codes
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can insert promo codes
CREATE POLICY "Authenticated users can insert promo codes"
  ON promo_codes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update promo codes (admin operations)
CREATE POLICY "Authenticated users can update promo codes"
  ON promo_codes
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Allow public updates for incrementing usage counter (called by SECURITY DEFINER function)
CREATE POLICY "Allow usage counter increment"
  ON promo_codes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete promo codes
CREATE POLICY "Authenticated users can delete promo codes"
  ON promo_codes
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
