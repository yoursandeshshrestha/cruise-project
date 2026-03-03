import { useState } from 'react';
import { PricingFormData, PricingRule } from '../types';

const INITIAL_FORM_STATE: PricingFormData = {
  name: '',
  price_per_day: '',
  van_multiplier: '',
  vat_rate: '0',
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
        price_per_day: pricingRule.price_per_day?.toFixed(2) ?? '',
        van_multiplier: pricingRule.van_multiplier?.toFixed(1) ?? '',
        vat_rate: ((pricingRule.vat_rate ?? 0) * 100).toString(),
        start_date: pricingRule.start_date ? new Date(pricingRule.start_date) : undefined,
        end_date: pricingRule.end_date ? new Date(pricingRule.end_date) : undefined,
        is_active: pricingRule.is_active,
        priority: (pricingRule.priority ?? 1) as 1 | 2,
        reason: pricingRule.reason ?? '',
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
