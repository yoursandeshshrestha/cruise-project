import React, { useEffect } from 'react';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Droplets, Sparkles, Clock, Calendar, Truck } from 'lucide-react';
import { useAddOnsStore } from '../../../stores/addOnsStore';
import { useBookingCartStore } from '../../../stores/bookingCartStore';
import { usePricingStore } from '../../../stores/pricingStore';
import { WeeklyDiscountInfo } from '../BookingFlow/components/WeeklyDiscountInfo';

export const Prices: React.FC = () => {
  const navigate = useNavigate();
  const { addOns, fetchActiveAddOns } = useAddOnsStore();
  const { addAddOn } = useBookingCartStore();
  const { pricingRules, fetchPricingRules, initialized } = usePricingStore();

  useEffect(() => {
    fetchActiveAddOns();
    if (!initialized) {
      fetchPricingRules();
    }
  }, [fetchActiveAddOns, fetchPricingRules, initialized]);

  // Filter only active pricing rules and sort by priority (Standard Pricing first)
  const activePricingRules = pricingRules
    .filter(rule => rule.is_active)
    .sort((a, b) => (b.priority || 1) - (a.priority || 1)); // Descending order: priority 2 first, then 1

  // Get the standard pricing (priority 2) or first active rule as fallback
  const standardPricing = activePricingRules.find(rule => rule.priority === 2) || activePricingRules[0];

  // Get pricing configuration from standard pricing rule
  const pricePerDay = standardPricing?.price_per_day ?? 0;
  const vanMultiplier = standardPricing?.van_multiplier ?? 0;

  // Helper function to get discount percentage for standard pricing
  const getStandardDiscountPercentage = (days: number): number => {
    if (!standardPricing) return 0;
    if (days >= 28 && standardPricing.weekly_discount_4wk > 0) return standardPricing.weekly_discount_4wk;
    if (days >= 21 && standardPricing.weekly_discount_3wk > 0) return standardPricing.weekly_discount_3wk;
    if (days >= 14 && standardPricing.weekly_discount_2wk > 0) return standardPricing.weekly_discount_2wk;
    if (days >= 7 && standardPricing.weekly_discount_1wk > 0) return standardPricing.weekly_discount_1wk;
    return 0;
  };

  // Calculate price with weekly discount applied
  const calculateCarPrice = (days: number) => {
    const basePrice = pricePerDay * days;
    const discountPercentage = getStandardDiscountPercentage(days);
    return basePrice * (1 - discountPercentage / 100);
  };

  const calculateVanPrice = (days: number) => Math.round(calculateCarPrice(days) * vanMultiplier);

  const getIconComponent = (slug: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'ev-charging': <Zap size={24} />,
      'exterior-wash': <Droplets size={24} />,
      'full-valet': <Sparkles size={24} />,
    };
    return iconMap[slug] || <Sparkles size={24} />;
  };

  const handleAddToBooking = (addOnSlug: string) => {
    addAddOn(addOnSlug);
    navigate('/book');
  };

  return (
    <Layout>
      <div className="bg-brand-dark text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Transparent Pricing</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          No hidden fees. Just simple, affordable rates for secure cruise parking.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Weekly Discount Information */}
        <WeeklyDiscountInfo />

        {/* Display all active pricing rules */}
        {activePricingRules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-medium border border-gray-100 p-8 mb-20">
            <p className="text-center text-gray-500">No pricing available at this time.</p>
          </div>
        ) : (
          <div className="space-y-8 mb-20">
            {activePricingRules.map((pricingRule) => {
              const isStandardPricing = pricingRule.priority === 2;
              const rulePricePerDay = pricingRule.price_per_day ?? 0;
              const ruleVanMultiplier = pricingRule.van_multiplier ?? 0;

              // Helper function to get discount percentage based on days
              const getDiscountPercentage = (days: number): number => {
                if (days >= 28 && pricingRule.weekly_discount_4wk > 0) return pricingRule.weekly_discount_4wk;
                if (days >= 21 && pricingRule.weekly_discount_3wk > 0) return pricingRule.weekly_discount_3wk;
                if (days >= 14 && pricingRule.weekly_discount_2wk > 0) return pricingRule.weekly_discount_2wk;
                if (days >= 7 && pricingRule.weekly_discount_1wk > 0) return pricingRule.weekly_discount_1wk;
                return 0;
              };

              const calculateRuleCarPrice = (days: number) => {
                const basePrice = rulePricePerDay * days;
                const discountPercentage = getDiscountPercentage(days);
                return basePrice * (1 - discountPercentage / 100);
              };

              const calculateRuleVanPrice = (days: number) => Math.round(calculateRuleCarPrice(days) * ruleVanMultiplier);

              const rulePricingTiers = [
                { days: 1, carPrice: calculateRuleCarPrice(1), label: '1 Day', discount: getDiscountPercentage(1) },
                { days: 2, carPrice: calculateRuleCarPrice(2), label: '2 Days', discount: getDiscountPercentage(2) },
                { days: 3, carPrice: calculateRuleCarPrice(3), label: '3 Days', discount: getDiscountPercentage(3) },
                { days: 4, carPrice: calculateRuleCarPrice(4), label: '4 Days', discount: getDiscountPercentage(4) },
                { days: 5, carPrice: calculateRuleCarPrice(5), label: '5 Days', discount: getDiscountPercentage(5) },
                { days: 6, carPrice: calculateRuleCarPrice(6), label: '6 Days', discount: getDiscountPercentage(6) },
                { days: 7, carPrice: calculateRuleCarPrice(7), label: '1 Week', discount: getDiscountPercentage(7) },
                { days: 14, carPrice: calculateRuleCarPrice(14), label: '2 Weeks', discount: getDiscountPercentage(14) },
                { days: 21, carPrice: calculateRuleCarPrice(21), label: '3 Weeks', discount: getDiscountPercentage(21) },
                { days: 28, carPrice: calculateRuleCarPrice(28), label: '4 Weeks', discount: getDiscountPercentage(28) },
              ];

              return (
                <div key={pricingRule.id} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Pricing Table Card */}
                  <div className={`bg-white rounded-2xl shadow-medium border overflow-hidden col-span-1 md:col-span-2 ${
                    isStandardPricing ? 'border-blue-200' : 'border-purple-200'
                  }`}>
                    <div className="p-8">
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold text-brand-dark mb-1 flex items-center gap-2">
                          {pricingRule.name}
                          {isStandardPricing && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              Standard
                            </span>
                          )}
                        </h2>
                        {!isStandardPricing && pricingRule.start_date && pricingRule.end_date && (
                          <p className="text-sm text-purple-700 font-medium">
                            Valid: {new Date(pricingRule.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(pricingRule.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                        {isStandardPricing && (
                          <p className="text-sm text-blue-700 font-medium">Year-round standard pricing</p>
                        )}
                      </div>

                      {pricingRule.reason && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{pricingRule.reason}</p>
                        </div>
                      )}

                      <p className="text-gray-600 mb-6">
                        All prices include secure parking and free shuttle transfers for all passengers.
                      </p>

                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left p-3 font-semibold text-brand-dark">Duration</th>
                              <th className="text-right p-3 font-semibold text-brand-dark">Car</th>
                              <th className="text-right p-3 font-semibold text-amber-700">
                                <span className="flex items-center justify-end gap-1">
                                  <Truck size={14} /> Van ({ruleVanMultiplier.toFixed(1)}× car price)
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {rulePricingTiers.map((tier) => {
                              const vanPrice = calculateRuleVanPrice(tier.days);
                              const baseCarPrice = rulePricePerDay * tier.days;
                              const baseVanPrice = Math.round(baseCarPrice * ruleVanMultiplier);

                              return (
                                <tr key={tier.days} className="hover:bg-gray-50">
                                  <td className="p-3 font-medium text-gray-700">{tier.label}</td>
                                  <td className="p-3 text-right">
                                    {tier.discount > 0 ? (
                                      <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 line-through">£{baseCarPrice.toFixed(2)}</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-semibold text-green-600">-{tier.discount}%</span>
                                          <span className="font-bold text-brand-dark">£{tier.carPrice.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="font-bold text-brand-dark">£{tier.carPrice.toFixed(2)}</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    {tier.discount > 0 ? (
                                      <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 line-through">£{baseVanPrice.toFixed(2)}</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-semibold text-green-600">-{tier.discount}%</span>
                                          <span className="font-bold text-amber-700">£{vanPrice.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="font-bold text-amber-700">£{vanPrice.toFixed(2)}</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                        <Truck size={14} className="shrink-0 mt-0.5 text-amber-600" />
                        <p>Van pricing is calculated as total car price × {ruleVanMultiplier.toFixed(1)}, rounded to the nearest pound.</p>
                      </div>

                      <div className="mt-6">
                        <Link to="/book">
                          <Button className="cursor-pointer">Get a Quote</Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Value Proposition - Only show once for the first pricing rule */}
                  {pricingRule === activePricingRules[0] && (
                    <div className="bg-brand-dark rounded-2xl p-8 text-white flex flex-col justify-center">
                      <h3 className="text-xl font-bold mb-4">Why book direct?</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <Clock className="text-primary shrink-0" />
                          <span className="text-sm text-gray-300">Best price guarantee when you book directly through our website.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Calendar className="text-primary shrink-0" />
                          <span className="text-sm text-gray-300">Priority booking management and instant confirmation.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Sparkles className="text-primary shrink-0" />
                          <span className="text-sm text-gray-300">Exclusive access to valet and EV charging add-ons.</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}


        {/* What's Included */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-brand-dark mb-10 text-center">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Secure, CCTV monitored facility' },
              { label: 'Free shuttle to all terminals (10 mins)' },
              { label: 'Luggage assistance included' },
              { label: 'Flexible amendment policy' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-gray-700">
                <Check size={18} className="text-green-500 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Ons */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-brand-dark mb-10 text-center">Optional Extras</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon) => (
              <div key={addon.id} className="bg-white p-6 rounded-xl shadow-light border border-gray-100 hover:shadow-medium transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary mb-4">
                  {getIconComponent(addon.slug)}
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">{addon.name}</h3>
                <p className="text-gray-600 text-sm mb-6 min-h-[40px]">{addon.description}</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <span className="text-2xl font-bold text-brand-dark">£{(addon.price / 100).toFixed(2)}</span>
                  <Button
                    variant="secondary"
                    className="px-4 py-2 text-sm cursor-pointer"
                    onClick={() => handleAddToBooking(addon.slug)}
                  >
                    Add to Booking
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
            <h2 className="text-3xl font-bold text-brand-dark mb-8 text-center">Compare & Save</h2>
            <table className="w-full max-w-4xl mx-auto bg-white shadow-light rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-brand-dark">
                    <tr>
                        <th className="p-4 text-left">Feature</th>
                        <th className="p-4 text-center bg-blue-50 text-primary border-t-2 border-primary">Simple Cruise Parking</th>
                        <th className="p-4 text-center text-gray-500">On-Port Parking</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    <tr>
                        <td className="p-4 font-medium">Cost per week (approx)</td>
                        <td className="p-4 text-center font-bold text-green-600">£{calculateCarPrice(7).toFixed(2)}</td>
                        <td className="p-4 text-center text-gray-500">£140.00+</td>
                    </tr>
                    <tr>
                        <td className="p-4 font-medium">Shuttle Service</td>
                        <td className="p-4 text-center text-green-600 font-medium">Included (Door to Door)</td>
                        <td className="p-4 text-center text-gray-500">Walk required</td>
                    </tr>
                     <tr>
                        <td className="p-4 font-medium">Security</td>
                        <td className="p-4 text-center">24/7 CCTV & Guarded</td>
                        <td className="p-4 text-center">Open Public Access</td>
                    </tr>
                     <tr>
                        <td className="p-4 font-medium">EV Charging Available</td>
                        <td className="p-4 text-center text-green-600"><Check size={20} className="mx-auto" /></td>
                        <td className="p-4 text-center text-gray-400">-</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </Layout>
  );
};
