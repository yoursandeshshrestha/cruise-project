export const formatDiscount = (type: string, value: number): string => {
  // For fixed discounts, value is in pence - convert to pounds
  return type === 'percentage' ? `${value}%` : `£${(value / 100).toFixed(2)}`;
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const isExpired = (validUntil: string): boolean => {
  return new Date(validUntil) < new Date();
};
