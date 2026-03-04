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

    const vatRate = parseFloat(formData.vat_rate);
    if (formData.vat_rate === '' || isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
      return 'Please enter a valid VAT rate between 0 and 100';
    }

    // Validate flat daily rate
    if (!formData.price_per_day || parseFloat(formData.price_per_day) <= 0) {
      return 'Please enter a valid daily rate greater than 0';
    }

    // Validate van multiplier
    const vanMultiplier = parseFloat(formData.van_multiplier);
    if (!formData.van_multiplier || isNaN(vanMultiplier) || vanMultiplier < 1 || vanMultiplier > 5) {
      return 'Please enter a valid van multiplier between 1 and 5';
    }

    // Validate weekly discounts
    const weeklyDiscounts = [
      { value: formData.weekly_discount_1wk, label: '1 Week' },
      { value: formData.weekly_discount_2wk, label: '2 Weeks' },
      { value: formData.weekly_discount_3wk, label: '3 Weeks' },
      { value: formData.weekly_discount_4wk, label: '4+ Weeks' },
    ];

    for (const discount of weeklyDiscounts) {
      const value = parseFloat(discount.value);
      if (isNaN(value) || value < 0 || value > 100) {
        return `Please enter a valid ${discount.label} discount between 0 and 100`;
      }
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
        price_per_day: parseFloat(formData.price_per_day),
        van_multiplier: parseFloat(formData.van_multiplier),
        vat_rate: parseFloat(formData.vat_rate) / 100,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
        is_active: formData.is_active,
        priority: formData.priority,
        reason: formData.reason?.trim() || null,
        display_order: formData.id ? undefined : pricingRulesCount + 1,
        weekly_discount_1wk: parseFloat(formData.weekly_discount_1wk),
        weekly_discount_2wk: parseFloat(formData.weekly_discount_2wk),
        weekly_discount_3wk: parseFloat(formData.weekly_discount_3wk),
        weekly_discount_4wk: parseFloat(formData.weekly_discount_4wk),
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
