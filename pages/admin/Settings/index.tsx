import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';
import { useAdminSidebar } from '../../../contexts/AdminSidebarContext';
import { Button } from '../../../components/admin/ui/button';
import { Input } from '../../../components/admin/ui/input';
import { Spinner } from '../../../components/admin/ui/spinner';
import { Switch } from '../../../components/admin/ui/switch';
import { TimePicker } from '../../../components/admin/ui/time-picker';
import { Building2, Car, Clock, Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

const SettingsContent: React.FC = () => {
  const { isCollapsed } = useAdminSidebar();

  const {
    settingsGroups,
    loading,
    error,
    initialized,
    fetchSettings,
    updateGroup,
    getSetting,
  } = useSystemSettingsStore();

  const [activeTab, setActiveTab] = useState<'general' | 'business' | 'features'>('general');
  const [formData, setFormData] = useState({
    defaultDailyCapacity: '',
    bufferSpaces: '',
    operatingHoursOpen: '',
    operatingHoursClose: '',
    bookingCutoffHours: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    bookingEnabled: true,
    maintenanceMode: false,
    promoCodesEnabled: true,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    showCancellationPolicy: true,
    cancellationPolicyText: '',
  });
  const [originalFormData, setOriginalFormData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchSettings();
    }
  }, [initialized, fetchSettings]);

  useEffect(() => {
    if (initialized && settingsGroups.length > 0) {
      const data = {
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
    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      if (formData[key] !== originalFormData[key]) {
        changes++;
      }
    });
    return changes;
  };

  const changeCount = countChanges();
  const hasChanges = changeCount > 0;

  const handleSave = async () => {
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
      // Update original data after successful save
      setOriginalFormData(formData);
    } catch (error) {
      console.error('[Settings] Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-24">
        <h1 className="text-2xl font-semibold mb-6">Platform Configuration</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-3 px-1 cursor-pointer ${
                activeTab === 'general'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`pb-3 px-1 cursor-pointer ${
                activeTab === 'business'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              Business Info
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-3 px-1 cursor-pointer ${
                activeTab === 'features'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              Features
            </button>
          </div>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Car className="w-5 h-5" />
                Capacity
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Daily Capacity</label>
                  <Input
                    type="number"
                    value={formData.defaultDailyCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultDailyCapacity: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Buffer Spaces</label>
                  <Input
                    type="number"
                    value={formData.bufferSpaces}
                    onChange={(e) => setFormData(prev => ({ ...prev, bufferSpaces: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Operating Hours
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Opening Time</label>
                  <TimePicker
                    value={formData.operatingHoursOpen}
                    onChange={(value) => setFormData(prev => ({ ...prev, operatingHoursOpen: value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Closing Time</label>
                  <TimePicker
                    value={formData.operatingHoursClose}
                    onChange={(value) => setFormData(prev => ({ ...prev, operatingHoursClose: value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Booking Cutoff (hours)</label>
                  <Input
                    type="number"
                    value={formData.bookingCutoffHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, bookingCutoffHours: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === 'business' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyEmail: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={formData.companyPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyPhone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={formData.companyAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Feature Flags
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">Booking Enabled</div>
                  <div className="text-sm text-muted-foreground">Accept new bookings</div>
                </div>
                <Switch
                  checked={formData.bookingEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bookingEnabled: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">Maintenance Mode</div>
                  <div className="text-sm text-muted-foreground">Show maintenance page</div>
                </div>
                <Switch
                  checked={formData.maintenanceMode}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">Promo Codes</div>
                  <div className="text-sm text-muted-foreground">Allow promo codes</div>
                </div>
                <Switch
                  checked={formData.promoCodesEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, promoCodesEnabled: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Send email confirmations</div>
                </div>
                <Switch
                  checked={formData.emailNotificationsEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotificationsEnabled: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">SMS Notifications</div>
                  <div className="text-sm text-muted-foreground">Send SMS notifications</div>
                </div>
                <Switch
                  checked={formData.smsNotificationsEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotificationsEnabled: checked }))}
                />
              </div>
              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">Cancellation Policy</div>
                    <div className="text-sm text-muted-foreground">Show cancellation policy in booking summary</div>
                  </div>
                  <Switch
                    checked={formData.showCancellationPolicy}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showCancellationPolicy: checked }))}
                  />
                </div>
                {formData.showCancellationPolicy && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Policy Text</label>
                    <Input
                      value={formData.cancellationPolicyText}
                      onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicyText: e.target.value }))}
                      placeholder="Free cancellation up to 48 hours before arrival."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        </div>
      </div>

      {/* Fixed Footer */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10 ${
        isCollapsed ? 'lg:left-16' : 'lg:left-64'
      }`}>
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm">
            {hasChanges ? (
              <span className="text-orange-600 font-medium">
                {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'} - Click save to apply
              </span>
            ) : (
              <span className="text-muted-foreground">All changes saved</span>
            )}
          </div>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="cursor-pointer">
            {isSaving ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Settings: React.FC = () => {
  const breadcrumbs = [
    { label: 'Configuration' },
    { label: 'Platform Settings' }
  ];

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
      <SettingsContent />
    </AdminLayout>
  );
};
