import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const { cartItems, setIsCartOpen } = useCart();
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cartItems.length;

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/saved", icon: Heart, label: "Saved" },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-[90] md:hidden backdrop-blur-md bg-white/5 border border-white/20 rounded-[32px] shadow-[inset_0_2px_20px_rgba(255,255,255,0.6),inset_0_-2px_10px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
      <div className="flex justify-around items-center w-full h-[70px] px-2 relative z-10">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <NavLink 
            key={item.to} 
            to={item.to}
            className="relative flex flex-col items-center justify-center w-16 h-full transition-colors duration-300"
          >
            <item.icon 
              size={22} 
              strokeWidth={isActive ? 3 : 2} 
              className={`transition-all duration-300 ${isActive ? 'text-brand-primary scale-110' : 'text-gray-400'}`} 
            />
            <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}>
              {item.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="bottom-nav-indicator"
                className="absolute -top-[1px] w-8 h-[3px] bg-brand-primary rounded-b-full shadow-[0_0_8px_rgba(230,0,62,0.5)]"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
          </NavLink>
        );
      })}

      {/* Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center w-16 h-full transition-colors duration-300 group"
      >
        <ShoppingCart size={22} strokeWidth={2} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
        {cartCount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white transform scale-110">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] font-bold mt-1 text-gray-400 group-hover:text-brand-primary transition-colors">Cart</span>
      </button>

      {/* Profile Button */}
      <button 
        onClick={() => requireAuth(() => navigate('/profile'))}
        className="relative flex flex-col items-center justify-center w-16 h-full transition-colors duration-300 group"
      >
        {user ? (
          <img 
            src={user.photoUrl || user.profilePicture || user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} 
            alt={user.name || 'Profile'} 
            className="w-6 h-6 rounded-full object-cover border-2 border-transparent group-hover:border-brand-primary transition-colors shadow-sm"
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`; }}
          />
        ) : (
          <User size={22} strokeWidth={2} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
        )}
        <span className="text-[10px] font-bold mt-1 text-gray-400 group-hover:text-brand-primary transition-colors">Profile</span>
        {location.pathname === '/profile' && (
          <motion.div 
            layoutId="bottom-nav-indicator"
            className="absolute -top-[1px] w-8 h-[3px] bg-brand-primary rounded-b-full shadow-[0_0_8px_rgba(230,0,62,0.5)]"
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        )}
      </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
