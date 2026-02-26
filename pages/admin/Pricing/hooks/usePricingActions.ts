import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PricingFormData, PricingRule } from '../types';

interface UsePricingActionsProps {
  createPricingRule: (data: Record<string, unknown>) => Promise<void>;
  updatePricingRule: (id: string, data: Record<string, unknown>) => Promise<void>;
  deletePricingRule: (id: string) => Promise<void>;
  pricingRulesCount: number;
}

export const usePricingActions = ({
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  pricingRulesCount,
}: UsePricingActionsProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<PricingRule | null>(null);

  const validateForm = (formData: PricingFormData): string | null => {
    if (!formData.name.trim()) {
      return 'Please enter a pricing rule name';
    }

    if (!formData.vat_rate || parseFloat(formData.vat_rate) < 0 || parseFloat(formData.vat_rate) > 100) {
      return 'Please enter a valid VAT rate between 0 and 100';
    }

    // Validate tiered pricing fields
    if (!formData.base_car_price || parseFloat(formData.base_car_price) < 0) {
      return 'Please enter a valid base car price';
    }

    if (!formData.base_van_price || parseFloat(formData.base_van_price) < 0) {
      return 'Please enter a valid base van price';
    }

    if (!formData.additional_day_rate || parseFloat(formData.additional_day_rate) < 0) {
      return 'Please enter a valid additional day rate';
    }

    if (!formData.additional_day_rate_van || parseFloat(formData.additional_day_rate_van) < 0) {
      return 'Please enter a valid van additional day rate';
    }

    // Custom pricing (priority 1) requires dates
    if (formData.priority === 1) {
      if (!formData.start_date) {
        return 'Start date is required for custom pricing rules';
      }
      if (!formData.end_date) {
        return 'End date is required for custom pricing rules';
      }
    }

    if (formData.start_date && formData.end_date) {
      if (formData.start_date > formData.end_date) {
        return 'Start date must be before end date';
      }
    }

    return null;
  };

  const handleSubmit = async (formData: PricingFormData, onSuccess: () => void) => {
    setSubmitting(true);

    try {
      const validationError = validateForm(formData);
      if (validationError) {
        toast.error(validationError);
        setSubmitting(false);
        return;
      }

      const pricingData = {
        name: formData.name.trim(),
        vat_rate: parseFloat(formData.vat_rate) / 100,
        base_car_price: parseFloat(formData.base_car_price),
        base_van_price: parseFloat(formData.base_van_price),
        additional_day_rate: parseFloat(formData.additional_day_rate),
        additional_day_rate_van: parseFloat(formData.additional_day_rate_van),
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        is_active: formData.is_active,
        priority: formData.priority,
        reason: formData.reason?.trim() || null,
        display_order: formData.id ? undefined : pricingRulesCount + 1,
      };

      if (formData.id) {
        await updatePricingRule(formData.id, pricingData);
        toast.success('Pricing rule updated successfully');
      } else {
        await createPricingRule(pricingData);
        toast.success('Pricing rule created successfully');
      }

      onSuccess();
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

  const handleOpenDeleteDialog = (pricingRule: PricingRule) => {
    setSelectedPricing(pricingRule);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedPricing(null);
  };

  const handleDelete = async () => {
    if (!selectedPricing) return;

    // Prevent deletion of Standard Pricing
    if (selectedPricing.name === 'Standard Pricing' || selectedPricing.priority === 2) {
      toast.error('Standard Pricing cannot be deleted as it is the base price.');
      return;
    }

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

  return {
    submitting,
    isDeleteDialogOpen,
    selectedPricing,
    handleSubmit,
    handleToggleActive,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDelete,
  };
};
