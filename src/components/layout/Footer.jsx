import React from 'react';
import { Link } from 'react-router-dom';
import { AuroraLogo } from '../common/AuroraLogo';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Shield,
  Heart,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-ivory-200 border-t border-gold-500/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <AuroraLogo variant="light" size="default" />
            <p className="text-sm text-ivory-300/80 leading-relaxed">
              Aurora Hotels &amp; Bookings redefines modern hospitality with personalized suites,
              uncompromising comfort, and smart AI-powered stay planning tailored to your exact budget.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-navy-900 border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-white hover:border-gold-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-navy-900 border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-white hover:border-gold-400 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.593 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-navy-900 border border-gold-500/30 flex items-center justify-center text-gold-400 hover:text-white hover:border-gold-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ivory tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-500" />
              Explore Aurora
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/rooms" className="hover:text-gold-400 transition-colors">
                  All Rooms &amp; Suites
                </Link>
              </li>
              <li>
                <Link to="/rooms?category=Single Room" className="hover:text-gold-400 transition-colors">
                  Single Rooms (Solo Travelers)
                </Link>
              </li>
              <li>
                <Link to="/rooms?category=Couple Room" className="hover:text-gold-400 transition-colors">
                  Couple Suites (Honeymoon &amp; Retreats)
                </Link>
              </li>
              <li>
                <Link to="/rooms?category=Friends Room" className="hover:text-gold-400 transition-colors">
                  Friends Rooms (Up to 5 Guests)
                </Link>
              </li>
              <li>
                <Link to="/rooms?category=Meeting Rooms" className="hover:text-gold-400 transition-colors">
                  Meeting Rooms
                </Link>
              </li>
              <li>
                <Link to="/ai-planner" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  AI Budget Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ivory tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-500" />
              Guest Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/customer/bookings" className="hover:text-gold-400 transition-colors">
                  Manage My Reservations
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-gold-400 transition-colors">
                  Our Philosophy &amp; Amenities
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-gold-400 transition-colors">
                  Concierge Support &amp; Inquiries
                </a>
              </li>
              <li className="text-xs text-ivory-400 pt-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Zero Double-Booking Guarantee
              </li>
              <li className="text-xs text-ivory-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                24/7 Front Desk &amp; In-Room Service
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ivory tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-500" />
              Contact &amp; Location
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                <span className="text-ivory-300">
                  Aurora Boulevard, Club Road, Sector F-6, Islamabad, Pakistan
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-ivory-300">+92 (051) 884-2900</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-ivory-300">concierge@aurorahotels.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with mandatory attribution credit */}
        <div className="pt-8 mt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory-400">
          <p>© {new Date().getFullYear()} Aurora Hotels &amp; Bookings. All rights reserved.</p>

          <div className="flex items-center gap-1 text-sm font-medium">
            <span>Designed &amp; Developed by</span>
            <a
              href="https://arsalan-portfolio-pied.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 font-semibold underline decoration-gold-500/40 hover:decoration-gold-300 transition-colors ml-1"
            >
              Arsalan Sher
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
