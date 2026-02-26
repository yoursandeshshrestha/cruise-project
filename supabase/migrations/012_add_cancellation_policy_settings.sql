-- Add cancellation policy settings to features group
-- This migration updates the existing features group to include cancellation policy settings

UPDATE system_settings
SET settings = settings || '{"show_cancellation_policy": true, "cancellation_policy_text": "Free cancellation up to 48 hours before arrival."}'::jsonb
WHERE group_name = 'features';

-- Add comment
COMMENT ON TABLE system_settings IS 'System settings table - Group-based JSONB storage for platform configuration. Features group now includes cancellation policy settings (show_cancellation_policy and cancellation_policy_text).';
