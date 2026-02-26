import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Input } from '../../../../components/admin/ui/input';
import { Switch } from '../../../../components/admin/ui/switch';
import { SettingsFormData } from '../types';

interface FeaturesTabProps {
  formData: SettingsFormData;
  setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ formData, setFormData }) => {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <SettingsIcon className="w-5 h-5" />
        Feature Flags
      </h2>
      <div className="space-y-4">
        {/* Booking Enabled */}
        <div className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-medium">Booking Enabled</div>
            <div className="text-sm text-muted-foreground">Accept new bookings</div>
          </div>
          <Switch
            checked={formData.bookingEnabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bookingEnabled: checked }))}
            className="cursor-pointer"
          />
        </div>

        {/* Maintenance Mode */}
        <div className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-medium">Maintenance Mode</div>
            <div className="text-sm text-muted-foreground">Show maintenance page</div>
          </div>
          <Switch
            checked={formData.maintenanceMode}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, maintenanceMode: checked }))}
            className="cursor-pointer"
          />
        </div>

        {/* Promo Codes */}
        <div className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-medium">Promo Codes</div>
            <div className="text-sm text-muted-foreground">Allow promo codes</div>
          </div>
          <Switch
            checked={formData.promoCodesEnabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, promoCodesEnabled: checked }))}
            className="cursor-pointer"
          />
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-medium">Email Notifications</div>
            <div className="text-sm text-muted-foreground">Send email confirmations</div>
          </div>
          <Switch
            checked={formData.emailNotificationsEnabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotificationsEnabled: checked }))}
            className="cursor-pointer"
          />
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-medium">SMS Notifications</div>
            <div className="text-sm text-muted-foreground">Send SMS notifications</div>
          </div>
          <Switch
            checked={formData.smsNotificationsEnabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotificationsEnabled: checked }))}
            className="cursor-pointer"
          />
        </div>

        {/* Cancellation Policy */}
        <div className="p-4 border rounded">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium">Cancellation Policy</div>
              <div className="text-sm text-muted-foreground">Show cancellation policy in booking summary</div>
            </div>
            <Switch
              checked={formData.showCancellationPolicy}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showCancellationPolicy: checked }))}
              className="cursor-pointer"
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
  );
};
