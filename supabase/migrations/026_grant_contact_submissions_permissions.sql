-- Grant table-level permissions for contact_submissions
-- This is needed in addition to RLS policies

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT ON contact_submissions TO anon;
GRANT ALL ON contact_submissions TO authenticated;
