import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const SpatialNavbar = () => {
  const { cartItems, setIsCartOpen } = useCart();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const cartCount = cartItems.length;

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed top-1 sm:top-2 md:top-4 left-0 right-0 mx-auto w-[95%] sm:w-[97%] max-w-7xl z-[300] rounded-[20px] sm:rounded-full glass-panel px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
    >
      <Link to="/" className="flex items-center shrink-0">
        <img src="/logo.svg?v=2" alt="Gomandap Logo" className="h-7 sm:h-8 md:h-10 w-auto object-contain hover:scale-105 transition-transform touch-manipulation" />
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        <Link to="/venues" className="text-sm font-semibold text-gray-700 hover:text-brand-primary transition-colors touch-manipulation">Venues</Link>
        <Link to="/vendors" className="text-sm font-semibold text-gray-700 hover:text-brand-primary transition-colors touch-manipulation">Vendors</Link>
        <Link to="/deals" className="text-sm font-semibold text-gray-700 hover:text-brand-primary transition-colors touch-manipulation">Offers</Link>
        
        <a 
          href="https://vendor.gomandap.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-bold text-gray-600 hover:text-brand-primary transition-colors touch-manipulation"
          title="Register here as an event vendor"
          aria-label="Register here to become a vendor"
        >
          Partner with us
        </a>
        
        {/* Cart Button Desktop */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative text-gray-700 hover:text-brand-primary transition-colors p-2 touch-manipulation"
          aria-label="Shopping Cart"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => requireAuth(() => navigate('/profile'))}
          className="btn-liquid text-white px-4 lg:px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-brand-primary-hover shadow-3d hover:shadow-3d-hover transition-all transform hover:-translate-y-0.5 touch-manipulation"
          aria-label="Go to profile"
        >
          <User size={16} />
          Profile
        </button>
      </div>

      {/* Mobile Profile & Cart Icon */}
      <div className="md:hidden flex items-center gap-1 sm:gap-2">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative text-gray-700 p-1.5 sm:p-2 touch-manipulation"
          aria-label="Shopping Cart"
        >
          <ShoppingCart size={20} className="sm:size-[22px]" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => requireAuth(() => navigate('/profile'))}
          className="bg-brand-primary/10 text-brand-primary p-1.5 sm:p-2 rounded-full hover:bg-brand-primary/20 transition-colors touch-manipulation"
          aria-label="Go to profile"
        >
          <User size={20} className="sm:size-[20px]" />
        </button>
      </div>
    </motion.nav>
  );
};

export default SpatialNavbar;
