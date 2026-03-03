import React from 'react';
import { Car, Truck } from 'lucide-react';
import { VehicleType } from '../../types';

interface VehicleTypeSelectProps {
  label?: string;
  value: VehicleType;
  onChange: (value: VehicleType) => void;
  required?: boolean;
}

export const VehicleTypeSelect: React.FC<VehicleTypeSelectProps> = ({
  label = 'Vehicle Type',
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {/* Car Option */}
        <label
          className={`
            relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
            ${
              value === 'car'
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <input
            type="radio"
            name="vehicleType"
            value="car"
            checked={value === 'car'}
            onChange={() => onChange('car')}
            className="sr-only"
            required={required}
          />
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${value === 'car' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}
            `}
          >
            <Car size={20} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">Car</div>
            <div className="text-xs text-gray-500">Standard rate</div>
          </div>
        </label>

        {/* Van Option */}
        <label
          className={`
            relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
            ${
              value === 'van'
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <input
            type="radio"
            name="vehicleType"
            value="van"
            checked={value === 'van'}
            onChange={() => onChange('van')}
            className="sr-only"
            required={required}
          />
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${value === 'van' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}
            `}
          >
            <Truck size={20} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">Van</div>
            <div className="text-xs text-amber-600">Price may increase</div>
          </div>
        </label>
      </div>
    </div>
  );
};
