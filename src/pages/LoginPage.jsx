import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { AuroraLogo } from '../components/common/AuroraLogo';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useHotel();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login({ email, password });
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: 'Welcome back to Aurora Hotels & Bookings.',
      });

      // Role-based redirection:
      // If administrator, redirect straight to admin dashboard
      if (res.profile?.role === 'admin') {
        navigate('/admin');
      } else {
        const destination = location.state?.from?.pathname || '/';
        navigate(destination);
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-16 flex items-center justify-center text-navy-950 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl border border-gold-500/30 p-8 sm:p-10 shadow-luxury-lg space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <AuroraLogo variant="dark" size="default" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900">
            Sign In to Aurora
          </h1>
          <p className="text-xs text-navy-600">
            Access your reservations, customer profile, and personal preferences.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gold-gradient hover:opacity-95 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating with Firebase...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-navy-950" />
          </button>
        </form>

        <div className="text-center text-xs text-navy-600 pt-3 border-t border-navy-100">
          <span>New guest? </span>
          <Link to="/register" className="text-gold-700 font-bold hover:underline">
            Register Customer Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
