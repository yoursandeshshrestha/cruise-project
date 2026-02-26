import React from 'react';
import { FileText } from 'lucide-react';

interface AddOnsCardProps {
  addOns: string[];
}

export const AddOnsCard: React.FC<AddOnsCardProps> = ({ addOns }) => {
  if (!addOns || addOns.length === 0) {
    return null;
  }

  return (
    <div className="bg-admin-card-bg border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Add-ons</h2>
      </div>
      <ul className="space-y-2">
        {addOns.map((addon, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>{addon}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
