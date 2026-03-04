import React from 'react';
import { Check } from 'lucide-react';
import { BookingState, ParkingType } from '../../../../types';

interface AddOn {
  slug: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
}

interface ParkingOptionsStepProps {
  booking: BookingState;
  addOns: AddOn[];
  toggleAddOn: (slug: string) => void;
}

export const ParkingOptionsStep: React.FC<ParkingOptionsStepProps> = ({
  booking,
  addOns,
  toggleAddOn,
}) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Select Parking Option</h2>
        <div className="border-2 border-primary bg-blue-50 rounded-lg p-6 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{ParkingType.PARK_AND_RIDE}</h3>
            <span className="text-xl font-bold text-primary">Included</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Secure parking at our monitored facility with free shuttle transfer to/from the terminal.
          </p>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" /> 10 minute transfer time
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-600" /> CCTV & Gated Security
            </li>
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Add Extras (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addOns.filter(a => a.is_active).map(addon => (
            <div
              key={addon.slug}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                booking.selectedAddOns.includes(addon.slug)
                  ? 'border-primary bg-blue-50 ring-1 ring-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleAddOn(addon.slug)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-brand-dark">{addon.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
                </div>
                <span className="font-bold text-primary">+£{addon.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
