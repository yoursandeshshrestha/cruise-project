export const formatCurrency = (pence: number): string => {
  return `£${(pence / 100).toFixed(2)}`;
};

export const formatDateRange = (startDate: string | null, endDate: string | null): string => {
  if (!startDate && !endDate) return 'All year';
  if (startDate && endDate) return `${startDate} to ${endDate}`;
  if (startDate) return `From ${startDate}`;
  if (endDate) return `Until ${endDate}`;
  return 'All year';
};
