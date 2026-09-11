import React from 'react';

interface SpendIntelIconProps {
  className?: string;
  size?: number;
}

/**
 * Compact SpendIntel App Icon
 * Minimalist geometric 'S' with ascending momentum trend vector and intelligence data node
 */
export const SpendIntelIcon: React.FC<SpendIntelIconProps> = ({ 
  className = "w-6 h-6",
  size
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="SpendIntel Icon"
    >
      <defs>
        <linearGradient id="siIconEmerald" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="siIconNavy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Rounded Navy Container Tile */}
      <rect width="32" height="32" rx="8" fill="url(#siIconNavy)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#334155" strokeWidth="1" strokeOpacity="0.8" />

      {/* Lower 'S' Curve Loop */}
      <path
        d="M19 14 C15 15.2 9.5 17 9.5 21.5 C9.5 25.2 12.8 26.8 16.8 26.8 C21.8 26.8 24.5 23.8 24.5 19.8"
        stroke="url(#siIconEmerald)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Upper 'S' Arc with Integrated Upward Trend Vector */}
      <path
        d="M9.5 16 C9.5 12 12.5 8.8 17.5 8.8 L20 8.8 L24.5 6.2"
        stroke="url(#siIconEmerald)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Upward Trend Apex Arrow */}
      <path
        d="M21 5.8 L25 5.8 L25 9.8"
        stroke="#34d399"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Intelligence Data Node */}
      <circle cx="25" cy="5.8" r="1.5" fill="#a7f3d0" />
    </svg>
  );
};

interface SpendIntelLogoProps {
  className?: string;
  showWordmark?: boolean;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Full SpendIntel Brand Logo with Inline Geometric Emblem & Fintech Typography
 */
export const SpendIntelLogo: React.FC<SpendIntelLogoProps> = ({
  className = '',
  showWordmark = true,
  theme = 'light',
  size = 'md',
}) => {
  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Precision Geometric SVG Emblem */}
      <div className="relative shrink-0">
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${emblemSizes[size]} drop-shadow-sm`}
          aria-label="SpendIntel Financial Intelligence Emblem"
        >
          <defs>
            {/* High-Trust Corporate Navy Gradient Tile */}
            <linearGradient id="siNavyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="60%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Financial Velocity Emerald Gradient */}
            <linearGradient id="siEmeraldGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="45%" stopColor="#10b981" />
              <stop offset="85%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>

            {/* Glowing Accent Node Glow */}
            <filter id="siGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Deep Navy Chamfered Geometric Tile */}
          <rect
            x="1"
            y="1"
            width="42"
            height="42"
            rx="11"
            fill="url(#siNavyGradient)"
            stroke="#334155"
            strokeWidth="1.2"
          />

          {/* Subtle Financial Coordinate Grid Points */}
          <circle cx="10" cy="10" r="0.8" fill="#475569" opacity="0.6" />
          <circle cx="34" cy="34" r="0.8" fill="#475569" opacity="0.6" />
          <circle cx="10" cy="34" r="0.8" fill="#475569" opacity="0.6" />

          {/* Bottom Foundation Curve of 'S' */}
          <path
            d="M26 19 C20.5 20.8 13 23 13 29 C13 34 17.5 36 23 36 C29.5 36 33 32 33 26.5"
            stroke="url(#siEmeraldGradient)"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upper 'S' Arc Surging into Upward Growth Vector */}
          <path
            d="M13 21.5 C13 16 17 12 23.5 12 L27.5 12 L33.5 8"
            stroke="url(#siEmeraldGradient)"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upward Growth Arrowhead Vector */}
          <path
            d="M28.5 7.5 L34 7.5 L34 13"
            stroke="#6ee7b7"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Financial Intelligence Node */}
          <circle
            cx="34"
            cy="7.5"
            r="2"
            fill="#a7f3d0"
            filter="url(#siGlowFilter)"
          />
        </svg>

        {/* Ambient Emerald Accent Glow */}
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full blur-[2px] opacity-75 pointer-events-none" />
      </div>

      {/* Typography Brand Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span
              className={`text-xl font-extrabold tracking-tight font-sans ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Spend<span className="text-emerald-500 font-black">Intel</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              PRO
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
            Autonomous Spend Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
