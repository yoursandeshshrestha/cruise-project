import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PromoCodeFormData, PromoCode } from '../types';

interface UsePromoCodeActionsProps {
  createPromoCode: (data: Record<string, unknown>) => Promise<void>;
  updatePromoCode: (id: string, data: Record<string, unknown>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
}

export const usePromoCodeActions = ({
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
}: UsePromoCodeActionsProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCodeFormData | null>(null);

  const validateForm = (formData: PromoCodeFormData): string | null => {
    if (!formData.code.trim()) {
      return 'Please enter a promo code';
    }

    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      return 'Please enter a valid discount value';
    }

    if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
      return 'Percentage discount cannot exceed 100%';
    }

    if (!formData.valid_from || !formData.valid_until) {
      return 'Please select valid from and valid until dates';
    }

    if (formData.valid_from >= formData.valid_until) {
      return 'Valid until date must be after valid from date';
    }

    return null;
  };

  const handleSubmit = async (formData: PromoCodeFormData, onSuccess: () => void) => {
    setSubmitting(true);

    try {
      const validationError = validateForm(formData);
      if (validationError) {
        toast.error(validationError);
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
        valid_from: format(formData.valid_from as Date, 'yyyy-MM-dd'),
        valid_until: format(formData.valid_until as Date, 'yyyy-MM-dd'),
        is_active: true,
      };

      if (formData.id) {
        await updatePromoCode(formData.id, promoCodeData);
        toast.success('Promo code updated successfully');
      } else {
        await createPromoCode(promoCodeData);
        toast.success('Promo code created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      let errorMessage = 'An error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;

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

  const handleOpenDeleteDialog = (promoCode: PromoCode) => {
    setSelectedPromoCode({
      id: promoCode.id,
      code: promoCode.code,
      description: promoCode.description || '',
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_type === 'fixed'
        ? (promoCode.discount_value / 100).toFixed(2)
        : promoCode.discount_value.toString(),
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

  return {
    submitting,
    isDeleteDialogOpen,
    selectedPromoCode,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  };
};
