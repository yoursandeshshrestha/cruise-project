import React from 'react';

interface BrandLogoProps {
  variant?: 'color' | 'white';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'color', className = '' }) => {
  const isWhite = variant === 'white';
  const primary = '#00A9FE';
  const dark = '#001848';
  const white = '#FFFFFF';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="64" height="42" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-label="Simple Cruise Parking Logo">
        {/* Superstructure Stripes */}
        <path 
          d="M35 25 C 50 15, 75 12, 95 22" 
          stroke={isWhite ? white : dark} 
          strokeWidth="5" 
          strokeLinecap="round"
        />
        <path 
          d="M30 35 C 45 25, 70 22, 90 32" 
          stroke={isWhite ? white : dark} 
          strokeWidth="5" 
          strokeLinecap="round"
        />
        
        {/* Hull */}
        <path 
          d="M15 50 C 35 42, 70 35, 110 30 L 100 55 C 75 62, 45 62, 20 55 Z" 
          fill={isWhite ? white : dark} 
        />

        {/* Waves */}
        <path 
          d="M20 65 C 40 70, 70 65, 95 60" 
          stroke={isWhite ? white : primary} 
          strokeWidth="4" 
          strokeLinecap="round"
        />
        <path 
          d="M30 74 C 50 79, 80 74, 90 70" 
          stroke={isWhite ? white : primary} 
          strokeWidth="4" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};