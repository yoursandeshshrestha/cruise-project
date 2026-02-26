import { useState } from 'react';
import { toast } from 'sonner';
import { SettingsFormData, SettingsTab } from '../types';

interface UseSettingsSaveProps {
  updateGroup: (group: string, data: Record<string, unknown>) => Promise<void>;
}

export const useSettingsSave = ({ updateGroup }: UseSettingsSaveProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (
    activeTab: SettingsTab,
    formData: SettingsFormData,
    onSuccess: () => void
  ) => {
    console.log('[Settings] Save clicked, activeTab:', activeTab);
    console.log('[Settings] Current formData:', formData);
    setIsSaving(true);

    try {
      if (activeTab === 'general') {
        const capacityData = {
          default_daily_capacity: parseInt(formData.defaultDailyCapacity),
          buffer_spaces: parseInt(formData.bufferSpaces),
        };
        console.log('[Settings] Saving capacity:', capacityData);
        await updateGroup('capacity', capacityData);

        const operationalData = {
          operating_hours_open: formData.operatingHoursOpen,
          operating_hours_close: formData.operatingHoursClose,
          booking_cutoff_hours: parseInt(formData.bookingCutoffHours),
        };
        console.log('[Settings] Saving operational:', operationalData);
        await updateGroup('operational', operationalData);

        toast.success('General settings saved');
      } else if (activeTab === 'business') {
        const businessData = {
          company_name: formData.companyName,
          company_email: formData.companyEmail,
          company_phone: formData.companyPhone,
          company_address: formData.companyAddress,
        };
        console.log('[Settings] Saving business:', businessData);
        await updateGroup('business', businessData);
        toast.success('Business info saved');
      } else {
        const featuresData = {
          booking_enabled: formData.bookingEnabled,
          maintenance_mode: formData.maintenanceMode,
          promo_codes_enabled: formData.promoCodesEnabled,
          show_cancellation_policy: formData.showCancellationPolicy,
          cancellation_policy_text: formData.cancellationPolicyText,
        };
        console.log('[Settings] Saving features:', featuresData);
        await updateGroup('features', featuresData);

        const notificationsData = {
          email_notifications_enabled: formData.emailNotificationsEnabled,
          sms_notifications_enabled: formData.smsNotificationsEnabled,
        };
        console.log('[Settings] Saving notifications:', notificationsData);
        await updateGroup('notifications', notificationsData);
        toast.success('Features saved');
      }

      onSuccess();
    } catch (error) {
      console.error('[Settings] Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave,
  };
};
