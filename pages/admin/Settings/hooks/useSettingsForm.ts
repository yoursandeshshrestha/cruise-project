import { useState, useEffect } from 'react';
import { SettingsFormData, defaultFormData } from '../types';

interface UseSettingsFormProps {
  initialized: boolean;
  settingsGroups: unknown[];
  getSetting: <T>(group: string, key: string, defaultValue: T) => T | undefined;
}

export const useSettingsForm = ({
  initialized,
  settingsGroups,
  getSetting,
}: UseSettingsFormProps) => {
  const [formData, setFormData] = useState<SettingsFormData>(defaultFormData);
  const [originalFormData, setOriginalFormData] = useState<SettingsFormData>(defaultFormData);

  // Load settings from store when initialized
  useEffect(() => {
    if (initialized && settingsGroups.length > 0) {
      const data: SettingsFormData = {
        defaultDailyCapacity: (getSetting<number>('capacity', 'default_daily_capacity', 100) || 0).toString(),
        bufferSpaces: (getSetting<number>('capacity', 'buffer_spaces', 10) || 0).toString(),
        operatingHoursOpen: getSetting<string>('operational', 'operating_hours_open', '06:00') || '06:00',
        operatingHoursClose: getSetting<string>('operational', 'operating_hours_close', '22:00') || '22:00',
        bookingCutoffHours: (getSetting<number>('operational', 'booking_cutoff_hours', 24) || 0).toString(),
        companyName: getSetting<string>('business', 'company_name', 'Simple Cruise Parking') || '',
        companyEmail: getSetting<string>('business', 'company_email', 'info@simplecruiseparking.com') || '',
        companyPhone: getSetting<string>('business', 'company_phone', '+44 (0) 23 8000 0000') || '',
        companyAddress: getSetting<string>('business', 'company_address', 'Southampton, UK') || '',
        bookingEnabled: getSetting<boolean>('features', 'booking_enabled', true) ?? true,
        maintenanceMode: getSetting<boolean>('features', 'maintenance_mode', false) ?? false,
        promoCodesEnabled: getSetting<boolean>('features', 'promo_codes_enabled', true) ?? true,
        emailNotificationsEnabled: getSetting<boolean>('notifications', 'email_notifications_enabled', true) ?? true,
        smsNotificationsEnabled: getSetting<boolean>('notifications', 'sms_notifications_enabled', false) ?? false,
        showCancellationPolicy: getSetting<boolean>('features', 'show_cancellation_policy', true) ?? true,
        cancellationPolicyText: getSetting<string>('features', 'cancellation_policy_text', 'Free cancellation up to 48 hours before arrival.') || '',
      };
      setFormData(data);
      setOriginalFormData(data);
    }
  }, [initialized, settingsGroups, getSetting]);

  // Count changes
  const countChanges = () => {
    let changes = 0;
    (Object.keys(formData) as Array<keyof SettingsFormData>).forEach((key) => {
      if (formData[key] !== originalFormData[key]) {
        changes++;
      }
    });
    return changes;
  };

  const changeCount = countChanges();
  const hasChanges = changeCount > 0;

  return {
    formData,
    setFormData,
    originalFormData,
    setOriginalFormData,
    hasChanges,
    changeCount,
  };
};
