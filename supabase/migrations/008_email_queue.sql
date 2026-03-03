-- =============================================================================
-- EMAIL_QUEUE TABLE
-- =============================================================================
-- Email delivery queue with retry capability
-- =============================================================================

CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email VARCHAR(255) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_variables JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  mailgun_message_id VARCHAR(255),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_queue_status ON email_queue(status);

-- Comments
COMMENT ON TABLE email_queue IS 'Email delivery queue with retry capability';
COMMENT ON COLUMN email_queue.template_variables IS 'JSONB data for email template rendering';
COMMENT ON COLUMN email_queue.status IS 'Delivery status: pending (queued), sent (delivered), failed (undeliverable)';
