import React from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Calendar, Users, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart } = useCart();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
      />

      {/* Drawer */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col"
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Briefcase size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-bold">Your cart is empty</p>
              <p className="text-sm">Add venues and vendors to bundle them.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 relative group">
                <img src={item.vendor.imageUrl} alt={item.vendor.name} className="w-20 h-24 object-cover rounded-xl" />
                
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">{item.vendor.category}</span>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 mb-1">{item.vendor.name}</h3>
                  <p className="text-sm font-black text-gray-900 mb-2">{item.vendor.pricePerPlate}</p>
                  
                  {/* Category-Specific Dynamic Metadata Display */}
                  <div className="flex flex-col gap-1 mt-2">
                    {Object.entries(item.bookingDetails || {}).map(([key, value]) => {
                      if (!value) return null;
                      // Display date specially, format others generically
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
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="px-6 pt-6 bg-white border-t border-gray-100 pb-safe">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500 uppercase">Selected Services</span>
              <span className="text-xl font-black text-gray-900">{cartItems.length}</span>
            </div>
            <button className="w-full btn-liquid text-white py-4 rounded-xl font-black text-lg shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all active:scale-95">
              Confirm Bookings
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CartDrawer;
