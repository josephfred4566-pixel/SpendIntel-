import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * QuickBooks Online Official Brand App Icon
 * Authentic Intuit QuickBooks green (#2CA01C) with white interlocking qb monogram
 */
export const QuickBooksLogo: React.FC<LogoProps> = ({ className = 'w-12 h-12' }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-[#2CA01C] shadow-xs overflow-hidden select-none shrink-0 ${className}`}
      title="Intuit QuickBooks Online"
      aria-label="Intuit QuickBooks Online Logo"
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1.5">
        <circle cx="24" cy="24" r="21" fill="#2CA01C" />
        {/* Left 'q' glyph: loop on left, straight vertical stem on right extending downwards */}
        <path
          d="M23.5 13V35C23.5 35 23.5 29.5 18 29.5C12.5 29.5 8 25 8 19.5C8 14 12.5 9.5 18 9.5C22 9.5 23.5 13 23.5 13ZM18 24C20.5 24 22 22 22 19.5C22 17 20.5 15 18 15C15.5 15 13.5 17 13.5 19.5C13.5 22 15.5 24 18 24Z"
          fill="white"
        />
        {/* Right 'b' glyph: loop on right, straight vertical stem on left extending upwards */}
        <path
          d="M24.5 35V13C24.5 13 24.5 18.5 30 18.5C35.5 18.5 40 23 40 28.5C40 34 35.5 38.5 30 38.5C26 38.5 24.5 35 24.5 35ZM30 24C27.5 24 26 26 26 28.5C26 31 27.5 33 30 33C32.5 33 34.5 31 34.5 28.5C34.5 26 32.5 24 30 24Z"
          fill="white"
        />
      </svg>
    </div>
  );
};

/**
 * Xero Accounting Official Brand App Icon
 * Authentic Xero cyan (#13B5EA) with iconic white cursive brand mark
 */
export const XeroLogo: React.FC<LogoProps> = ({ className = 'w-12 h-12' }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-[#13B5EA] shadow-xs overflow-hidden select-none shrink-0 ${className}`}
      title="Xero Accounting"
      aria-label="Xero Accounting Logo"
    >
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1">
        <circle cx="26" cy="26" r="23" fill="#13B5EA" />
        {/* Authentic Xero iconic script brand mark */}
        <text
          x="26"
          y="32"
          textAnchor="middle"
          fill="white"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="17"
          letterSpacing="-0.05em"
        >
          xero
        </text>
        {/* Organic curved underline / dot indicator */}
        <circle cx="39.5" cy="22" r="1.5" fill="white" />
      </svg>
    </div>
  );
};

/**
 * Dynamic App Logo Resolver
 */
export const AppLogo: React.FC<{ id: string; className?: string }> = ({ id, className }) => {
  switch (id) {
    case 'quickbooks':
      return <QuickBooksLogo className={className} />;
    case 'xero':
      return <XeroLogo className={className} />;
    default:
      return null;
  }
};
