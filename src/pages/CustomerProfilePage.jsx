import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  Lock,
  Save,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { getUserBookings } from '../firebase/bookingService';
import { getUserReviews } from '../firebase/reviewService';
import { isValidPhone } from '../utils/formatters';

export const CustomerProfilePage = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateProfileData, changeUserPassword, resetUserPassword, logout } = useAuth();
  const { addToast } = useHotel();

  // Profile Edit State
  const [fullName, setFullName] = useState(userProfile?.fullName || user?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Statistics & shortcuts
  const [bookingsCount, setBookingsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || user?.displayName || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile, user]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) return;
      setLoadingStats(true);
      try {
        const [bookings, reviews] = await Promise.all([
          getUserBookings(user.uid),
          getUserReviews(user.uid),
        ]);
        setBookingsCount(bookings.length);
        setReviewsCount(reviews.length);
      } catch (err) {
        console.error('Error fetching profile statistics:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchCustomerData();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    if (phone && !isValidPhone(phone)) {
      setProfileError('Please enter a valid mobile number (e.g. 0300-1234567).');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfileData({ fullName, phone });
      setProfileSuccess('Profile details successfully saved.');
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information was updated in Firestore.',
      });
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await changeUserPassword(newPassword);
      setPasswordSuccess('Your password has been changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
      addToast({
        type: 'success',
        title: 'Security Updated',
        message: 'Password successfully changed in Firebase Auth.',
      });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. You may need to re-login.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    try {
      await resetUserPassword(user.email);
      addToast({
        type: 'info',
        title: 'Reset Link Dispatched',
        message: `A password reset link was sent to ${user.email}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reset Error',
        message: err.message,
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userInitials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'G';

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-20 text-navy-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Profile Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gold-500/20 shadow-luxury flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar with Initials */}
            <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center text-navy-950 font-serif font-bold text-2xl shadow-gold-glow shrink-0 border-2 border-white">
              {userInitials}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900">
                  {fullName || 'Valued Guest'}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold-50 text-gold-700 border border-gold-300">
                  Customer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-navy-600 mt-1">{user?.email}</p>
              <p className="text-xs text-navy-500 mt-0.5">
                Member ID: <span className="font-mono text-navy-700">{user?.uid?.slice(0, 10)}...</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Shortcuts & Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            to="/customer/bookings"
            className="bg-white p-6 rounded-2xl border border-gold-500/20 shadow-sm hover:border-gold-400 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-200 flex items-center justify-center text-navy-900">
                <Calendar className="w-6 h-6 text-gold-600" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-navy-950 group-hover:text-gold-700 transition-colors">
                  My Reservations
                </p>
                <p className="text-xs text-navy-600">
                  {loadingStats ? 'Loading...' : `${bookingsCount} booking${bookingsCount !== 1 ? 's' : ''} on record`}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gold-600 transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="#reviews"
            onClick={(e) => {
              e.preventDefault();
              navigate('/customer/bookings');
            }}
            className="bg-white p-6 rounded-2xl border border-gold-500/20 shadow-sm hover:border-gold-400 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
                <Star className="w-6 h-6 text-gold-600 fill-gold-600" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-navy-950 group-hover:text-gold-700 transition-colors">
                  My Guest Reviews
                </p>
                <p className="text-xs text-navy-600">
                  {loadingStats ? 'Loading...' : `${reviewsCount} verified review${reviewsCount !== 1 ? 's' : ''} submitted`}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gold-600 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Two Columns: Edit Profile & Password Security */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Edit Profile Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-luxury space-y-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2">
                <User className="w-5 h-5 text-gold-600" />
                Edit Profile Information
              </h2>
              <p className="text-xs text-navy-600 mt-1">
                Update your contact information. These details will prefill your reservation forms.
              </p>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Email Address (Firebase Account)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-500 bg-navy-50/60 cursor-not-allowed"
                  />
                </div>
                <span className="text-[11px] text-navy-500">
                  Your primary authentication email cannot be changed directly here.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Mobile Contact Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-navy-950" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password & Security Panel */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-luxury space-y-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gold-600" />
                Password &amp; Security
              </h2>
              <p className="text-xs text-navy-600 mt-1">
                Update your login password or request a reset email via Firebase.
              </p>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-ivory font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>

            <div className="pt-4 border-t border-navy-100 text-center">
              <button
                type="button"
                onClick={handleSendResetEmail}
                className="text-xs text-gold-700 hover:text-gold-800 font-semibold underline transition-colors"
              >
                Send Password Reset Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
