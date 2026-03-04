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

            {/* Flat Daily Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_day" className="cursor-pointer">Daily Rate (£) *</Label>
                <Input
                  id="price_per_day"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_day}
                  onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                  placeholder="15.00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Flat rate per day for standard vehicles (cars)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="van_multiplier" className="cursor-pointer">Van Multiplier *</Label>
                <Input
                  id="van_multiplier"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.van_multiplier}
                  onChange={(e) => setFormData({ ...formData, van_multiplier: e.target.value })}
                  placeholder="1.5"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Van price = car price × multiplier (e.g., 1.5)
                </p>
              </div>
            </div>

            {/* VAT Rate */}
            <div className="space-y-2">
              <Label htmlFor="vat_rate" className="cursor-pointer">VAT Rate (%)</Label>
              <Input
                id="vat_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.vat_rate}
                onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                placeholder="0 (or 20 for 20% VAT)"
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 if no VAT should be applied
              </p>
            </div>

            {/* Weekly Block Package Discounts */}
            <div className="space-y-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Weekly Block Package Discounts</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Incentivize longer bookings with percentage discounts on total parking price
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekly_discount_1wk" className="cursor-pointer">1 Week (7-13 days) %</Label>
                  <Input
                    id="weekly_discount_1wk"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.weekly_discount_1wk}
                    onChange={(e) => setFormData({ ...formData, weekly_discount_1wk: e.target.value })}
                    placeholder="0 (e.g., 5 for 5%)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly_discount_2wk" className="cursor-pointer">2 Weeks (14-20 days) %</Label>
                  <Input
                    id="weekly_discount_2wk"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.weekly_discount_2wk}
                    onChange={(e) => setFormData({ ...formData, weekly_discount_2wk: e.target.value })}
                    placeholder="0 (e.g., 10 for 10%)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly_discount_3wk" className="cursor-pointer">3 Weeks (21-27 days) %</Label>
                  <Input
                    id="weekly_discount_3wk"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.weekly_discount_3wk}
                    onChange={(e) => setFormData({ ...formData, weekly_discount_3wk: e.target.value })}
                    placeholder="0 (e.g., 15 for 15%)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly_discount_4wk" className="cursor-pointer">4+ Weeks (28+ days) %</Label>
                  <Input
                    id="weekly_discount_4wk"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.weekly_discount_4wk}
                    onChange={(e) => setFormData({ ...formData, weekly_discount_4wk: e.target.value })}
                    placeholder="0 (e.g., 20 for 20%)"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Set to 0 to disable any tier. Discount applies to total parking price only (before VAT).
              </p>
            </div>

            {/* Pricing Example */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-2">Pricing Calculation</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>• Standard vehicles (cars): £{formData.price_per_day || '15.00'} per day</div>
                <div>• Vans & large vehicles: Car total × {formData.van_multiplier || '1.5'} (rounded to nearest £)</div>
                <div className="mt-2 pt-2 border-t border-slate-300">
                  <span className="font-medium">Example:</span> 7 days = Car £{((parseFloat(formData.price_per_day || '15') * 7)).toFixed(2)} | Van £{Math.round((parseFloat(formData.price_per_day || '15') * 7) * parseFloat(formData.van_multiplier || '1.5'))}.00
                </div>
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
