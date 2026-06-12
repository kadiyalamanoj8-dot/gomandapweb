import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Settings, LogOut, Menu, X,
  Activity, ChevronRight, Bell, Search, Zap, MapPin
} from 'lucide-react';

export default function DashboardLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/app/overview', icon: <LayoutDashboard size={18} />, label: 'Scraper', desc: 'Extract & manage leads' },
    { to: '/app/leads', icon: <Users size={18} />, label: 'Leads Pipeline', desc: 'View & manage leads' },
    { to: '/app/automations', icon: <Zap size={18} />, label: 'Automations', desc: 'Workflows & phone scraper' },
    ...(isAdmin ? [
      { to: '/app/locations', icon: <MapPin size={18} />, label: 'Location Intel', desc: 'AI Geographic Memory' },
      { to: '/app/users', icon: <Users size={18} />, label: 'Users & Credits', desc: 'Manage public marketplace users' },
      { to: '/app/settings', icon: <Settings size={18} />, label: 'Settings', desc: 'Admin configuration' }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex font-sans text-gray-900">

      {/* ── SIDEBAR ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`
          fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100 flex flex-col shadow-lg shadow-gray-100/50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Search size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-lg tracking-tight">OmniLead<span className="text-violet-600">.</span></span>
            </div>
            <button className="md:hidden p-1 text-gray-400 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Main Menu</p>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-violet-50 text-violet-700 shadow-sm shadow-violet-100/50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className={`p-1.5 rounded-lg transition-all group-[.active]:bg-violet-100`}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.label}</p>
                  <p className="text-[10px] text-gray-400 truncate hidden group-hover:block">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gray-50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-md flex-shrink-0">
                {(user?.name || user?.username || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || user?.username || 'Admin'}</p>
                <p className="text-[10px] text-gray-400">{isAdmin ? '● Admin Access' : '● Agent'}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:text-gray-900">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Search size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-base">OmniLead<span className="text-violet-600">.</span></span>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-900 relative">
            <Bell size={18} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
