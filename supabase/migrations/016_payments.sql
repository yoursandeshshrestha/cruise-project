-- =============================================================================
-- PAYMENTS TABLE
-- =============================================================================
-- Tracks all payment transactions including new bookings and amendments
-- =============================================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Payment type
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('new_booking', 'amendment')),

  -- Stripe details
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),

  -- Amount details (in pence)
  amount INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  vat INTEGER NOT NULL,

  -- Payment status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  refund_processed_at TIMESTAMPTZ,

  -- Refund details
  refund_amount INTEGER,
  refund_reason TEXT,

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT payments_booking_id_idx UNIQUE (booking_id, created_at)
);

-- Indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_stripe_checkout_session_id ON payments(stripe_checkout_session_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Comments
COMMENT ON TABLE payments IS 'Tracks all payment transactions including new bookings and amendments';
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: new_booking or amendment';
COMMENT ON COLUMN payments.amount IS 'Total amount paid in pence (including VAT)';
COMMENT ON COLUMN payments.subtotal IS 'Subtotal in pence (excluding VAT)';
COMMENT ON COLUMN payments.vat IS 'VAT amount in pence';
