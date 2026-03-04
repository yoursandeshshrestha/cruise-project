export const formatDiscount = (type: string, value: number): string => {
  // For fixed discounts, value is in pence - convert to pounds
  return type === 'percentage' ? `${value}%` : `£${(value / 100).toFixed(2)}`;
};

import { formatDateShort as formatDateUtil } from '../../../lib/dateUtils';

export const formatDate = (dateStr: string): string => {
  return formatDateUtil(dateStr);
};

export const isExpired = (validUntil: string): boolean => {
  return new Date(validUntil) < new Date();
};
