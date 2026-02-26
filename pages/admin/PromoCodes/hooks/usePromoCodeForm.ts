import { useState } from 'react';
import { PromoCodeFormData, PromoCode } from '../types';

const INITIAL_FORM_STATE: PromoCodeFormData = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  minimum_spend: '',
  max_uses: '',
  valid_from: undefined,
  valid_until: undefined,
};

export const usePromoCodeForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PromoCodeFormData>(INITIAL_FORM_STATE);

  const handleOpenDialog = (promoCode?: PromoCode) => {
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
