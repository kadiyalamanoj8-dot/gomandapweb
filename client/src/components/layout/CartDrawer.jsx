import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Calendar, Users, Briefcase, CheckCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config/api';

const CartDrawer = () => {
  const [formData, setFormData] = useState({ clientName: '', clientPhone: '', clientNotes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart } = useCart();

  const handleSubmit = async () => {
    if (!formData.clientName || !formData.clientPhone) {
      alert('Please fill out your name and phone number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientNotes: formData.clientNotes,
        items: cartItems.map(item => ({
          vendorId: item.vendor.id,
          vendorName: item.vendor.name,
          vendorCategory: item.vendor.category,
          serviceDate: item.bookingDetails?.date || new Date().toISOString(),
          quotedPrice: parseInt(String(item.vendor.pricePerPlate).replace(/[^0-9]/g, ''), 10) || 0
        }))
      };

      const res = await fetch(`${API_URL}/api/cart-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsCartOpen(false);
        cartItems.forEach(item => removeFromCart(item.id));
      }, 3000);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to submit booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[350]"
      />

      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="fixed top-0 right-0 h-[100dvh] w-full md:w-[448px] bg-white shadow-2xl z-[400] flex flex-col"
      >
        <div className="flex justify-between items-center px-6 pb-6 pt-safe border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-900">Your Event Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
            <p className="text-gray-500">Your unified booking request has been sent to all selected vendors. They will contact you shortly.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Briefcase size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-bold">Your cart is empty</p>
                <p className="text-sm">Add venues and vendors to bundle them.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 relative group">
                      <img src={item.vendor.imageUrl} alt={item.vendor.name} className="w-20 h-24 object-cover rounded-xl" />
                      
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">{item.vendor.category}</span>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 mb-1">{item.vendor.name}</h3>
                        <p className="text-sm font-black text-gray-900 mb-2">{item.vendor.pricePerPlate}</p>
                        
                        <div className="flex flex-col gap-1 mt-2">
                          {Object.entries(item.bookingDetails || {}).map(([key, value]) => {
                            if (!value) return null;
                            if (key === 'date') {
                              return (
                                <span key={key} className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                  <Calendar size={12} /> {value}
                                </span>
                              );
                            }
                            return (
                              <span key={key} className="text-[10px] font-bold text-gray-500 flex items-center gap-1 bg-gray-100 w-fit px-2 py-0.5 rounded-md">
                                {value}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="absolute -top-2 -right-2 bg-white border border-gray-200 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                      <Briefcase size={18} className="text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 leading-tight">Where should they contact you?</h3>
                      <p className="text-[11px] font-bold text-gray-500">100% Free Service. No spam.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-semibold focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-semibold focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                    />
                  </div>
                  <textarea 
                    placeholder="Event Details / Special Requirements (Optional)" 
                    value={formData.clientNotes}
                    onChange={(e) => setFormData({...formData, clientNotes: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-semibold focus:outline-none focus:border-brand-primary focus:bg-white transition-colors resize-none h-20"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {!success && cartItems.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-100 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle size={12} className="text-green-500" /> Free Quotes
              </span>
              <span className="text-xs font-bold text-gray-500">{cartItems.length} Vendor{cartItems.length > 1 ? 's' : ''} Selected</span>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-black text-base shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? 'Processing Request...' : 'Send Booking Request'}
            </button>
            <p className="text-center text-[10px] text-gray-400 font-semibold mt-3">
              By requesting, you agree to our Terms of Service & Privacy Policy.
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CartDrawer;
