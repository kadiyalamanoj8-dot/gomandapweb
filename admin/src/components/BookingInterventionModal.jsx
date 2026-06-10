import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, IndianRupee, ShieldAlert, CreditCard } from 'lucide-react';

const BookingInterventionModal = ({ booking, onClose, onUpdate }) => {
  const [status, setStatus] = useState(booking.status);
  const [adminOverridePrice, setAdminOverridePrice] = useState(booking.totalAmount || '');
  const [adminNotes, setAdminNotes] = useState(booking.adminQuoteNotes || '');
  const [reason, setReason] = useState(booking.adminInterventionReason || '');
  const [processPayment, setProcessPayment] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      status,
      adminOverridePriceApplied: adminOverridePrice ? Number(adminOverridePrice) : undefined,
      adminQuoteNotes: adminNotes,
      adminInterventionReason: reason,
      processPayment
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <motion.div 
        initial={{ x: '100%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.5 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-[500px] h-full bg-white/80 backdrop-blur-2xl border-l border-white/40 shadow-2xl flex flex-col z-10"
      >
        <div className="px-8 py-6 border-b border-gray-200/50 flex justify-between items-center bg-white/50 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldAlert className="text-brand-primary" size={26} />
              Intervention Hub
            </h2>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Booking ID: <span className="text-gray-900">{booking._id.slice(-8)}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all hover:scale-105 active:scale-95">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 hide-scrollbar">
          {/* Booking Summary */}
          <div className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm mb-8 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vendor</p>
              <p className="font-bold text-gray-900">{booking.vendorId?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Client</p>
              <p className="font-bold text-gray-900">{booking.userId?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type</p>
              <span className={`inline-flex px-2 py-1 rounded-md text-xs font-black uppercase tracking-widest ${booking.userRoleAtBooking === 'b2b' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {booking.userRoleAtBooking}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Value</p>
              <p className="text-xl font-black text-gray-900 leading-none">₹{booking.totalAmount}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Update Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                  <option value="admin_intervention">Admin Intervention</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Override Price (₹)</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={adminOverridePrice}
                    onChange={e => setAdminOverridePrice(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary"
                    placeholder="e.g. 45000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes to Client/Vendor</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary min-h-[80px]"
                placeholder="Notes regarding price changes or quote..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Internal Intervention Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-primary min-h-[80px]"
                placeholder="Why is admin intervening? (Not visible to users)"
              />
            </div>

            {/* Financial Routing Toggle */}
            <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-5 flex items-start gap-4">
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  checked={processPayment}
                  onChange={e => setProcessPayment(e.target.checked)}
                  className="w-5 h-5 accent-brand-primary cursor-pointer"
                  id="processPaymentToggle"
                />
              </div>
              <div>
                <label htmlFor="processPaymentToggle" className="block text-sm font-bold text-gray-900 cursor-pointer">
                  Process Split Payment & Routing
                </label>
                <p className="text-xs font-semibold text-gray-500 mt-1">
                  Checking this will mark the booking as 'paid' and automatically calculate the platform fee and vendor payout based on the vendor's monetization settings (Commission vs Subscription).
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200/50 flex gap-3 sticky bottom-0 bg-white/80 backdrop-blur-md p-4 -mx-8 -mb-8 rounded-b-3xl">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] py-3.5 rounded-xl font-black text-white bg-brand-primary hover:bg-[#d41b4d] shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Save size={18} /> Apply Changes
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingInterventionModal;
