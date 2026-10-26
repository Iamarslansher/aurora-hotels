import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 text-ivory flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-gold-400/30 border-t-gold-400 animate-spin mx-auto" />
          <p className="font-serif text-sm font-semibold text-gold-300 tracking-wider">
            Verifying Administrative Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in at all -> redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in but NOT an authorized administrator -> render Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-navy-950 text-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-navy-900 border border-red-500/30 rounded-3xl p-8 shadow-luxury-lg text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory">
              Access Restricted
            </h1>
            <p className="text-xs text-ivory-300 mt-2 leading-relaxed">
              Your account ({user.email}) does not hold administrative privileges.
              This area is restricted strictly to authorized hotel management staff.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95"
            >
              <ArrowLeft className="w-4 h-4 text-navy-950" />
              <span>Return to Hotel Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
