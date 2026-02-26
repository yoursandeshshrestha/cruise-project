import { useState } from 'react';
import { PricingFormData, PricingRule } from '../types';

const INITIAL_FORM_STATE: PricingFormData = {
  name: '',
  price_per_day: '',
  minimum_charge: '',
  vat_rate: '20',
  start_date: undefined,
  end_date: undefined,
  is_active: true,
  priority: 1, // Default to custom pricing
  reason: '',
};

export const usePricingForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PricingFormData>(INITIAL_FORM_STATE);

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
        priority: (pricingRule.priority || 1) as 1 | 2,
        reason: pricingRule.reason || '',
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(INITIAL_FORM_STATE);
  };

  return {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
  };
};
