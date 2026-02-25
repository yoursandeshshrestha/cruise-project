-- Fix Promo Codes UPDATE Policy
-- The UPDATE policy needs both USING and WITH CHECK clauses

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update promo codes" ON promo_codes;

-- Recreate UPDATE policy with both USING and WITH CHECK
CREATE POLICY "Authenticated users can update promo codes"
  ON promo_codes
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
