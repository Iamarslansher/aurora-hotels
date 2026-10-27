import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { getAllBookings } from '../../firebase/bookingService';
import { formatPKR } from '../../utils/formatters';

export const AdminReports = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getAllBookings();
        setBookings(data);
      } catch (err) {
        console.warn('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked-in');
  const grossRevenue = confirmed.reduce(
    (sum, b) => sum + (Number(b.pricingSnapshot?.grandTotal) || 0),
    0
  );

  // Group by category
  const categoryStats = {
    'Single Room': { count: 0, revenue: 0 },
    'Couple Room': { count: 0, revenue: 0 },
    'Friends Room': { count: 0, revenue: 0 },
    'Meeting Rooms': { count: 0, revenue: 0 },
  };

  confirmed.forEach((b) => {
    const cat = b.roomSnapshot?.category;
    if (categoryStats[cat]) {
      categoryStats[cat].count += 1;
      categoryStats[cat].revenue += Number(b.pricingSnapshot?.roomSubtotal) || 0;
    }
  });

  // Services tally
  const serviceTally = {};
  confirmed.forEach((b) => {
    b.servicesSnapshot?.forEach((s) => {
      serviceTally[s.name] = (serviceTally[s.name] || 0) + 1;
    });
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-1">
          Financial Analytics
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
          Reports &amp; Booking Totals
        </h1>
        <p className="text-sm text-navy-700/80 mt-1">
          Revenue performance, room category distribution, and hospitality enhancement popularity.
        </p>
      </div>

      {/* High-level revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gold-500/20 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Total Confirmed Revenue
          </span>
          <div className="font-serif text-3xl font-bold text-navy-950">
            {formatPKR(grossRevenue)}
          </div>
          <p className="text-xs text-emerald-700 font-semibold">100% Locked Price Snapshots</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gold-500/20 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Average Reservation Value
          </span>
          <div className="font-serif text-3xl font-bold text-gold-700">
            {formatPKR(confirmed.length > 0 ? Math.round(grossRevenue / confirmed.length) : 0)}
          </div>
          <p className="text-xs text-navy-500">Across {confirmed.length} active stays</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gold-500/20 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            Booking Fulfillment Rate
          </span>
          <div className="font-serif text-3xl font-bold text-navy-950">
            {bookings.length > 0
              ? `${Math.round((confirmed.length / bookings.length) * 100)}%`
              : '100%'}
          </div>
          <p className="text-xs text-emerald-700 font-semibold">Zero Double-Booking Guarantee</p>
        </div>
      </div>

      {/* Category Breakdown & Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-luxury space-y-6">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gold-600" />
            Category Performance
          </h2>

          <div className="space-y-4">
            {Object.entries(categoryStats).map(([cat, stats]) => {
              const percentage = grossRevenue > 0 ? Math.round((stats.revenue / grossRevenue) * 100) : 0;
              return (
                <div key={cat} className="space-y-1.5 p-4 rounded-xl bg-ivory border border-navy-100">
                  <div className="flex justify-between items-center text-sm font-bold text-navy-950">
                    <span>{cat}</span>
                    <span className="font-serif text-gold-700">{formatPKR(stats.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-navy-600">
                    <span>{stats.count} Reservation{stats.count !== 1 ? 's' : ''}</span>
                    <span>{percentage}% of Room Revenue</span>
                  </div>
                  <div className="w-full bg-navy-200 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-gold-gradient h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Requested Services */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-500/20 shadow-luxury space-y-6">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Hospitality Add-On Adoption
          </h2>

          <div className="space-y-3">
            {Object.keys(serviceTally).length === 0 ? (
              <p className="text-sm text-navy-600 p-4 bg-ivory rounded-xl">
                Add-on services will be logged here as guests customize their reservations.
              </p>
            ) : (
              Object.entries(serviceTally).map(([name, count]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-ivory border border-navy-100 text-xs sm:text-sm font-medium text-navy-900"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {name}
                  </span>
                  <span className="font-bold text-gold-700 bg-gold-50 px-2.5 py-1 rounded-md border border-gold-200">
                    {count} Order{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
