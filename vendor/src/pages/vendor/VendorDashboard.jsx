import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { LogOut, Eye, CheckCircle2, ChevronRight, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorDashboard = () => {
  const { vendorProfile, vendorStatus, logoutVendor } = useVendor();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Protection: Ensure only approved vendors see this
  if (vendorStatus !== 'approved' || !vendorProfile) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logoutVendor();
    navigate('/');
  };

  // Mock booking requests
  const mockBookings = [
    { id: 'BKG-104', client: 'Rahul Sharma', date: 'Oct 15, 2026', status: 'Pending', value: '₹1,50,000' },
    { id: 'BKG-103', client: 'Priya Patel', date: 'Nov 02, 2026', status: 'Confirmed', value: '₹40,000' },
    { id: 'BKG-102', client: 'Anil Desai', date: 'Dec 12, 2026', status: 'Confirmed', value: '₹75,000' }
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-brand-gold/30 relative">
      {/* Immersive Indian Event Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/royal_arch_mandap.webp" 
          alt="Premium Event Background" 
          className="w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-3xl border-b border-white/10 z-50 flex items-center justify-between px-4">
        <div className="text-xl font-black text-brand-gold tracking-tight">
          Gomandap <span className="text-white/70 font-medium ml-1 text-lg">Business</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar (Glassmorphic) */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 w-72 h-[100dvh] bg-black/40 backdrop-blur-3xl border-r border-white/10 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Close button for mobile */}
        <button onClick={toggleSidebar} className="md:hidden absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-8 pb-4">
          <div className="text-2xl font-black text-brand-gold tracking-tight drop-shadow-md">
            Gomandap <span className="text-white/70 font-medium ml-1 text-lg">Business</span>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'overview' ? 'bg-white/10 shadow-lg shadow-black/20 text-white border border-white/20' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'overview' ? 'scale-110 drop-shadow-lg' : 'grayscale-[0.3] opacity-80'}`}>
              <img src="/images/3d_venue copy.webp" alt="Overview" className="w-full h-full object-contain" />
            </div>
            Overview
          </button>
          
          <button 
            onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'bookings' ? 'bg-white/10 shadow-lg shadow-black/20 text-white border border-white/20' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'bookings' ? 'scale-110 drop-shadow-lg' : 'grayscale-[0.3] opacity-80'}`}>
              <img src="/images/3d_invitation copy.webp" alt="Bookings" className="w-full h-full object-contain" />
            </div>
            Messages
            <span className="ml-auto bg-brand-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">1</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'profile' ? 'bg-white/10 shadow-lg shadow-black/20 text-white border border-white/20' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'profile' ? 'scale-110 drop-shadow-lg' : 'grayscale-[0.3] opacity-80'}`}>
              <img src="/images/3d_planner copy.webp" alt="Profile" className="w-full h-full object-contain" />
            </div>
            Business Profile
          </button>
        </div>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg flex items-center gap-3 mb-4 group hover:bg-white/10 transition-colors">
            <img src={vendorProfile.imageUrl || "https://i.pravatar.cc/150"} alt={vendorProfile.name} className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-md group-hover:scale-105 transition-transform" />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{vendorProfile.name}</h4>
              <p className="text-[11px] font-semibold text-brand-gold truncate">{vendorProfile.category}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-12 pt-24 md:pt-12 pb-12 overflow-y-auto relative z-10">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-md">Good morning, {vendorProfile.name.split(' ')[0]}</h1>
            <p className="text-lg font-medium text-white/70">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Bell size={20} />
            </button>
            <button onClick={() => navigate(`/vendor/${vendorProfile.id}`, { state: { vendor: vendorProfile } })} className="flex items-center gap-2 bg-brand-gold px-6 py-3.5 rounded-full text-[15px] font-bold text-[#1D1D1F] hover:bg-yellow-500 transition-colors shadow-lg shadow-brand-gold/20">
              <Eye size={18} /> View Storefront
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-10 relative z-10">
            {/* KPI Cards (Glassmorphic) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex justify-between items-start relative z-10 mb-8">
                  <span className="text-[15px] font-bold text-white/70">Profile Views</span>
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <img src="/images/3d_venue copy.webp" className="w-8 h-8 object-contain drop-shadow-md" alt="Views" />
                  </div>
                </div>
                <div className="relative z-10 flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">2,481</span>
                  <span className="text-sm font-bold text-emerald-400">+14%</span>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex justify-between items-start relative z-10 mb-8">
                  <span className="text-[15px] font-bold text-white/70">Active Leads</span>
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <img src="/images/3d_invitation copy.webp" className="w-8 h-8 object-contain drop-shadow-md" alt="Leads" />
                  </div>
                </div>
                <div className="relative z-10 flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">42</span>
                  <span className="text-sm font-bold text-emerald-400">+5%</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1A0B05]/80 to-[#3A0000]/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-brand-primary/30 shadow-[0_12px_40px_rgb(239,68,68,0.2)] flex flex-col justify-between min-h-[180px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand-gold/30 to-brand-primary/30 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="flex justify-between items-start relative z-10 mb-8">
                  <span className="text-[15px] font-bold text-brand-gold">Est. Revenue</span>
                  <div className="w-12 h-12 rounded-full bg-black/20 border border-white/10 flex items-center justify-center backdrop-blur-md">
                    <CheckCircle2 size={24} className="text-brand-gold" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="relative z-10">
                  <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">₹3.2L</span>
                </div>
              </div>
            </div>

            {/* Recent Leads */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">Recent Inquiries</h3>
                <button className="text-[15px] font-bold text-brand-gold hover:text-yellow-400 flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-widest">Client Name</th>
                        <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-widest">Event Date</th>
                        <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-widest">Status</th>
                        <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="hover:bg-white/5 transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold">A</div>
                            <span className="font-semibold text-white">Aditya & Sneha</span>
                          </div>
                        </td>
                        <td className="p-5 text-[15px] text-white/80 font-medium">Nov 24, 2026</td>
                        <td className="p-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            New Lead
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button className="px-4 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            Respond
                          </button>
                        </td>
                      </tr>
                      {/* More mock rows can go here */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Tab Placeholder */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg overflow-hidden">
                <img src={vendorProfile.imageUrl || "https://i.pravatar.cc/150"} alt={vendorProfile.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white mb-1">{vendorProfile.name}</h2>
                <span className="px-3 py-1 rounded-full bg-white/10 text-brand-gold text-sm font-bold border border-brand-gold/20">{vendorProfile.category}</span>
              </div>
            </div>
             
             <h3 className="text-lg font-bold text-white mb-4">Public Profile Data</h3>
             <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 shadow-inner">
               <pre className="text-[13px] text-white/70 font-mono whitespace-pre-wrap leading-relaxed">
                 {JSON.stringify(vendorProfile, null, 2)}
               </pre>
             </div>
             <p className="text-[15px] font-medium text-white/50 mt-6 text-center">
               (Editing will be enabled when Supabase DB is connected in Phase 11)
             </p>
          </motion.div>
        )}

        {/* Bookings Tab Placeholder */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col items-center justify-center min-h-[400px] text-center relative z-10">
             <div className="w-32 h-32 mb-6 opacity-90 drop-shadow-2xl">
               <img src="/images/3d_invitation copy.webp" alt="Messages" className="w-full h-full object-contain" />
             </div>
             <h2 className="text-2xl font-black tracking-tight text-white mb-2">Message Center</h2>
             <p className="text-lg font-medium text-white/60 max-w-md">
               Your client inquiries and direct messages will appear here.
             </p>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default VendorDashboard;
