import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { usePricingStore } from '../../../stores/pricingStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/admin/ui/table';
import { Button } from '../../../components/admin/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/admin/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/admin/ui/alert-dialog';
import { Input } from '../../../components/admin/ui/input';
import { Label } from '../../../components/admin/ui/label';
import { Switch } from '../../../components/admin/ui/switch';
import { Spinner } from '../../../components/admin/ui/spinner';
import { DatePicker } from '../../../components/admin/ui/date-picker';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Database } from '../../../lib/supabase';

type PricingRule = Database['public']['Tables']['pricing_rules']['Row'];

interface PricingFormData {
  id?: string;
  name: string;
  price_per_day: string;
  minimum_charge: string;
  vat_rate: string;
  start_date?: Date;
  end_date?: Date;
  is_active: boolean;
}

export const Pricing: React.FC = () => {
  const { pricingRules, loading, initialized, fetchPricingRules, createPricingRule, updatePricingRule, deletePricingRule } = usePricingStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    name: '',
    price_per_day: '',
    minimum_charge: '',
    vat_rate: '20',
    start_date: undefined,
    end_date: undefined,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchPricingRules();
    }
  }, [initialized, fetchPricingRules]);

  const handleOpenDialog = (pricingRule?: PricingRule) => {
    if (pricingRule) {
      setFormData({
        id: pricingRule.id,
        name: pricingRule.name,
        price_per_day: (pricingRule.price_per_day / 100).toFixed(2),
        minimum_charge: (pricingRule.minimum_charge / 100).toFixed(2),
        vat_rate: ((pricingRule.vat_rate || 0.20) * 100).toString(),
        start_date: pricingRule.start_date ? new Date(pricingRule.start_date) : undefined,
        end_date: pricingRule.end_date ? new Date(pricingRule.end_date) : undefined,
        is_active: pricingRule.is_active,
      });
    } else {
      setFormData({
        name: '',
        price_per_day: '',
        minimum_charge: '',
        vat_rate: '20',
        start_date: undefined,
        end_date: undefined,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: '', price_per_day: '', minimum_charge: '', vat_rate: '20', start_date: undefined, end_date: undefined, is_active: true });
  };

  const handleOpenDeleteDialog = (pricingRule: PricingRule) => {
    setSelectedPricing(pricingRule);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedPricing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate
      if (!formData.name.trim()) {
        toast.error('Please enter a pricing rule name');
        setSubmitting(false);
        return;
      }

      if (!formData.price_per_day || parseFloat(formData.price_per_day) < 0) {
        toast.error('Please enter a valid daily rate');
        setSubmitting(false);
        return;
      }

      if (!formData.minimum_charge || parseFloat(formData.minimum_charge) < 0) {
        toast.error('Please enter a valid minimum charge');
        setSubmitting(false);
        return;
      }

      if (!formData.vat_rate || parseFloat(formData.vat_rate) < 0 || parseFloat(formData.vat_rate) > 100) {
        toast.error('Please enter a valid VAT rate between 0 and 100');
        setSubmitting(false);
        return;
      }

      // Validate date range if provided
      if (formData.start_date && formData.end_date) {
        if (formData.start_date > formData.end_date) {
          toast.error('Start date must be before end date');
          setSubmitting(false);
          return;
        }
      }

      const pricingData = {
        name: formData.name.trim(),
        price_per_day: Math.round(parseFloat(formData.price_per_day) * 100),
        minimum_charge: Math.round(parseFloat(formData.minimum_charge) * 100),
        vat_rate: parseFloat(formData.vat_rate) / 100, // Convert percentage to decimal (20% -> 0.20)
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        is_active: formData.is_active,
        display_order: formData.id ? undefined : pricingRules.length + 1,
      };

      if (formData.id) {
        // Update
        await updatePricingRule(formData.id, pricingData);
        toast.success('Pricing rule updated successfully');
      } else {
        // Create
        await createPricingRule(pricingData);
        toast.success('Pricing rule created successfully');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving pricing rule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save pricing rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updatePricingRule(id, { is_active: !currentStatus });
      toast.success(`Pricing rule ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!selectedPricing) return;

    setSubmitting(true);
    try {
      await deletePricingRule(selectedPricing.id);
      toast.success('Pricing rule deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete pricing rule');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return 'All year';
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Until ${endDate}`;
    return 'All year';
  };

  const breadcrumbs = [
    { label: 'Configuration' },
    { label: 'Pricing Rules' }
  ];

  // Only show full loading screen on initial load
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-full p-8">
          <Spinner className="h-8 w-8" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Pricing Rules</h1>
            <p className="text-muted-foreground">
              Manage parking rates including seasonal pricing and date-based rules
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing Rule
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Minimum</TableHead>
                <TableHead>VAT Rate</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="text-right w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No pricing rules found. Add your first pricing rule to get started.
                  </TableCell>
                </TableRow>
              ) : (
                pricingRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{formatCurrency(rule.price_per_day)}</TableCell>
                    <TableCell>{formatCurrency(rule.minimum_charge)}</TableCell>
                    <TableCell>{((rule.vat_rate || 0.20) * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateRange(rule.start_date, rule.end_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => handleToggleActive(rule.id, rule.is_active)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-slate-600 w-16">
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(rule)}
                          className="cursor-pointer"
                        >
                          <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(rule)}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <img
                            src="/icons/delete.svg"
                            alt="Delete"
                            className="w-4 h-4"
                            style={{ filter: 'brightness(0) saturate(100%) invert(17%) sepia(100%) saturate(7426%) hue-rotate(356deg) brightness(91%) contrast(115%)' }}
                          />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</DialogTitle>
            <DialogDescription>
              {formData.id
                ? 'Update the pricing rule details below.'
                : 'Create a new pricing rule for parking rates.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 py-4 px-1 overflow-y-auto flex-1">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Rate, Summer Peak, Christmas Special"
                  required
                />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date (Optional)</Label>
                  <DatePicker
                    date={formData.start_date}
                    onSelect={(date) => setFormData({ ...formData, start_date: date })}
                    placeholder="Select start date"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for year-round</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <DatePicker
                    date={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    placeholder="Select end date"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for year-round</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded">
                <div>
                  <div className="font-medium">Active</div>
                  <div className="text-sm text-muted-foreground">Enable this pricing rule</div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDeleteDialog(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedPricing?.name}</strong>?
              This action cannot be undone and will remove this pricing rule from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="cursor-pointer bg-destructive hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};
