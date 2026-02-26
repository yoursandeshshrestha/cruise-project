-- Clean up promo_codes RLS policies
-- Remove conflicting policies and create clean ones matching bookings pattern

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Public can read active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can insert promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can update promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Allow usage counter increment" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can delete promo codes" ON promo_codes;

-- Recreate policies cleanly, following exact bookings table pattern

-- SELECT: Public can read active promo codes (for validation during booking)
CREATE POLICY "Anyone can read active promo codes"
  ON promo_codes
  FOR SELECT
  USING (is_active = true);

-- INSERT: Authenticated users can create promo codes
CREATE POLICY "Authenticated users can insert promo codes"
  ON promo_codes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update promo codes (matches bookings pattern - only USING clause)
CREATE POLICY "Authenticated users can update promo codes"
  ON promo_codes
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- DELETE: Authenticated users can delete promo codes
CREATE POLICY "Authenticated users can delete promo codes"
  ON promo_codes
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
