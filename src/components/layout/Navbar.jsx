import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Sparkles,
  User,
  ShieldCheck,
  Calendar,
  LogOut,
  ChevronDown,
  Building,
  UserCheck,
} from 'lucide-react';
import { AuroraLogo } from '../common/AuroraLogo';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'About', path: '/#about' },
    { name: 'AI Planner', path: '/ai-planner', highlight: true },
    { name: 'Contact', path: '/#contact' },
  ];

  const handleNavClick = (path) => {
    if (path.startsWith('/#')) {
      const elementId = path.substring(2);
      if (location.pathname === '/') {
        const el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/${path.substring(1)}`);
      }
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'G';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-950/90 backdrop-blur-md border-b border-gold-500/20 py-3 shadow-luxury'
          : 'bg-gradient-to-b from-navy-950/80 via-navy-950/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <AuroraLogo variant="light" size="default" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-lg flex items-center gap-1.5 ${
                    link.highlight
                      ? 'text-gold-400 hover:text-gold-300 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30'
                      : isActive
                      ? 'text-gold-400 font-semibold'
                      : 'text-ivory-100 hover:text-gold-300'
                  }`}
                >
                  {link.highlight && <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />}
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Auth & User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-navy-800/80 border border-gold-500/30 hover:border-gold-500/60 text-ivory text-sm transition-all focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-navy-950 font-bold text-xs shadow-xs">
                    {userInitials}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-ivory-100 leading-none truncate max-w-[130px]">
                      {userProfile?.fullName || user.displayName || 'Valued Guest'}
                    </p>
                    <span className="text-[10px] text-gold-400 capitalize">
                      {isAdmin ? 'Administrator' : 'Guest Account'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gold-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 rounded-xl bg-navy-900 border border-gold-500/30 shadow-luxury-lg py-2 text-ivory-100 z-50 divide-y divide-navy-800 backdrop-blur-xl"
                    >
                      <div className="px-4 py-2.5">
                        <p className="text-xs text-ivory-400">Signed in as</p>
                        <p className="text-sm font-semibold text-ivory truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full mt-1.5">
                            <ShieldCheck className="w-3 h-3" /> Aurora Administrator
                          </span>
                        )}
                      </div>

                      {/* Customer-Specific vs Admin-Specific Options */}
                      <div className="py-1">
                        {!isAdmin && (
                          <>
                            <Link
                              to="/profile"
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-ivory-200 hover:text-gold-300 hover:bg-navy-800 transition-colors"
                            >
                              <User className="w-4 h-4 text-gold-400" />
                              My Profile
                            </Link>
                            <Link
                              to="/customer/bookings"
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-ivory-200 hover:text-gold-300 hover:bg-navy-800 transition-colors"
                            >
                              <Calendar className="w-4 h-4 text-gold-400" />
                              My Reservations
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-300 hover:text-emerald-200 hover:bg-navy-800 transition-colors"
                          >
                            <Building className="w-4 h-4 text-emerald-400" />
                            Admin Operations Hub
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-navy-800 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ivory-100 hover:text-gold-300 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-navy-950 bg-gold-gradient hover:opacity-95 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ivory hover:text-gold-400 bg-navy-900/60 border border-gold-500/20 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-950/95 border-b border-gold-500/20 px-4 pt-3 pb-6 space-y-3 backdrop-blur-xl"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                    location.pathname === link.path
                      ? 'bg-gold-500/20 text-gold-400'
                      : 'text-ivory hover:bg-navy-900 hover:text-gold-300'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.highlight && <Sparkles className="w-4 h-4 text-gold-400" />}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-navy-800 space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2 bg-navy-900 rounded-lg">
                    <p className="text-xs text-ivory-400">Signed in as</p>
                    <p className="text-sm font-semibold text-ivory truncate">{userProfile?.fullName || user.email}</p>
                    <p className="text-[11px] text-gold-400 mt-0.5">{isAdmin ? 'Administrator' : 'Customer'}</p>
                  </div>

                  {!isAdmin && (
                    <>
                      <Link
                        to="/profile"
                        className="block w-full text-center px-4 py-2.5 rounded-lg bg-navy-900 border border-gold-500/30 text-ivory text-sm font-medium"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/customer/bookings"
                        className="block w-full text-center px-4 py-2.5 rounded-lg bg-navy-900 border border-gold-500/30 text-ivory text-sm font-medium"
                      >
                        My Reservations
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block w-full text-center px-4 py-2.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-sm font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-4 py-2.5 rounded-lg bg-red-950/50 text-red-300 text-sm font-medium border border-red-500/30"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    className="text-center py-2.5 rounded-lg bg-navy-900 border border-navy-700 text-ivory text-sm font-medium"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="text-center py-2.5 rounded-lg bg-gold-gradient text-navy-950 text-sm font-bold shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
