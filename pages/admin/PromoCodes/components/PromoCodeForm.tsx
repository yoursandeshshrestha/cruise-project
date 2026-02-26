import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/admin/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/admin/ui/select';
import { Button } from '../../../../components/admin/ui/button';
import { Input } from '../../../../components/admin/ui/input';
import { Label } from '../../../../components/admin/ui/label';
import { DatePicker } from '../../../../components/admin/ui/date-picker';
import { Spinner } from '../../../../components/admin/ui/spinner';
import { PromoCodeFormData } from '../types';

interface PromoCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PromoCodeFormData;
  setFormData: React.Dispatch<React.SetStateAction<PromoCodeFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const PromoCodeForm: React.FC<PromoCodeFormProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  submitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Edit Promo Code' : 'Add Promo Code'}</DialogTitle>
          <DialogDescription>
            {formData.id
              ? 'Update the promo code details.'
              : 'Create a new promotional discount code.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., SUMMER2024"
                  required
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, discount_type: value }))}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage" className="cursor-pointer">Percentage (%)</SelectItem>
                    <SelectItem value="fixed" className="cursor-pointer">Fixed Amount (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the offer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(£)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                  placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_spend">Minimum Spend (£)</Label>
                <Input
                  id="minimum_spend"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimum_spend}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_spend: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_uses">Maximum Uses</Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                value={formData.max_uses}
                onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Valid From</Label>
                <DatePicker
                  date={formData.valid_from}
                  onSelect={(date) => setFormData(prev => ({ ...prev, valid_from: date }))}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <DatePicker
                  date={formData.valid_until}
                  onSelect={(date) => setFormData(prev => ({ ...prev, valid_until: date }))}
                  placeholder="Select end date"
                />
              </div>
            </div>
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
                  {formData.id ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{formData.id ? 'Update' : 'Create'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
