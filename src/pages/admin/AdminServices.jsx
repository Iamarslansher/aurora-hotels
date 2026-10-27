import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Edit,
  Power,
  Utensils,
  Coffee,
  Droplets,
  Moon,
  Wind,
  Car,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { addService, updateService, toggleServiceStatus } from '../../firebase/serviceItemsService';
import { formatPKR } from '../../utils/formatters';

export const AdminServices = () => {
  const { services, refreshServices, addToast } = useHotel();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 1000,
    pricingModel: 'per_person_per_day',
    category: 'Dining',
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: 1000,
      pricingModel: 'per_person_per_day',
      category: 'Dining',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      pricingModel: service.pricingModel || 'flat',
      category: service.category || 'Comfort',
      isActive: service.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await toggleServiceStatus(serviceId, newStatus);
      await refreshServices();
      addToast({
        type: 'info',
        title: 'Service Updated',
        message: `Service status set to ${newStatus ? 'Active' : 'Disabled'}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Error',
        message: err.message,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        pricingModel: formData.pricingModel,
        category: formData.category,
        isActive: formData.isActive,
      };

      if (editingService) {
        await updateService(editingService.id, payload);
        addToast({
          type: 'success',
          title: 'Service Saved',
          message: `${payload.name} modified successfully.`,
        });
      } else {
        await addService(payload);
        addToast({
          type: 'success',
          title: 'Service Created',
          message: `${payload.name} added to catalog.`,
        });
      }

      await refreshServices();
      setModalOpen(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-1">
            Service Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
            Configurable Hospitality Services
          </h1>
          <p className="text-sm text-navy-700/80 mt-1">
            Configure breakfasts, afternoon tea, mineral water, bedding enhancements, and transport pricing models.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95"
        >
          <Plus className="w-4 h-4 text-navy-950" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-gold-500/20 shadow-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-navy-900">
            <thead className="bg-ivory border-b border-navy-100 uppercase tracking-wider text-[11px] text-navy-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Service Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Unit Price</th>
                <th className="px-6 py-4 font-semibold">Pricing Model</th>
                <th className="px-6 py-4 font-semibold">Active Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {services.map((srv) => {
                const isActive = srv.isActive !== false;
                return (
                  <tr key={srv.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-navy-950">{srv.name}</p>
                      <span className="text-xs text-navy-600 line-clamp-1">{srv.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-navy-100 text-navy-800">
                        {srv.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-navy-950">
                      {formatPKR(srv.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-ivory px-2 py-1 rounded border border-navy-200">
                        {srv.pricingModel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(srv)}
                          className="p-1.5 rounded-lg border border-navy-200 hover:bg-gold-50 text-navy-700 hover:text-gold-700"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(srv.id, isActive)}
                          className={`p-1.5 rounded-lg border ${
                            isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={isActive ? 'Disable' : 'Enable'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gold-500/30 p-6 sm:p-8 shadow-luxury-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-navy-100">
              <h2 className="font-serif text-2xl font-bold text-navy-900">
                {editingService ? `Edit ${editingService.name}` : 'Configure New Service'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-navy-600 hover:bg-navy-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Kashmiri Chai & High Tea"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="Dining">Dining</option>
                    <option value="Room Comfort">Room Comfort</option>
                    <option value="Bedding">Bedding</option>
                    <option value="Transport">Transport</option>
                    <option value="Meeting Services">Meeting Services</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Pricing Model *
                </label>
                <select
                  value={formData.pricingModel}
                  onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                >
                  <option value="per_person_per_day">per_person_per_day (Price × Guests × Nights)</option>
                  <option value="per_person">per_person (Price × Guests)</option>
                  <option value="per_night">per_night (Price × Nights)</option>
                  <option value="flat">flat (One-Time Flat Fee)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-xs text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-navy-300 text-navy-700 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-navy-950 text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-95 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
