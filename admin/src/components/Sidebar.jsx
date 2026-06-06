import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Store, LayoutDashboard, Settings, LogOut, X, Sliders, Globe, Users, Languages } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 lg:w-64 bg-brand-black text-white flex flex-col
        transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Gomandap" className="h-7 w-auto object-contain" />
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Admin</span>
          </div>
          <button
            className="lg:hidden p-2 -mr-2 text-gray-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 mb-2">Management</p>
          <NavLink
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink
            to="/vendors"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Store size={18} /> Vendor Approvals
          </NavLink>

          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 mb-2 mt-6">Configuration</p>
          <NavLink
            to="/category-settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Sliders size={18} /> Category Controls
          </NavLink>
          <NavLink
            to="/clients"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={18} /> Client Panel
          </NavLink>
          <NavLink
            to="/language-settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Languages size={18} /> Language Settings
          </NavLink>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
