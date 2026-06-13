import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Search, Users, LogOut, Menu, X, Bell, Zap, Database, ArrowUpCircle
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../apiConfig';

export default function UserDashboardLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState(user?.credits || 0);

  // Poll for credit updates
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.post(`${API_URL}/auth`, { email: user.email });
        if (res.data.user) {
          setCredits(res.data.user.credits);
        }
      } catch(e) { /* ignore */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { to: '/app/scraper', icon: <Search size={18} />, label: 'Lead Engine', desc: 'AI Omni-Scraper' },
    { to: '/app/leads', icon: <Users size={18} />, label: 'My Leads', desc: 'Saved & Unlocked Contacts' },
    { to: '/app/billing', icon: <Zap size={18} />, label: 'Billing & Credits', desc: 'Manage your plan' }
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex font-sans text-white">

      {/* ── SIDEBAR ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`
          fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <Database size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg tracking-tight">Gomandap<span className="text-blue-500">B2B</span></span>
            </div>
            <button className="md:hidden p-1 text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Dashboard</p>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className={`p-1.5 rounded-lg transition-all ${item.to.includes('scraper') && 'text-purple-400'} ${item.to.includes('leads') && 'text-green-400'} ${item.to.includes('billing') && 'text-yellow-400'}`}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.label}</p>
                  <p className="text-[10px] text-white/40 truncate hidden group-hover:block">{item.desc}</p>
                </div>
              </NavLink>
            ))}
          </nav>

          {/* Credits Box */}
          <div className="px-4 mb-4">
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <p className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Available Credits</p>
              <p className="text-2xl font-black text-white">{credits}</p>
              <button onClick={() => navigate('/app/billing')} className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                <ArrowUpCircle size={14} /> Buy Credits
              </button>
            </div>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-sm font-black flex-shrink-0 border border-white/10">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Startup User'}</p>
                <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gradient-to-br from-[#0a0a0a] to-[#000000]">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Database size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base text-white">Gomandap<span className="text-blue-500">B2B</span></span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{credits} CR</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
