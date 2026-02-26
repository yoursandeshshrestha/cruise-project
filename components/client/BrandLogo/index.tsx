import React from 'react';

interface BrandLogoProps {
  variant?: 'color' | 'white';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'color', className = '' }) => {
  const src =
    variant === 'white'
      ? '/logos/simplecruise-logo-white.png'
      : '/logos/simplecruise-logo-colour.png';

  return (
    <div className={`flex items-center ${className}`}>
      <img src={src} alt="Simple Cruise logo" className="h-[50px] w-auto cursor-pointer" />
    </div>
  );
};
