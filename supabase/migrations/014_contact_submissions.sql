-- =============================================================================
-- CONTACT_SUBMISSIONS TABLE
-- =============================================================================
-- Customer contact form submissions
-- =============================================================================

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

-- Indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Triggers
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE contact_submissions IS 'Customer contact form submissions';
COMMENT ON COLUMN contact_submissions.status IS 'Submission status: new, in_progress, resolved, closed';
COMMENT ON COLUMN contact_submissions.admin_notes IS 'Internal notes from admin team';
COMMENT ON COLUMN contact_submissions.booking_reference IS 'Optional reference to related booking';
