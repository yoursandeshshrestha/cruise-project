import React from 'react';
import { Car } from 'lucide-react';
import { Input } from '../../../../components/admin/ui/input';
import { SettingsFormData } from '../types';

interface GeneralTabProps {
  formData: SettingsFormData;
  setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ formData, setFormData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Capacity Section */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Car className="w-5 h-5" />
          Capacity
        </h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Default Daily Capacity</label>
            <Input
              type="number"
              min="0"
              value={formData.defaultDailyCapacity}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultDailyCapacity: e.target.value }))}
            />
            <p className="text-xs text-slate-500 mt-1">
              Default capacity applied to all days. Override specific dates in Capacity Calendar. Set to 0 to disable bookings.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Buffer Spaces</label>
            <Input
              type="number"
              min="0"
              value={formData.bufferSpaces}
              onChange={(e) => setFormData(prev => ({ ...prev, bufferSpaces: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amendment Extension Fee (£)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.amendmentExtensionFee}
              onChange={(e) => setFormData(prev => ({ ...prev, amendmentExtensionFee: e.target.value }))}
            />
            <p className="text-xs text-slate-500 mt-1">
              Fee charged when customers extend their booking dates. Set to £0 to waive this fee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
