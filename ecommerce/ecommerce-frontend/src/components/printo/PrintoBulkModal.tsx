'use client';

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  CheckCircle2, 
  Send, 
  Percent, 
  ShieldCheck, 
  PhoneCall 
} from 'lucide-react';

interface PrintoBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintoBulkModal: React.FC<PrintoBulkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    productCategory: 'Corporate Welcome Kits',
    estimatedQuantity: '100 - 500 units',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-[#4A0562] via-[#700895] to-[#8B1FAE] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-purple-950 text-[10px] font-black uppercase tracking-wider mb-2">
            <Percent size={12} />
            <span>Volume Pricing & GST Invoicing</span>
          </div>

          <h3 className="text-xl font-black text-white">
            Request an Instant Bulk Quote
          </h3>
          <p className="text-xs text-purple-100 mt-1">
            Enjoy up to 50% wholesale discounts on orders of 50+ units with dedicated account managers.
          </p>
        </div>

        {/* Modal Body / Form */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Inquiry Received Successfully!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Our Corporate Enterprise Specialist will contact you within <strong>2 business hours</strong> with personalized mockups and discounted pricing.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Innovations"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Product Line of Interest
                  </label>
                  <select
                    value={formData.productCategory}
                    onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895] bg-white"
                  >
                    <option>Corporate Welcome Kits</option>
                    <option>Visiting Cards (Bulk)</option>
                    <option>T-Shirts & Uniforms</option>
                    <option>Mugs & Bottles</option>
                    <option>Custom Boxes & Packaging</option>
                    <option>Exhibition Standees & Banners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Estimated Quantity
                  </label>
                  <select
                    value={formData.estimatedQuantity}
                    onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895] bg-white"
                  >
                    <option>50 - 100 units</option>
                    <option>100 - 500 units</option>
                    <option>500 - 2,500 units</option>
                    <option>2,500+ units</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Additional Notes / Specific Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Need multi-city courier delivery or custom gift box branding..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#700895]/20 focus:border-[#700895]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#700895] hover:bg-[#5A0678] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>Submit Bulk Quotation Request</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" /> Non-Disclosure Protected
                </span>
                <span className="flex items-center gap-1">
                  <PhoneCall size={12} className="text-purple-600" /> Direct Response within 2h
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
