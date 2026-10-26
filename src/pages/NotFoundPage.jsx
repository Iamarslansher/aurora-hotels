import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { AuroraLogo } from '../components/common/AuroraLogo';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-navy-950 text-ivory flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <AuroraLogo variant="light" size="large" />
        </div>
        <span className="font-serif text-8xl font-bold text-transparent bg-clip-text bg-gold-gradient block">
          404
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory">
          Page Not Found
        </h1>
        <p className="text-sm text-ivory-300">
          The sanctuary or suite you are searching for does not seem to exist or has moved.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center gap-2"
          >
            <Home className="w-4 h-4 text-navy-950" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
