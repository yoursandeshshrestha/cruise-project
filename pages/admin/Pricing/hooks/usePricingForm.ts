import { useState } from 'react';
import { PricingFormData, PricingRule } from '../types';

const INITIAL_FORM_STATE: PricingFormData = {
  name: '',
  vat_rate: '20',
  base_car_price: '26.00',
  base_van_price: '36.00',
  additional_day_rate: '13.00',
  additional_day_rate_van: '18.00',
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
        vat_rate: ((pricingRule.vat_rate ?? 0.20) * 100).toString(),
        base_car_price: (pricingRule.base_car_price ?? 26.00).toFixed(2),
        base_van_price: (pricingRule.base_van_price ?? 36.00).toFixed(2),
        additional_day_rate: (pricingRule.additional_day_rate ?? 13.00).toFixed(2),
        additional_day_rate_van: (pricingRule.additional_day_rate_van ?? 18.00).toFixed(2),
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
