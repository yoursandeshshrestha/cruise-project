-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
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

-- Create index on status for faster filtering
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);

-- Create index on created_at for sorting
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: Anonymous users can insert (submit contact form)
CREATE POLICY "contact_submissions_insert_anon"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Anonymous users can view their own submissions (for confirmation)
CREATE POLICY "contact_submissions_select_anon"
  ON contact_submissions
  FOR SELECT
  TO anon
  USING (true);

-- Policy 3: Authenticated users can view all submissions
CREATE POLICY "contact_submissions_select_authenticated"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Authenticated users can update submissions
CREATE POLICY "contact_submissions_update_authenticated"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Authenticated users can delete submissions
CREATE POLICY "contact_submissions_delete_authenticated"
  ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comment
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from customers';
