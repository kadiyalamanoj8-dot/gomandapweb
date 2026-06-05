import React from 'react';
import { NavLink } from 'react-router-dom';
import { Store, LayoutDashboard, Settings, LogOut, X, Sliders } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
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
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-white">Gomandap <span className="text-brand-primary">Admin</span></h1>
          <button 
            className="lg:hidden p-2 -mr-2 text-gray-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink 
            to="/dashboard" 
            onClick={() => setIsOpen(false)}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base lg:text-sm font-bold transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink 
            to="/vendors" 
            onClick={() => setIsOpen(false)}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base lg:text-sm font-bold transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Store size={20} /> Vendor Approvals
          </NavLink>
          <NavLink 
            to="/category-settings" 
            onClick={() => setIsOpen(false)}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base lg:text-sm font-bold transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Sliders size={20} /> Category Controls
          </NavLink>
          <NavLink 
            to="/settings" 
            onClick={() => setIsOpen(false)}
            className={({isActive}) => `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base lg:text-sm font-bold transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-800 pb-safe">
          <button className="flex items-center gap-3 px-4 py-4 lg:py-3 text-base lg:text-sm font-bold text-gray-400 hover:text-red-500 transition-colors w-full">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
