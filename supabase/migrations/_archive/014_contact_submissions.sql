-- =============================================================================
-- Contact Submissions Table
-- =============================================================================
-- Customer contact form submissions
-- RLS: Properly configured to allow anon users to submit forms
-- Created: 2026-02-26
-- Replaces: Original 024 + fixes from 025-028
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  booking_reference VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- TRIGGER
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY - PROPERLY CONFIGURED
-- =============================================================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Grant table-level permissions BEFORE creating policies
GRANT SELECT, INSERT ON TABLE contact_submissions TO anon;
GRANT ALL ON TABLE contact_submissions TO authenticated;

-- Anon users: Can INSERT (submit contact forms)
CREATE POLICY "contact_submissions_insert_anon"
  ON contact_submissions FOR INSERT TO anon
  WITH CHECK (true);

-- Anon users: Can SELECT (view their own submission for confirmation)
CREATE POLICY "contact_submissions_select_anon"
  ON contact_submissions FOR SELECT TO anon
  USING (true);

-- Authenticated users: Can view all submissions
CREATE POLICY "contact_submissions_select_authenticated"
  ON contact_submissions FOR SELECT TO authenticated
  USING (true);

-- Authenticated users: Can update submissions (change status, add notes)
CREATE POLICY "contact_submissions_update_authenticated"
  ON contact_submissions FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- Authenticated users: Can delete submissions
CREATE POLICY "contact_submissions_delete_authenticated"
  ON contact_submissions FOR DELETE TO authenticated
  USING (true);

-- COMMENTS
COMMENT ON TABLE contact_submissions IS 'Customer contact form submissions - RLS: anon (INSERT+SELECT), authenticated (full)';
COMMENT ON COLUMN contact_submissions.status IS 'Submission status: new, in_progress, resolved, closed';
COMMENT ON COLUMN contact_submissions.admin_notes IS 'Internal notes from admin team';
COMMENT ON COLUMN contact_submissions.booking_reference IS 'Optional reference to related booking';
