import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const { cartItems, setIsCartOpen } = useCart();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const cartCount = cartItems.length;

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/saved", icon: Heart, label: "Saved" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full glass-panel z-[90] md:hidden border-t-0 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] rounded-t-3xl pb-safe-nav">
      <div className="flex justify-around items-center w-full h-[65px]">
      {navItems.map((item) => (
        <NavLink 
          key={item.to} 
          to={item.to}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${
              isActive ? 'text-brand-primary' : 'text-gray-400'
            }`
          }
        >
          <item.icon size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">{item.label}</span>
        </NavLink>
      ))}

      {/* Custom Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center gap-1 p-2 transition-colors duration-200 text-gray-400 hover:text-brand-primary relative"
      >
        <ShoppingCart size={22} strokeWidth={2.5} />
        {cartCount > 0 && (
          <span className="absolute top-0 right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] font-bold">Cart</span>
      </button>

      {/* Custom Profile Button */}
      <button 
        onClick={() => requireAuth(() => navigate('/profile'))}
        className="flex flex-col items-center gap-1 p-2 transition-colors duration-200 text-gray-400 hover:text-brand-primary"
      >
        <User size={22} strokeWidth={2.5} />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
