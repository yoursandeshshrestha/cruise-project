import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';
import { useAdminSidebar } from '../../../contexts/AdminSidebarContext';
import { Spinner } from '../../../components/admin/ui/spinner';

// Components
import { SettingsTabs } from './components/SettingsTabs';
import { GeneralTab } from './components/GeneralTab';
import { BusinessTab } from './components/BusinessTab';
import { FeaturesTab } from './components/FeaturesTab';
import { SaveFooter } from './components/SaveFooter';

// Hooks
import { useSettingsForm } from './hooks/useSettingsForm';
import { useSettingsSave } from './hooks/useSettingsSave';

// Types
import { SettingsTab } from './types';

const SettingsContent: React.FC = () => {
  const { isCollapsed } = useAdminSidebar();

  const {
    settingsGroups,
    error,
    initialized,
    fetchSettings,
    updateGroup,
    getSetting,
  } = useSystemSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Custom hooks
  const {
    formData,
    setFormData,
    setOriginalFormData,
    hasChanges,
    changeCount,
  } = useSettingsForm({
    initialized,
    settingsGroups,
    getSetting,
  });

  const {
    isSaving,
    handleSave,
  } = useSettingsSave({
    updateGroup,
  });

  // Fetch settings on mount
  useEffect(() => {
    if (!initialized) {
      fetchSettings();
    }
  }, [initialized, fetchSettings]);

  // Handle save with success callback
  const onSave = () => {
    handleSave(activeTab, formData, () => {
      setOriginalFormData(formData);
    });
  };

  // Loading state
  if (!initialized) {
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

          {/* Tabs Navigation */}
          <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          {activeTab === 'general' && (
            <GeneralTab formData={formData} setFormData={setFormData} />
          )}

          {activeTab === 'business' && (
            <BusinessTab formData={formData} setFormData={setFormData} />
          )}

          {activeTab === 'features' && (
            <FeaturesTab formData={formData} setFormData={setFormData} />
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <SaveFooter
        hasChanges={hasChanges}
        changeCount={changeCount}
        isSaving={isSaving}
        onSave={onSave}
        isCollapsed={isCollapsed}
      />
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
