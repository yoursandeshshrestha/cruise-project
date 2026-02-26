import { useState } from 'react';

interface PromoCodeResult {
  is_valid: boolean;
  discount_amount: number;
  message: string;
}

interface UsePromoCodeReturn {
  appliedPromoCode: string;
  promoDiscount: number;
  promoMessage: string;
  isValidatingPromo: boolean;
  handleApplyPromo: (code: string, subtotal: number) => Promise<void>;
  handleRemovePromo: () => void;
}

export const usePromoCode = (
  validatePromoCode: (code: string, amount: number) => Promise<PromoCodeResult>
): UsePromoCodeReturn => {
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleApplyPromo = async (code: string, subtotal: number) => {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setPromoMessage('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    setPromoMessage('');

    try {
      const result = await validatePromoCode(trimmedCode, subtotal);

      if (result.is_valid) {
        setAppliedPromoCode(trimmedCode);
        setPromoDiscount(result.discount_amount);
        setPromoMessage(`✓ ${result.message}`);
      } else {
        setAppliedPromoCode('');
        setPromoDiscount(0);
        setPromoMessage(`✗ ${result.message}`);
      }
    } catch (error) {
      setPromoMessage('✗ Error validating promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromoCode('');
    setPromoDiscount(0);
    setPromoMessage('');
  };

  return {
    appliedPromoCode,
    promoDiscount,
    promoMessage,
    isValidatingPromo,
    handleApplyPromo,
    handleRemovePromo,
  };
};
