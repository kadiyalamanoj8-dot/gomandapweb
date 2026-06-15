import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Trash2, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { API_URL } from '../../config/api';

const CartSidebar = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    eventType: 'Wedding',
    clientNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.vendor.pricing?.standardPrice || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        items: cartItems.map(item => ({
          vendorId: item.vendor._id,
          vendorName: item.vendor.name,
          vendorCategory: item.vendor.category,
          serviceDate: item.bookingDetails.date,
          quotedPrice: item.vendor.pricing?.standardPrice || 0
        }))
      };

      await axios.post(`${API_URL}/api/cart-orders`, payload, { withCredentials: true });
      
      setSuccess(true);
      clearCart();
      setTimeout(() => {
        setSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to submit booking request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {success ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                <p className="text-gray-500">Your booking request has been sent to the vendors. They will contact you shortly to confirm.</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Calendar size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-8">Add vendors to your cart to book them all at once.</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Cart Items */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-2xl relative group">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <img 
                            src={item.vendor.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.vendor.name)}&background=random`} 
                            alt={item.vendor.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{item.vendor.name}</h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {item.vendor.locationData?.parsedAddress?.city || 'India'}
                          </p>
                          <p className="text-sm font-semibold text-brand-primary flex items-center gap-1 mt-2">
                            <Calendar size={12} /> {new Date(item.bookingDetails.date).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Your Details</h3>
                      
                      <input 
                        type="text" 
                        required 
                        placeholder="Full Name" 
                        value={formData.clientName}
                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                      
                      <input 
                        type="tel" 
                        required 
                        placeholder="Phone Number" 
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />

                      <textarea 
                        placeholder="Special Requests or Notes" 
                        value={formData.clientNotes}
                        onChange={(e) => setFormData({...formData, clientNotes: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none h-24"
                      />

                      <div className="pt-4 border-t border-gray-100">
                        <button 
                          type="submit" 
                          disabled={loading}
                          className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            `Request Booking for ${cartItems.length} Vendors`
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
