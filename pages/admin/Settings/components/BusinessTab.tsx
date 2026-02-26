import React from 'react';
import { Building2 } from 'lucide-react';
import { Input } from '../../../../components/admin/ui/input';
import { SettingsFormData } from '../types';

interface BusinessTabProps {
  formData: SettingsFormData;
  setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({ formData, setFormData }) => {
  return (
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
  );
};
