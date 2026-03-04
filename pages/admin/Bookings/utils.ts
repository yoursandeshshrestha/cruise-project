import { formatDateTimeFull } from '../../../lib/dateUtils';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-100';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100';
    case 'checked_in':
      return 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-100';
    case 'completed':
      return 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-100';
    default:
      return 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-100';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return formatDateTimeFull(dateString);
  } catch {
    return dateString;
  }
};
