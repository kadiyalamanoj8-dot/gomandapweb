import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { LayoutDashboard, CalendarCheck, TrendingUp, Settings, LogOut, CheckCircle2, Eye, MessageSquare, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const VendorDashboard = () => {
  const { vendorProfile, vendorStatus, logoutVendor } = useVendor();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Protection: Ensure only approved vendors see this
  if (vendorStatus !== 'approved' || !vendorProfile) {
    navigate('/vendor-portal/onboarding');
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
          <h2 className="text-xl font-black text-brand-primary tracking-tight">Gomandap <span className="text-gray-900">Partner</span></h2>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'overview' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'bookings' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <CalendarCheck size={18} /> Bookings
            <span className="ml-auto btn-liquid text-white text-[10px] px-2 py-0.5 rounded-full">1 New</span>
          </button>
          <button 
            onClick={() => setActiveTab('promotions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'promotions' ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-gold'}`}
          >
            <Crown size={18} /> Get Featured Ad
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'profile' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={18} /> My Profile
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Profile Views</span>
                  <div className="bg-green-100 text-green-600 p-1.5 rounded-lg"><TrendingUp size={16} /></div>
                </div>
                <span className="text-3xl font-black text-gray-900">1,248</span>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Booking Leads</span>
                  <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><MessageSquare size={16} /></div>
                </div>
                <span className="text-3xl font-black text-gray-900">14</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 bg-gradient-to-br from-brand-primary/10 to-transparent">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-brand-primary uppercase tracking-wider">Est. Revenue pipeline</span>
                  <div className="bg-brand-gold/20 text-brand-gold p-1.5 rounded-lg"><CheckCircle2 size={16} /></div>
                </div>
                <span className="text-3xl font-black text-brand-primary">₹2.6L</span>
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

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-brand-gold to-yellow-600 rounded-[32px] p-8 md:p-12 text-white shadow-[0_20px_50px_rgba(212,175,55,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold mb-6 border border-white/30 shadow-sm">
                    <Crown size={16} className="text-white" /> Gomandap Premium
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight text-white drop-shadow-md">
                    Become the most <br className="hidden md:block" /> booked vendor in town.
                  </h2>
                  <p className="text-white/90 text-lg font-medium mb-8 max-w-lg leading-relaxed">
                    Stand out with a highly animated, shimmering gold profile card that dominates client search results. 
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 font-bold text-white drop-shadow-sm"><CheckCircle2 className="text-white" /> Top placement in search results</li>
                    <li className="flex items-center gap-3 font-bold text-white drop-shadow-sm"><CheckCircle2 className="text-white" /> Distinct shimmering gold animated card</li>
                    <li className="flex items-center gap-3 font-bold text-white drop-shadow-sm"><CheckCircle2 className="text-white" /> Verified "Sponsored" badge</li>
                  </ul>
                </div>

                <div className="w-full md:w-[350px] bg-white rounded-3xl p-8 text-gray-900 shadow-2xl shrink-0 text-center relative">
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white font-black text-xs uppercase px-3 py-1 rounded-full shadow-lg transform rotate-12">Hot Deal</div>
                  <h3 className="text-xl font-black mb-2">Featured Plan</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-black text-brand-gold tracking-tight">₹2000</span>
                    <span className="text-gray-400 font-bold">/ month</span>
                  </div>
                  <p className="text-sm text-gray-500 font-semibold mb-8">Cancel anytime. Billed monthly.</p>

                  <button className="w-full bg-gradient-to-r from-brand-gold to-yellow-600 hover:from-yellow-500 hover:to-brand-gold text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(212,175,55,0.3)] transition-all hover:-translate-y-1 active:scale-95 text-lg">
                    Subscribe Now
                  </button>
                  <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest">Secure Payment Processing</p>
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
