-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================
-- All RLS policies and permissions for database tables and functions
-- =============================================================================

-- Schema & Sequence Permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Function Permissions
GRANT EXECUTE ON FUNCTION delete_current_user() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_promo_code(VARCHAR(50), INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_promo_code_usage(VARCHAR(50)) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_setting(VARCHAR, VARCHAR) TO anon, authenticated;

-- =============================================================================
-- CAPACITY_CONFIG RLS
-- =============================================================================
ALTER TABLE capacity_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "capacity_config_select_authenticated" ON capacity_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "capacity_config_insert_authenticated" ON capacity_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "capacity_config_update_authenticated" ON capacity_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "capacity_config_delete_authenticated" ON capacity_config FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- PRICING_RULES RLS
-- =============================================================================
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_rules_select_anon" ON pricing_rules FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "pricing_rules_select_authenticated" ON pricing_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "pricing_rules_insert_authenticated" ON pricing_rules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pricing_rules_update_authenticated" ON pricing_rules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pricing_rules_delete_authenticated" ON pricing_rules FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- ADD_ONS RLS
-- =============================================================================
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "add_ons_select_anon" ON add_ons FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "add_ons_select_authenticated" ON add_ons FOR SELECT TO authenticated USING (true);
CREATE POLICY "add_ons_insert_authenticated" ON add_ons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "add_ons_update_authenticated" ON add_ons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "add_ons_delete_authenticated" ON add_ons FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- ADMIN_USERS RLS
-- =============================================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select_authenticated" ON admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_users_insert_authenticated" ON admin_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_users_update_authenticated" ON admin_users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_users_delete_authenticated" ON admin_users FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- AUDIT_LOGS RLS
-- =============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_authenticated" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "audit_logs_update_authenticated" ON audit_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "audit_logs_delete_authenticated" ON audit_logs FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- EMAIL_QUEUE RLS
-- =============================================================================
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_queue_select_authenticated" ON email_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "email_queue_insert_authenticated" ON email_queue FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "email_queue_update_authenticated" ON email_queue FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "email_queue_delete_authenticated" ON email_queue FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- BOOKINGS RLS
-- =============================================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE bookings TO anon;
GRANT ALL ON TABLE bookings TO authenticated;
GRANT ALL ON TABLE bookings TO service_role;

CREATE POLICY "bookings_anon_insert_policy" ON bookings AS PERMISSIVE FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "bookings_anon_select_policy" ON bookings AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY "bookings_auth_all_policy" ON bookings AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bookings_service_all_policy" ON bookings AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- TERMINALS RLS
-- =============================================================================
ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "terminals_select_anon" ON terminals FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "terminals_select_authenticated" ON terminals FOR SELECT TO authenticated USING (true);
CREATE POLICY "terminals_insert_authenticated" ON terminals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "terminals_update_authenticated" ON terminals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "terminals_delete_authenticated" ON terminals FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- CRUISE_LINES RLS
-- =============================================================================
ALTER TABLE cruise_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cruise_lines_select_anon" ON cruise_lines FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "cruise_lines_select_authenticated" ON cruise_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "cruise_lines_insert_authenticated" ON cruise_lines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cruise_lines_update_authenticated" ON cruise_lines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cruise_lines_delete_authenticated" ON cruise_lines FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- PROMO_CODES RLS
-- =============================================================================
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promo_codes_select_anon" ON promo_codes FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "promo_codes_select_authenticated" ON promo_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "promo_codes_insert_authenticated" ON promo_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "promo_codes_update_authenticated" ON promo_codes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "promo_codes_delete_authenticated" ON promo_codes FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- SYSTEM_SETTINGS RLS
-- =============================================================================
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings_select_anon" ON system_settings FOR SELECT TO anon USING (true);
CREATE POLICY "system_settings_select_authenticated" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "system_settings_insert_authenticated" ON system_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "system_settings_update_authenticated" ON system_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "system_settings_delete_authenticated" ON system_settings FOR DELETE TO authenticated USING (true);

-- =============================================================================
-- CONTACT_SUBMISSIONS RLS
-- =============================================================================
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE contact_submissions TO anon;
GRANT ALL ON TABLE contact_submissions TO authenticated;

CREATE POLICY "contact_submissions_insert_anon" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "contact_submissions_select_anon" ON contact_submissions FOR SELECT TO anon USING (true);
CREATE POLICY "contact_submissions_all_authenticated" ON contact_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- DAILY_CAPACITIES RLS
-- =============================================================================
ALTER TABLE daily_capacities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_capacities_select_authenticated" ON daily_capacities FOR SELECT TO authenticated USING (true);
CREATE POLICY "daily_capacities_all_authenticated" ON daily_capacities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- PAYMENTS RLS
-- =============================================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_service_all" ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "payments_select_authenticated" ON payments FOR SELECT TO authenticated USING (true);
