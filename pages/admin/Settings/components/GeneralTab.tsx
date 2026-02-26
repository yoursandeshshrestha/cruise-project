import React from 'react';
import { Car, Clock } from 'lucide-react';
import { Input } from '../../../../components/admin/ui/input';
import { TimePicker } from '../../../../components/admin/ui/time-picker';
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

      {/* Operating Hours Section */}
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
  );
};
