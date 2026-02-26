import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { usePromoCodesStore } from '../../../stores/promoCodesStore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/admin/ui/select';
import { Input } from '../../../components/admin/ui/input';
import { Label } from '../../../components/admin/ui/label';
import { Switch } from '../../../components/admin/ui/switch';
import { Spinner } from '../../../components/admin/ui/spinner';
import { DatePicker } from '../../../components/admin/ui/date-picker';
import { Plus, Percent, PoundSterling, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PromoCodeFormData {
  id?: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  minimum_spend: string;
  max_uses: string;
  valid_from: Date | undefined;
  valid_until: Date | undefined;
}

export const PromoCodes: React.FC = () => {
  const { promoCodes, loading, initialized, fetchPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } = usePromoCodesStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCodeFormData | null>(null);
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_spend: '',
    max_uses: '',
    valid_from: undefined,
    valid_until: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchPromoCodes();
    }
  }, [initialized, fetchPromoCodes]);

  const handleOpenDialog = (promoCode?: typeof promoCodes[0]) => {
    if (promoCode) {
      setFormData({
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description || '',
        discount_type: promoCode.discount_type,
        // Convert pence to pounds for fixed discounts, keep percentage as-is
        discount_value: promoCode.discount_type === 'fixed'
          ? (promoCode.discount_value / 100).toFixed(2)
          : promoCode.discount_value.toString(),
        // Convert pence to pounds for minimum spend
        minimum_spend: promoCode.minimum_spend
          ? (promoCode.minimum_spend / 100).toFixed(2)
          : '',
        max_uses: promoCode.max_uses?.toString() || '',
        valid_from: new Date(promoCode.valid_from),
        valid_until: new Date(promoCode.valid_until),
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        minimum_spend: '',
        max_uses: '',
        valid_from: undefined,
        valid_until: undefined,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      minimum_spend: '',
      max_uses: '',
      valid_from: undefined,
      valid_until: undefined,
    });
  };

  const handleOpenDeleteDialog = (promoCode: typeof promoCodes[0]) => {
    setSelectedPromoCode({
      id: promoCode.id,
      code: promoCode.code,
      description: promoCode.description || '',
      discount_type: promoCode.discount_type,
      // Convert pence to pounds for fixed discounts, keep percentage as-is
      discount_value: promoCode.discount_type === 'fixed'
        ? (promoCode.discount_value / 100).toFixed(2)
        : promoCode.discount_value.toString(),
      // Convert pence to pounds for minimum spend
      minimum_spend: promoCode.minimum_spend
        ? (promoCode.minimum_spend / 100).toFixed(2)
        : '',
      max_uses: promoCode.max_uses?.toString() || '',
      valid_from: new Date(promoCode.valid_from),
      valid_until: new Date(promoCode.valid_until),
    });
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedPromoCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate
      if (!formData.code.trim()) {
        toast.error('Please enter a promo code');
        setSubmitting(false);
        return;
      }

      if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
        toast.error('Please enter a valid discount value');
        setSubmitting(false);
        return;
      }

      if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
        toast.error('Percentage discount cannot exceed 100%');
        setSubmitting(false);
        return;
      }

      if (!formData.valid_from || !formData.valid_until) {
        toast.error('Please select valid from and valid until dates');
        setSubmitting(false);
        return;
      }

      if (formData.valid_from >= formData.valid_until) {
        toast.error('Valid until date must be after valid from date');
        setSubmitting(false);
        return;
      }

      const promoCodeData = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || null,
        discount_type: formData.discount_type,
        // Convert pounds to pence for fixed discounts, keep percentage as-is
        discount_value: formData.discount_type === 'fixed'
          ? Math.round(parseFloat(formData.discount_value) * 100)
          : parseFloat(formData.discount_value),
        // Convert pounds to pence for minimum spend
        minimum_spend: formData.minimum_spend
          ? Math.round(parseFloat(formData.minimum_spend) * 100)
          : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: format(formData.valid_from, 'yyyy-MM-dd'),
        valid_until: format(formData.valid_until, 'yyyy-MM-dd'),
        is_active: true,
      };

      if (formData.id) {
        // Update
        await updatePromoCode(formData.id, promoCodeData);
        toast.success('Promo code updated successfully');
      } else {
        // Create
        await createPromoCode(promoCodeData);
        toast.success('Promo code created successfully');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Submit error:', error);
      let errorMessage = 'An error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific error types
        if (errorMessage.includes('row-level security')) {
          errorMessage = 'Permission denied. Please check your admin access.';
        } else if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          errorMessage = 'A promo code with this code already exists.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updatePromoCode(id, { is_active: !currentStatus });
      toast.success(`Promo code ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!selectedPromoCode?.id) return;

    setSubmitting(true);
    try {
      await deletePromoCode(selectedPromoCode.id);
      toast.success('Promo code deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Delete error:', error);
      let errorMessage = 'An error occurred while deleting';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific error types
        if (errorMessage.includes('row-level security')) {
          errorMessage = 'Permission denied. Please check your admin access.';
        } else if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
          errorMessage = 'Cannot delete. This promo code is being used.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDiscount = (type: string, value: number) => {
    // For fixed discounts, value is in pence - convert to pounds
    return type === 'percentage' ? `${value}%` : `£${(value / 100).toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  // Only show full loading screen on initial load
  if (!initialized) {
    return (
      <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Configuration' }, { label: 'Promo Codes' }]}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading promo codes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSidebar showHeader breadcrumbs={[{ label: 'Configuration' }, { label: 'Promo Codes' }]}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Promo Codes</h1>
            <p className="text-muted-foreground">
              Manage promotional discount codes
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Promo Code
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="text-right w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No promo codes found. Click "Add Promo Code" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promoCode) => (
                  <TableRow key={promoCode.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-mono font-semibold">{promoCode.code}</div>
                          {promoCode.description && (
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              {promoCode.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {promoCode.discount_type === 'percentage' ? (
                          <Percent className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <PoundSterling className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className="font-semibold">
                          {formatDiscount(promoCode.discount_type, promoCode.discount_value)}
                        </span>
                      </div>
                      {promoCode.minimum_spend && (
                        <div className="text-xs text-muted-foreground">
                          Min: £{(promoCode.minimum_spend / 100).toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {promoCode.current_uses}
                        {promoCode.max_uses ? ` / ${promoCode.max_uses}` : ' / ∞'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(promoCode.valid_from)}</div>
                        <div className="text-muted-foreground">
                          to {formatDate(promoCode.valid_until)}
                        </div>
                        {isExpired(promoCode.valid_until) && (
                          <div className="text-xs text-red-600 font-medium mt-1">Expired</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={promoCode.is_active}
                          onCheckedChange={() => handleToggleActive(promoCode.id, promoCode.is_active)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-slate-600 w-16">
                          {promoCode.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(promoCode)}
                          className="cursor-pointer"
                        >
                          <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(promoCode)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Promo Code' : 'Add Promo Code'}</DialogTitle>
            <DialogDescription>
              {formData.id
                ? 'Update the promo code details.'
                : 'Create a new promotional discount code.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDeleteDialog(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedPromoCode?.code}</strong>?
              This action cannot be undone and will remove all associated data.
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
