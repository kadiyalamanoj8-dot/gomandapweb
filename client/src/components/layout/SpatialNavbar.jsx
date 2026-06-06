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
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed top-4 left-1/2 w-[95%] max-w-7xl z-[300] rounded-full glass-panel px-6 py-3 md:py-4 flex justify-between items-center"
    >
      <Link to="/" className="flex items-center">
        <img src="/logo.svg?v=2" alt="Gomandap Logo" className="h-8 md:h-10 w-auto object-contain hover:scale-105 transition-transform" />
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link to="/venues" className="text-sm font-semibold text-gray-700 hover:text-brand-primary transition-colors">Venues</Link>
        <Link to="/vendors" className="text-sm font-semibold text-gray-700 hover:text-brand-primary transition-colors">Vendors</Link>
        <Link to="/deals" className="text-sm font-semibold text-gray-700 hover:text-brand-primary transition-colors">Offers</Link>
        
        <a 
          href="https://vendor.gomandap.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-bold text-gray-600 hover:text-brand-primary transition-colors"
          title="Register here as an event vendor"
          aria-label="Register here to become a vendor"
        >
          Partner with us
        </a>
        
        {/* Cart Button Desktop */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative text-gray-700 hover:text-brand-primary transition-colors p-2"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => requireAuth(() => navigate('/profile'))}
          className="btn-liquid text-white px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-brand-primary-hover shadow-3d hover:shadow-3d-hover transition-all transform hover:-translate-y-0.5"
        >
          <User size={16} />
          Profile
        </button>
      </div>

      {/* Mobile Profile & Cart Icon */}
      <div className="md:hidden flex items-center gap-3">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative text-gray-700 p-2"
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => requireAuth(() => navigate('/profile'))}
          className="bg-brand-primary/10 text-brand-primary p-2 rounded-full hover:bg-brand-primary/20 transition-colors"
        >
          <User size={20} />
        </button>
      </div>
    </motion.nav>
  );
};

export default SpatialNavbar;
