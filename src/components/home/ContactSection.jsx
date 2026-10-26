import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export const ContactSection = () => {
  const { addToast } = useHotel();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      addToast({
        type: 'success',
        title: 'Inquiry Dispatched',
        message: 'Thank you for reaching out. Our Chief Concierge will respond within 2 hours.',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    }, 800);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-ivory text-navy-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-navy-950 text-ivory p-8 sm:p-10 rounded-3xl border border-gold-500/30 shadow-luxury-lg flex flex-col justify-between">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold block">
                At Your Service
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ivory tracking-tight">
                Connect with the Aurora Concierge
              </h2>
              <p className="text-sm text-ivory-300 leading-relaxed">
                Whether you have special dietary preferences, require tailored airport transfers,
                or wish to arrange a private anniversary event, our team is delighted to assist you.
              </p>

              <div className="space-y-4 pt-4 border-t border-navy-800 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-navy-800 border border-gold-500/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-ivory">Aurora Hotel &amp; Suites</p>
                    <p className="text-xs text-ivory-300 mt-0.5">
                      Club Road, Sector F-6, Islamabad, Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-navy-800 border border-gold-500/30 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-ivory">Direct Helpline</p>
                    <p className="text-xs text-ivory-300 mt-0.5">+92 (051) 884-2900 / 0300-AURORA</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-navy-800 border border-gold-500/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-ivory">Electronic Inquiries</p>
                    <p className="text-xs text-ivory-300 mt-0.5">concierge@aurorahotels.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-navy-800 border border-gold-500/30 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-ivory">Front Desk Hours</p>
                    <p className="text-xs text-emerald-300 mt-0.5">24 Hours / 7 Days a Week</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-navy-800 text-xs text-gold-400 font-serif italic">
              "Hospitality is the art of making someone feel deeply at home."
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-gold-500/20 shadow-luxury">
            <h3 className="font-serif text-2xl font-bold text-navy-900 mb-2">
              Send an Inquiry
            </h3>
            <p className="text-sm text-navy-700 mb-6">
              Fill in your details below and our team will get back to you promptly.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-emerald-950">Message Received</h4>
                <p className="text-sm text-emerald-800 max-w-md mx-auto">
                  Thank you for reaching out to Aurora. We have received your message and will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 rounded-xl bg-navy-900 text-ivory text-xs font-semibold hover:bg-navy-800"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arsalan Sher"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm text-navy-950 bg-ivory"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. arsalan@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm text-navy-950 bg-ivory"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0300-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm text-navy-950 bg-ivory"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm text-navy-950 bg-ivory"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Room Reservations">Room Reservations</option>
                      <option value="AI Planner Assistance">AI Planner Assistance</option>
                      <option value="Event / Group Booking">Event / Group Booking</option>
                      <option value="Special Dietary Request">Special Dietary Request</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your dates, preferences, or any specific requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm text-navy-950 bg-ivory"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-gradient hover:opacity-95 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-navy-950" />
                  <span>{submitting ? 'Sending...' : 'Transmit Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
