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
   
    setIsSaving(true);

    try {
      if (activeTab === 'general') {
        // Validate amendment extension fee
        const amendmentFee = parseFloat(formData.amendmentExtensionFee);
        if (amendmentFee < 0 || isNaN(amendmentFee)) {
          toast.error('Amendment Extension Fee must be £0 or greater');
          setIsSaving(false);
          return;
        }

        const capacityData = {
          default_daily_capacity: parseInt(formData.defaultDailyCapacity),
          buffer_spaces: parseInt(formData.bufferSpaces),
          amendment_extension_fee: amendmentFee,
        };

        await updateGroup('capacity', capacityData);

        toast.success('General settings saved');
      } else if (activeTab === 'business') {
        const businessData = {
          company_name: formData.companyName,
          company_email: formData.companyEmail,
          company_phone: formData.companyPhone,
          company_address: formData.companyAddress,
        };
        await updateGroup('business', businessData);
        toast.success('Business info saved');
      } else {
        const featuresData = {
          booking_enabled: formData.bookingEnabled,
          maintenance_mode: formData.maintenanceMode,
          promo_codes_enabled: formData.promoCodesEnabled,
          show_cancellation_policy: formData.showCancellationPolicy,
          cancellation_policy_text: formData.cancellationPolicyText,
          minimum_days_required: formData.minimumDaysRequired,
        };
        await updateGroup('features', featuresData);

        const notificationsData = {
          email_notifications_enabled: formData.emailNotificationsEnabled,
          sms_notifications_enabled: formData.smsNotificationsEnabled,
        };
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
