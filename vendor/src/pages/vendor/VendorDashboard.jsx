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
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1D1D1F] flex relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-100/40 blur-[120px]"></div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50 flex items-center justify-between px-4">
        <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">Gomandap Business</div>
        <button onClick={toggleSidebar} className="p-2 bg-gray-100 rounded-full">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative top-0 left-0 bottom-0 w-[280px] bg-white/80 backdrop-blur-2xl border-r border-gray-200/50 z-50 flex flex-col transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Close button for mobile */}
        <button onClick={toggleSidebar} className="md:hidden absolute top-4 right-4 p-2 text-gray-500">
          <X size={20} />
        </button>

        <div className="p-8 pb-4">
          <div className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">Gomandap Business</div>
        </div>
        
        <div className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'overview' ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-gray-900 border border-gray-100' : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'overview' ? 'scale-110 drop-shadow-md' : 'grayscale-[0.5] opacity-80'}`}>
              <img src="/images/3d_dashboard_icon.png" alt="Overview" className="w-full h-full object-contain" />
            </div>
            Overview
          </button>
          
          <button 
            onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'bookings' ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-gray-900 border border-gray-100' : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'bookings' ? 'scale-110 drop-shadow-md' : 'grayscale-[0.5] opacity-80'}`}>
              <img src="/images/3d_calendar_icon.png" alt="Bookings" className="w-full h-full object-contain" />
            </div>
            Messages
            <span className="ml-auto bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">1</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'profile' ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-gray-900 border border-gray-100' : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'profile' ? 'scale-110 drop-shadow-md' : 'grayscale-[0.5] opacity-80'}`}>
              <img src="/images/3d_settings_icon.png" alt="Profile" className="w-full h-full object-contain" />
            </div>
            Business Profile
          </button>
        </div>

        <div className="p-6 mt-auto">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 shadow-sm flex items-center gap-3 mb-4">
            <img src={vendorProfile.imageUrl || "https://i.pravatar.cc/150"} alt={vendorProfile.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-gray-900 truncate">{vendorProfile.name}</h4>
              <p className="text-[11px] font-semibold text-gray-500 truncate">{vendorProfile.category}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-12 pt-24 md:pt-12 pb-12 overflow-y-auto relative z-10">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-2">Good morning, {vendorProfile.name.split(' ')[0]}</h1>
            <p className="text-lg font-medium text-gray-500">Here’s what’s happening with your business today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-full bg-white border border-gray-200/50 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
              <Bell size={20} />
            </button>
            <button onClick={() => navigate(`/vendor/${vendorProfile.id}`, { state: { vendor: vendorProfile } })} className="flex items-center gap-2 bg-gray-900 px-6 py-3.5 rounded-full text-[15px] font-semibold text-white hover:bg-black transition-colors shadow-lg shadow-gray-900/20">
              <Eye size={18} /> View Storefront
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-10">
            {/* KPI Cards (Apple Business Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex justify-between items-start relative z-10 mb-8">
                  <span className="text-[15px] font-semibold text-gray-500">Total Views</span>
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                    <img src="/images/3d_dashboard_icon.png" className="w-8 h-8 object-contain drop-shadow-sm" alt="Views" />
                  </div>
                </div>
                <div className="relative z-10 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">2,481</span>
                  <span className="text-sm font-bold text-green-500">+14%</span>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex justify-between items-start relative z-10 mb-8">
                  <span className="text-[15px] font-semibold text-gray-500">Active Leads</span>
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <img src="/images/3d_calendar_icon.png" className="w-8 h-8 object-contain drop-shadow-sm" alt="Leads" />
                  </div>
                </div>
                <div className="relative z-10 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">42</span>
                  <span className="text-sm font-bold text-green-500">+5%</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-black p-6 md:p-8 rounded-[2rem] border border-gray-800 shadow-[0_12px_40px_rgb(0,0,0,0.15)] flex flex-col justify-between min-h-[180px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/30 to-rose-500/30 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="flex justify-between items-start relative z-10 mb-8">
                  <span className="text-[15px] font-semibold text-gray-400">Revenue Pipeline</span>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <CheckCircle2 size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="relative z-10">
                  <span className="text-5xl font-bold tracking-tight text-white">₹3.2L</span>
                </div>
              </div>
            </div>

            {/* Recent Leads */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-bold tracking-tight text-gray-900">Recent Inquiries</h3>
                <button className="text-[15px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="p-5 text-[13px] font-semibold text-gray-500">Client</th>
                        <th className="p-5 text-[13px] font-semibold text-gray-500">Event Date</th>
                        <th className="p-5 text-[13px] font-semibold text-gray-500">Est. Value</th>
                        <th className="p-5 text-[13px] font-semibold text-gray-500">Status</th>
                        <th className="p-5 text-[13px] font-semibold text-gray-500 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockBookings.map((req, idx) => (
                        <tr key={req.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="p-5 font-semibold text-gray-900 text-[15px]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{req.client.charAt(0)}</div>
                              {req.client}
                            </div>
                          </td>
                          <td className="p-5 font-medium text-gray-600 text-[15px]">{req.date}</td>
                          <td className="p-5 font-bold text-gray-900 text-[15px]">{req.value}</td>
                          <td className="p-5">
                            <span className={`inline-flex items-center px-3 py-1 text-[13px] font-bold rounded-full ${req.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                              {req.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2"></span>}
                              {req.status === 'Confirmed' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>}
                              {req.status}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <button className="text-[15px] font-bold text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">Respond</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Tab Placeholder */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <img src={vendorProfile.imageUrl || "https://i.pravatar.cc/150"} alt={vendorProfile.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">{vendorProfile.name}</h2>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">{vendorProfile.category}</span>
              </div>
            </div>
             
             <h3 className="text-lg font-bold text-gray-900 mb-4">Public Profile Data</h3>
             <div className="bg-[#F5F5F7] p-6 rounded-[1.5rem] border border-gray-200 shadow-inner">
               <pre className="text-[13px] text-gray-600 font-mono whitespace-pre-wrap leading-relaxed">
                 {JSON.stringify(vendorProfile, null, 2)}
               </pre>
             </div>
             <p className="text-[15px] font-medium text-gray-500 mt-6 text-center">
               (Editing will be enabled when Supabase DB is connected in Phase 11)
             </p>
          </motion.div>
        )}

        {/* Bookings Tab Placeholder */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[400px] text-center">
             <div className="w-32 h-32 mb-6 opacity-80">
               <img src="/images/3d_calendar_icon.png" alt="Messages" className="w-full h-full object-contain" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Message Center</h2>
             <p className="text-lg font-medium text-gray-500 max-w-md">
               Your client inquiries and direct messages will appear here.
             </p>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default VendorDashboard;
