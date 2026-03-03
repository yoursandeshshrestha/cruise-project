-- =============================================================================
-- Audit Logs Table
-- =============================================================================
-- Tracks admin actions for security and compliance
-- Created: 2026-02-26
-- =============================================================================

-- TABLE DEFINITION
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ROW LEVEL SECURITY
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users only (admins view audit trail)
CREATE POLICY "audit_logs_select_authenticated"
  ON audit_logs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audit_logs_insert_authenticated"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "audit_logs_update_authenticated"
  ON audit_logs FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "audit_logs_delete_authenticated"
  ON audit_logs FOR DELETE TO authenticated
  USING (true);

-- COMMENTS
COMMENT ON TABLE audit_logs IS 'Audit trail for admin actions - RLS: authenticated only';
COMMENT ON COLUMN audit_logs.old_values IS 'JSONB snapshot of record before change';
COMMENT ON COLUMN audit_logs.new_values IS 'JSONB snapshot of record after change';
