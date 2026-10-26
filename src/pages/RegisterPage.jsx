import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { AuroraLogo } from '../components/common/AuroraLogo';
import { isValidPhone } from '../utils/formatters';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useHotel();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (phone && !isValidPhone(phone)) {
      setError('Please provide a valid Pakistani mobile number (e.g., 0300-1234567).');
      return;
    }

    setLoading(true);

    const res = await signup({ email, password, fullName, phone });
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Account Registered',
        message: 'Welcome to Aurora Hotels & Bookings! You are now signed in.',
      });
      navigate('/');
    } else {
      setError(res.error || 'Registration failed. Please check your information.');
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
            Create Guest Account
          </h1>
          <p className="text-xs text-navy-600">
            Join Aurora for instant reservations, locked rate snapshots, and AI stay curation.
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
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Arsalan Sher"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Mobile Contact *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Create Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
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
            <span>{loading ? 'Registering Guest Profile...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4 text-navy-950" />
          </button>
        </form>

        <p className="text-[11px] text-center text-navy-500">
          By signing up you agree to Aurora's transparent hospitality guidelines.
        </p>

        <div className="text-center text-xs text-navy-600 pt-2 border-t border-navy-100">
          <span>Already registered? </span>
          <Link to="/login" className="text-gold-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
