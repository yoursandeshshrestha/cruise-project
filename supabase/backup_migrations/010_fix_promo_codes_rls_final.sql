-- Fix Promo Codes UPDATE Policy - Remove WITH CHECK clause
-- Follow the same pattern as bookings table (only USING clause)

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update promo codes" ON promo_codes;

-- Recreate UPDATE policy with only USING clause (no WITH CHECK)
CREATE POLICY "Authenticated users can update promo codes"
  ON promo_codes
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
