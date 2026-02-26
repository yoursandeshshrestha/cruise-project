import React from 'react';
import { SettingsTab } from '../types';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex gap-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-1 cursor-pointer ${
            activeTab === 'general'
              ? 'text-primary font-medium border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`pb-3 px-1 cursor-pointer ${
            activeTab === 'business'
              ? 'text-primary font-medium border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          Business Info
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`pb-3 px-1 cursor-pointer ${
            activeTab === 'features'
              ? 'text-primary font-medium border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          Features
        </button>
      </div>
    </div>
  );
};
