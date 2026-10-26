import React from 'react';
import { Link } from 'react-router-dom';

export const AuroraLogo = ({ variant = 'light', size = 'default', showText = true }) => {
  // variant: 'light' (for dark navy backgrounds), 'dark' (for ivory/white backgrounds)
  const isLight = variant === 'light';

  const iconSizes = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-14 h-14',
  };

  return (
    <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-lg p-1">
      {/* Custom Luxury Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#E8CCA1" />
              <stop offset="50%" stop-color="#D4AF7C" />
              <stop offset="100%" stop-color="#A77E46" />
            </linearGradient>
            <linearGradient id="logoShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0B1F38" />
              <stop offset="100%" stop-color="#05101E" />
            </linearGradient>
          </defs>

          {/* Background Shield */}
          <rect width="100" height="100" rx="24" fill="url(#logoShieldGrad)" stroke="#D4AF7C" strokeWidth="2" strokeOpacity="0.35" />

          {/* Architectural Aurora Arch */}
          <path
            d="M 50 18 C 68 18 80 32 80 50 C 80 57 78 63 74 68 C 72 65 70 59 70 50 C 70 39 61 30 50 30 C 39 30 30 39 30 50 C 30 59 28 65 26 68 C 22 63 20 57 20 50 C 20 32 32 18 50 18 Z"
            fill="url(#logoGoldGrad)"
            opacity="0.35"
          />

          {/* Stylized Monogram 'A' */}
          <path
            d="M 50 24 L 71 78 L 60 78 L 54 60 L 46 60 L 40 78 L 29 78 Z"
            fill="url(#logoGoldGrad)"
          />
          <polygon points="50,40 44,53 56,53" fill="#0B1F38" />

          {/* Emerald North Star Accent */}
          <circle cx="50" cy="18" r="3" fill="#138B68" />
          <path d="M 50 12 Q 50 18 53 18 Q 50 18 50 24 Q 50 18 47 18 Q 50 18 50 12 Z" fill="#F8F5EF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-serif tracking-[0.2em] font-bold text-lg leading-tight transition-colors ${
              isLight ? 'text-ivory group-hover:text-gold-400' : 'text-navy-900 group-hover:text-gold-600'
            }`}
          >
            AURORA
          </span>
          <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-gold-500 font-semibold leading-none mt-0.5">
            Hotels &amp; Bookings
          </span>
        </div>
      )}
    </Link>
  );
};
