-- =============================================================================
-- ADMIN_USERS TABLE
-- =============================================================================
-- Admin user accounts synced with Supabase Auth
-- =============================================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role admin_role DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Triggers
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE admin_users IS 'Admin user accounts synced with Supabase Auth';
COMMENT ON COLUMN admin_users.role IS 'Permission level: admin (full access), manager (most features), staff (limited)';
