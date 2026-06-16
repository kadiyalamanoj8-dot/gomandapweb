import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Store, LayoutDashboard, Settings, LogOut, X, Sliders, Globe, Users, Languages, LifeBuoy, Star } from 'lucide-react';
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
          <NavLink
            to="/leads"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={18} /> Leads CRM
          </NavLink>
          <NavLink
            to="/help-requests"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LifeBuoy size={18} /> Expert Help CRM
          </NavLink>
          <NavLink
            to="/marketing"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={18} /> Marketing CRM
          </NavLink>
          <NavLink
            to="/whatsapp-bot"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-green-400'}`}
          >
            <div className="bg-green-500 text-white p-1 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            WhatsApp Bot
          </NavLink>
          <NavLink
            to="/ad-manager"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-brand-gold/20 text-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.15)] border border-brand-gold/30' : 'text-gray-400 hover:bg-white/5 hover:text-brand-gold'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>
            Ad Packages
          </NavLink>
          <a
            href="https://scraper.gomandap.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] mt-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/10 to-violet-600/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <Globe size={18} className="animate-pulse" /> 
            <span>Omni Scraper AI</span>
            <span className="ml-auto text-[9px] uppercase tracking-wider bg-violet-500/20 px-1.5 py-0.5 rounded text-violet-300 border border-violet-500/30">Live</span>
          </a>

          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-4 mb-2 mt-6">Configuration</p>
          <NavLink
            to="/client-ui"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Client UI Settings
          </NavLink>
          <NavLink
            to="/home-content"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Home Content
          </NavLink>
          <NavLink
            to="/event-types"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Event Types
          </NavLink>
          <NavLink
            to="/footer-settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Footer Settings
          </NavLink>
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
          <NavLink
            to="/testimonials"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'btn-liquid text-white shadow-lg shadow-brand-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Star size={18} /> Testimonials
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
