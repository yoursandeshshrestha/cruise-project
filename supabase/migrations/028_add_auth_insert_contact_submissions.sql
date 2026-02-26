-- Add missing INSERT policy for authenticated users on contact_submissions
-- The authenticated role had table-level GRANT ALL but no RLS INSERT policy

CREATE POLICY "contact_submissions_insert_authenticated"
  ON contact_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment
COMMENT ON POLICY "contact_submissions_insert_authenticated" ON contact_submissions IS 'Allows authenticated admin users to create contact submissions';
