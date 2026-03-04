import React, { useEffect, useState } from 'react';
import { Tag, Percent, Calendar, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { format } from 'date-fns';
import { usePricingStore } from '../../../../stores/pricingStore';

interface WeeklyDiscountTier {
  days: string;
  discount: number;
}

interface PricingRuleDiscounts {
  name: string;
  isCustom: boolean;
  dateRange?: string;
  tiers: WeeklyDiscountTier[];
}

interface WeeklyDiscountInfoProps {
  dropOffDate?: string;
  returnDate?: string;
}

export const WeeklyDiscountInfo: React.FC<WeeklyDiscountInfoProps> = ({
  dropOffDate,
  returnDate
}) => {
  const { pricingRules, fetchPricingRules, initialized } = usePricingStore();
  const [allDiscounts, setAllDiscounts] = useState<PricingRuleDiscounts[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchPricingRules();
    }
  }, [initialized, fetchPricingRules]);

  useEffect(() => {
    const discountsByRule: PricingRuleDiscounts[] = [];

    // Get all active pricing rules with discounts
    pricingRules
      .filter(rule => rule.is_active)
      .forEach(rule => {
        const tiers: WeeklyDiscountTier[] = [];

        if (rule.weekly_discount_1wk > 0) {
          tiers.push({ days: '7-13 days', discount: rule.weekly_discount_1wk });
        }
        if (rule.weekly_discount_2wk > 0) {
          tiers.push({ days: '14-20 days', discount: rule.weekly_discount_2wk });
        }
        if (rule.weekly_discount_3wk > 0) {
          tiers.push({ days: '21-27 days', discount: rule.weekly_discount_3wk });
        }
        if (rule.weekly_discount_4wk > 0) {
          tiers.push({ days: '28+ days', discount: rule.weekly_discount_4wk });
        }

        // Only add if there are discounts
        if (tiers.length > 0) {
          let dateRange = '';
          if (rule.start_date && rule.end_date) {
            const startDate = new Date(rule.start_date);
            const endDate = new Date(rule.end_date);
            dateRange = `${format(startDate, 'dd-MMM')} - ${format(endDate, 'dd-MMM-yyyy')}`;
          }

          discountsByRule.push({
            name: rule.name,
            isCustom: rule.priority === 1,
            dateRange,
            tiers,
          });
        }
      });

    setAllDiscounts(discountsByRule);
  }, [pricingRules]);

  // Don't show if no discounts are configured
  if (allDiscounts.length === 0) {
    return null;
  }

  return (
    <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
      <div className="flex gap-3">
        <div className="shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div
            className="flex items-center justify-between min-h-10 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Weekly Booking Discounts Available!
              <Percent className="w-4 h-4 text-green-600" />
            </h3>
            <button
              type="button"
              className="shrink-0 p-1 hover:bg-green-100 rounded-full transition-colors cursor-pointer"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-green-700" />
              ) : (
                <ChevronDown className="w-5 h-5 text-green-700" />
              )}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-3">
              <p className="text-sm text-gray-700 mb-4">
                Save more when you park longer! Our weekly discount packages automatically apply to your booking:
              </p>

              <div className="space-y-4">
                {allDiscounts.map((ruleDiscount, ruleIndex) => (
                  <div key={ruleIndex} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {ruleDiscount.name}
                      </h4>
                      {ruleDiscount.isCustom && ruleDiscount.dateRange && (
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-700 font-medium">
                            {ruleDiscount.dateRange}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ruleDiscount.tiers.map((tier, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-2.5 border border-green-200 text-center"
                        >
                          <div className="text-xl font-bold text-green-600">
                            {tier.discount}%
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {tier.days}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* How it works info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <p className="font-semibold mb-1">How discount is applied:</p>
                    <ul className="space-y-1 list-disc pl-4">
                      <li>
                        Discount applies to total parking price (before VAT)
                      </li>
                      <li>
                        For bookings spanning multiple pricing periods, the discount from the pricing rule covering the most days is applied
                      </li>
                      <li>
                        Discount is calculated automatically based on your total booking duration
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
