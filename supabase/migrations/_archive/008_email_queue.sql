-- =============================================================================
-- Email Queue Table
-- =============================================================================
-- Reliable email delivery queue with retry logic
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email VARCHAR(255) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_variables JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  mailgun_message_id VARCHAR(255),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_email_queue_status ON email_queue(status);

-- ROW LEVEL SECURITY
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Authenticated users only (admin email management)
CREATE POLICY "email_queue_select_authenticated"
  ON email_queue FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "email_queue_insert_authenticated"
  ON email_queue FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "email_queue_update_authenticated"
  ON email_queue FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "email_queue_delete_authenticated"
  ON email_queue FOR DELETE TO authenticated
  USING (true);

-- COMMENTS
COMMENT ON TABLE email_queue IS 'Email delivery queue with retry capability - RLS: authenticated only';
COMMENT ON COLUMN email_queue.template_variables IS 'JSONB data for email template rendering';
COMMENT ON COLUMN email_queue.status IS 'Delivery status: pending (queued), sent (delivered), failed (undeliverable)';
