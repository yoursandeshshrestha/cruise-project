import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-semibold text-brand-dark">
          {label}
        </label>
      )}
      <input
        className={`w-full p-3 border rounded-md text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-red-500 bg-red-50' : 'border-brand-dark/30 focus:border-primary'
        } ${className}`}
        {...props}
      />
      {helperText && !error && <span className="text-xs text-gray-500">{helperText}</span>}
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
};
