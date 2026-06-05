import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { LayoutDashboard, CalendarCheck, TrendingUp, Settings, LogOut, CheckCircle2, Eye, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const VendorDashboard = () => {
  const { vendorProfile, vendorStatus, logoutVendor } = useVendor();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Protection: Ensure only approved vendors see this
  if (vendorStatus !== 'approved' || !vendorProfile) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logoutVendor();
    navigate('/');
  };

  // Mock booking requests that would normally come from the Cart via Supabase
  const mockBookings = [
    { id: 'BKG-104', client: 'Rahul Sharma', date: 'Oct 15, 2026', status: 'Pending', value: '₹1,50,000' },
    { id: 'BKG-103', client: 'Priya Patel', date: 'Nov 02, 2026', status: 'Confirmed', value: '₹40,000' },
    { id: 'BKG-102', client: 'Anil Desai', date: 'Dec 12, 2026', status: 'Confirmed', value: '₹75,000' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0 flex flex-col h-auto md:min-h-screen sticky top-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <div className="text-2xl font-black text-brand-primary tracking-tight">Gomandap</div>
        </div>
        
        <div className="flex-1 p-4 space-y-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-[24px] font-bold text-sm transition-all duration-300 smooth-transition hover:-translate-y-1 hover:shadow-lg ${activeTab === 'overview' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
          >
            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'overview' ? 'liquid-glass-capsule' : 'bg-gray-100 group-hover:liquid-glass-capsule'}`}>
              <img src="/images/3d_chart.png" alt="Overview" className="w-10 h-10 object-contain drop-shadow-md scale-125 group-hover:scale-150 smooth-transition" />
            </div>
            Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-[24px] font-bold text-sm transition-all duration-300 smooth-transition hover:-translate-y-1 hover:shadow-lg ${activeTab === 'bookings' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
          >
            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'bookings' ? 'liquid-glass-capsule' : 'bg-gray-100 group-hover:liquid-glass-capsule'}`}>
              <img src="/images/3d_envelope.png" alt="Bookings" className="w-10 h-10 object-contain drop-shadow-md scale-125 group-hover:scale-150 smooth-transition" />
            </div>
            Bookings
            <span className="ml-auto bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full">1 New</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-[24px] font-bold text-sm transition-all duration-300 smooth-transition hover:-translate-y-1 hover:shadow-lg ${activeTab === 'profile' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
          >
            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'profile' ? 'liquid-glass-capsule' : 'bg-gray-100 group-hover:liquid-glass-capsule'}`}>
               <Settings size={16} className={activeTab === 'profile' ? 'text-brand-primary' : 'text-gray-500'} />
            </div>
            My Profile
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={vendorProfile.imageUrl} alt={vendorProfile.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            <div className="overflow-hidden">
              <h4 className="text-sm font-black text-gray-900 truncate">{vendorProfile.name}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{vendorProfile.category}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Welcome back, {vendorProfile.name.split(' ')[0]}</h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">Here's what's happening with your business today.</p>
          </div>
          <button onClick={() => navigate(`/vendor/${vendorProfile.id}`, { state: { vendor: vendorProfile } })} className="hidden md:flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:border-brand-primary hover:text-brand-primary transition-colors shadow-sm">
            <Eye size={16} /> View Public Profile
          </button>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group smooth-transition hover:shadow-xl hover:-translate-y-1">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full blur-2xl z-0 pointer-events-none group-hover:scale-150 smooth-transition"></div>
                <div className="flex justify-between items-start relative z-10">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-wider">Profile Views</span>
                  <div className="liquid-glass-capsule w-10 h-10 rounded-full flex items-center justify-center">
                    <img src="/images/3d_chart.png" className="w-12 h-12 object-contain drop-shadow-md scale-125" alt="Chart" />
                  </div>
                </div>
                <span className="text-4xl font-black text-gray-900 relative z-10">1,248</span>
              </div>
              
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group smooth-transition hover:shadow-xl hover:-translate-y-1">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-2xl z-0 pointer-events-none group-hover:scale-150 smooth-transition"></div>
                <div className="flex justify-between items-start relative z-10">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-wider">Booking Leads</span>
                  <div className="liquid-glass-capsule w-10 h-10 rounded-full flex items-center justify-center">
                    <img src="/images/3d_envelope.png" className="w-12 h-12 object-contain drop-shadow-md scale-125" alt="Envelope" />
                  </div>
                </div>
                <span className="text-4xl font-black text-gray-900 relative z-10">14</span>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-brand-primary/20 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group smooth-transition hover:shadow-xl hover:-translate-y-1 liquid-glass-capsule">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-br from-brand-primary/20 to-brand-gold/20 rounded-full blur-2xl z-0 pointer-events-none group-hover:scale-150 smooth-transition"></div>
                <div className="flex justify-between items-start relative z-10">
                  <span className="text-sm font-black text-brand-primary uppercase tracking-wider">Est. Revenue pipeline</span>
                  <div className="bg-brand-gold/20 text-brand-gold w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
                    <CheckCircle2 size={20} strokeWidth={3} />
                  </div>
                </div>
                <span className="text-4xl font-black text-brand-primary relative z-10">₹2.6L</span>
              </div>
            </div>

            {/* Recent Bookings List */}
            <div>
              <h3 className="text-lg font-black text-gray-900 mb-4">Recent Inquiries</h3>
              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Booking ID</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Event Date</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Value</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockBookings.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-bold text-gray-900 text-sm">{req.id}</td>
                          <td className="p-4 font-semibold text-gray-600 text-sm">{req.client}</td>
                          <td className="p-4 font-semibold text-gray-600 text-sm">{req.date}</td>
                          <td className="p-4 font-black text-gray-900 text-sm">{req.value}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${req.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button className="text-sm font-bold text-brand-primary hover:underline">Review</button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
             <h2 className="text-xl font-black text-gray-900 mb-6">Your Public Data</h2>
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
               <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                 {JSON.stringify(vendorProfile, null, 2)}
               </pre>
             </div>
             <p className="text-sm font-semibold text-gray-500 mt-4 text-center">
               (Editing will be enabled when Supabase DB is connected in Phase 11)
             </p>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default VendorDashboard;
