import React from 'react';
import { ChevronRight } from 'lucide-react';
import { BookingStep } from '../../../../types';

interface ProgressHeaderProps {
  currentStep: BookingStep;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ currentStep }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center text-sm font-medium text-gray-400">
          <span className={currentStep >= 1 ? 'text-primary' : ''}>Trip</span>
          <ChevronRight size={16} />
          <span className={currentStep >= 2 ? 'text-primary' : ''}>Options</span>
          <ChevronRight size={16} />
          <span className={currentStep >= 3 ? 'text-primary' : ''}>Details</span>
          <ChevronRight size={16} />
          <span className={currentStep >= 4 ? 'text-primary' : ''}>Payment</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
