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
  const isStandardPricing = formData.name === 'Standard Pricing';
  const isCustomPricing = formData.priority === 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
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
              <Label htmlFor="name">Name *</Label>
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_day">Daily Rate (£) *</Label>
                <Input
                  id="price_per_day"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_day}
                  onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                  placeholder="12.50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_charge">Minimum (£) *</Label>
                <Input
                  id="minimum_charge"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimum_charge}
                  onChange={(e) => setFormData({ ...formData, minimum_charge: e.target.value })}
                  placeholder="45.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vat_rate">VAT Rate (%) *</Label>
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
                />
              </div>
            </div>

            {/* Priority Info */}
            {!formData.id && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="font-medium text-blue-900">Pricing Type</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="2"
                      checked={formData.priority === 2}
                      onChange={() => setFormData({ ...formData, priority: 2, start_date: undefined, end_date: undefined })}
                      className="cursor-pointer"
                    />
                    <span className="text-sm">Standard Pricing (Base Price)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="1"
                      checked={formData.priority === 1}
                      onChange={() => setFormData({ ...formData, priority: 1 })}
                      className="cursor-pointer"
                    />
                    <span className="text-sm">Custom Pricing (Date-Specific)</span>
                  </label>
                </div>
                <p className="text-xs text-blue-700">
                  {formData.priority === 2
                    ? 'Standard pricing is the default base price used year-round.'
                    : 'Custom pricing overrides standard pricing for specific date ranges.'}
                </p>
              </div>
            )}

            {/* Show priority as read-only when editing */}
            {formData.id && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Priority Level</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formData.priority === 2 ? 'Standard Pricing (Base Price)' : 'Custom Pricing (Date-Specific)'}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm font-medium">
                    Priority {formData.priority}
                  </div>
                </div>
              </div>
            )}

            {/* Date Range - Required for custom pricing, hidden for standard */}
            {formData.priority === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <DatePicker
                      date={formData.start_date}
                      onSelect={(date) => setFormData({ ...formData, start_date: date })}
                      placeholder="Select start date"
                    />
                    <p className="text-xs text-muted-foreground">Required for custom pricing</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <DatePicker
                      date={formData.end_date}
                      onSelect={(date) => setFormData({ ...formData, end_date: date })}
                      placeholder="Select end date"
                    />
                    <p className="text-xs text-muted-foreground">Required for custom pricing</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
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
