import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/admin/ui/dialog';
import { Button } from '../../../../components/admin/ui/button';
import { Input } from '../../../../components/admin/ui/input';
import { Label } from '../../../../components/admin/ui/label';
import { Switch } from '../../../../components/admin/ui/switch';
import { DatePicker } from '../../../../components/admin/ui/date-picker';
import { Spinner } from '../../../../components/admin/ui/spinner';
import { PricingFormData } from '../types';

interface PricingFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PricingFormData;
  setFormData: React.Dispatch<React.SetStateAction<PricingFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const PricingForm: React.FC<PricingFormProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  submitting,
}) => {
  const isStandardPricing = formData.name === 'Standard Pricing' || formData.priority === 2;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</DialogTitle>
          <DialogDescription>
            {formData.id
              ? 'Update the pricing rule details below.'
              : 'Create a new pricing rule for parking rates.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 px-1 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="cursor-pointer">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Rate, Summer Peak, Christmas Special"
                required
                disabled={isStandardPricing}
                className={isStandardPricing ? 'bg-slate-50 cursor-not-allowed' : ''}
              />
              {isStandardPricing && (
                <p className="text-xs text-muted-foreground">
                  Standard Pricing name cannot be changed
                </p>
              )}
            </div>

            {/* VAT Rate */}
            <div className="space-y-2">
              <Label htmlFor="vat_rate" className="cursor-pointer">VAT Rate (%) *</Label>
              <Input
                id="vat_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.vat_rate}
                onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                placeholder="20"
                required
                className="max-w-xs"
              />
            </div>

            {/* Tiered Pricing Configuration */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-900">Tiered Pricing Configuration</div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_car_price" className="cursor-pointer">Base Car Price (1 Day) - £ *</Label>
                  <Input
                    id="base_car_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_car_price}
                    onChange={(e) => setFormData({ ...formData, base_car_price: e.target.value })}
                    placeholder="26.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_van_price" className="cursor-pointer">Base Van Price (1 Day) - £ *</Label>
                  <Input
                    id="base_van_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_van_price}
                    onChange={(e) => setFormData({ ...formData, base_van_price: e.target.value })}
                    placeholder="36.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_day_rate" className="cursor-pointer">Car Extra Day Rate - £ *</Label>
                  <Input
                    id="additional_day_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.additional_day_rate}
                    onChange={(e) => setFormData({ ...formData, additional_day_rate: e.target.value })}
                    placeholder="13.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_day_rate_van" className="cursor-pointer">Van Extra Day Rate - £ *</Label>
                  <Input
                    id="additional_day_rate_van"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.additional_day_rate_van}
                    onChange={(e) => setFormData({ ...formData, additional_day_rate_van: e.target.value })}
                    placeholder="18.00"
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Example: 7 days car = £{formData.base_car_price || '26.00'} + (6 × £{formData.additional_day_rate || '13.00'}) = £{(parseFloat(formData.base_car_price || '26') + (6 * parseFloat(formData.additional_day_rate || '13'))).toFixed(2)} | 7 days van = £{formData.base_van_price || '36.00'} + (6 × £{formData.additional_day_rate_van || '18.00'}) = £{(parseFloat(formData.base_van_price || '36') + (6 * parseFloat(formData.additional_day_rate_van || '18'))).toFixed(2)}
              </div>
            </div>

            {/* Date Range - Only for custom pricing (priority 1) */}
            {formData.priority === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="cursor-pointer">Start Date *</Label>
                    <DatePicker
                      date={formData.start_date}
                      onSelect={(date) => setFormData({ ...formData, start_date: date })}
                      placeholder="Select start date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="cursor-pointer">End Date *</Label>
                    <DatePicker
                      date={formData.end_date}
                      onSelect={(date) => setFormData({ ...formData, end_date: date })}
                      placeholder="Select end date"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="cursor-pointer">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="e.g., Peak season rates, Holiday pricing"
                  />
                  <p className="text-xs text-muted-foreground">
                    Explain why this pricing is different (shown to customers during booking)
                  </p>
                </div>
              </>
            )}

            {/* Standard Pricing indicator */}
            {isStandardPricing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm text-blue-700 font-medium">
                    Standard Pricing applies all year (no date restrictions)
                  </div>
                </div>
              </div>
            )}

            {/* Active toggle - Only for custom pricing */}
            {!isStandardPricing && (
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded">
                <div>
                  <div className="font-medium">Active</div>
                  <div className="text-sm text-muted-foreground">Enable this pricing rule</div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  className="cursor-pointer"
                />
              </div>
            )}

            {/* Standard Pricing always active indicator */}
            {isStandardPricing && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="text-sm text-green-700 font-medium">
                    Standard Pricing is always active
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                formData.id ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
