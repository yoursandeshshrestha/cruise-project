import React from 'react';
import { Info } from 'lucide-react';

interface PricingNoticeProps {
  reason?: string | null;
  priority?: number;
}

/**
 * Displays a notice explaining why custom pricing is applied
 * Shows when priority 1 (custom) pricing is active with a reason
 */
export const PricingNotice: React.FC<PricingNoticeProps> = ({ reason, priority }) => {
  // Only show for custom pricing (priority 1) with a reason
  if (priority !== 1 || !reason) {
    return null;
  }

  return (
    <div className="bg-blue-50 p-3 rounded-lg flex gap-2 text-sm border border-blue-200">
      <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
      <div>
        <p className="font-medium text-blue-900 mb-0.5">Custom Pricing Applied</p>
        <p className="text-blue-700">{reason}</p>
      </div>
    </div>
  );
};
