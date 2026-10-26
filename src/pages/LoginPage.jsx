import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { AuroraLogo } from '../components/common/AuroraLogo';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, quickDemoLogin } = useAuth();
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
        title: 'Welcome Back',
        message: 'Successfully signed into Aurora Hotels & Bookings.',
      });
      navigate('/');
    } else {
      setError(res.error || 'Failed to authenticate. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleQuickDemo = (role) => {
    quickDemoLogin(role);
    addToast({
      type: 'info',
      title: 'Demo Session Active',
      message: `Signed in as ${role === 'admin' ? 'Aurora Administrator' : 'Guest Traveler'}.`,
    });
    navigate(role === 'admin' ? '/admin' : '/');
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
            Access your bookings, itinerary details, and member preferences.
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="guest@aurorahotels.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Password
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
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-navy-950" />
          </button>
        </form>

        {/* 1-Click Evaluator Buttons */}
        <div className="pt-4 border-t border-navy-100 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 block text-center">
            Instant Evaluator Demo Access:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="py-2 px-3 rounded-xl bg-ivory hover:bg-gold-50 border border-gold-200 text-navy-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-navy-600">
          <span>New guest? </span>
          <Link to="/register" className="text-gold-700 font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
