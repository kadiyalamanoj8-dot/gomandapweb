import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { 
  LogOut, Eye, CheckCircle2, ChevronRight, Bell, Menu, X, 
  MapPin, TrendingUp, Sparkles, CalendarDays 
} from 'lucide-react';
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Framer Motion Variants for staggered cascade
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-brand-gold/30 relative">
      {/* Immersive Indian Event Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/royal_arch_mandap.webp" 
          alt="Premium Event Background" 
          className="w-full h-full object-cover opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/95"></div>
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
        
        {activeTab === 'overview' && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto">
            
            {/* Dynamic Hero Welcome */}
            <motion.div variants={itemVariants} className="relative w-full h-[280px] md:h-[320px] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl group">
              <img src="/images/temple_mandap copy.webp" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[10s]" alt="Welcome" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2 drop-shadow-lg">Welcome back, {vendorProfile.name.split(' ')[0]}!</h1>
                  <p className="text-xl font-medium text-white/80">Let's make today's events spectacular.</p>
                </div>
                <div className="flex gap-3">
                  <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <Bell size={20} />
                  </button>
                  <button onClick={() => navigate(`/vendor/${vendorProfile.id}`, { state: { vendor: vendorProfile } })} className="flex items-center gap-2 bg-brand-gold px-6 py-3.5 rounded-full text-[15px] font-bold text-[#1D1D1F] hover:bg-yellow-500 transition-colors shadow-lg shadow-brand-gold/20">
                    <Eye size={18} /> View Storefront
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Visual Explanations / Onboarding (Horizontal Scroll) */}
            <motion.div variants={itemVariants} className="mb-12">
              <h3 className="text-2xl font-black text-white mb-6 drop-shadow-sm flex items-center gap-2">
                <Sparkles className="text-brand-gold" /> How Gomandap Powers Your Growth
              </h3>
              <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                
                {/* Card 1: Direct Client Connections */}
                <div className="min-w-[320px] md:min-w-[450px] h-[300px] rounded-[2rem] overflow-hidden relative group snap-start shrink-0 cursor-pointer shadow-xl border border-white/10">
                  <img src="/images/neon_sangeet_stage copy.webp" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700" alt="Connections" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/20 backdrop-blur-md flex items-center justify-center mb-4 border border-brand-gold/30 shadow-lg">
                      <Sparkles className="text-brand-gold" size={20} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 leading-tight">Direct Client Connections</h4>
                    <p className="text-[15px] font-medium text-white/80 leading-relaxed drop-shadow-md">
                      <strong className="text-brand-gold">Your Business, Your Rules.</strong> Say goodbye to middleman escrow holds. Gomandap connects you directly with high-intent clients looking for your exact style. Once the match is made, you handle payments and contracts directly on your own terms. We bring the stage; you own the spotlight.
                    </p>
                  </div>
                </div>

                {/* Card 2: The Smart Booking Calendar */}
                <div className="min-w-[320px] md:min-w-[450px] h-[300px] rounded-[2rem] overflow-hidden relative group snap-start shrink-0 cursor-pointer shadow-xl border border-white/10">
                  <img src="/images/3d_decor copy.webp" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700" alt="Calendar" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 backdrop-blur-md flex items-center justify-center mb-4 border border-blue-500/30 shadow-lg">
                      <CalendarDays className="text-blue-400" size={20} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 leading-tight">The Smart Booking Calendar</h4>
                    <p className="text-[15px] font-medium text-white/80 leading-relaxed drop-shadow-md">
                      <strong className="text-blue-400">Never Miss a Peak Muhurtham.</strong> The Indian event season moves fast. Our smart dashboard tracks your upcoming bookings, available dates, and crew schedules in real-time, helping you maximize your calendar during the busiest wedding seasons without double-booking.
                    </p>
                  </div>
                </div>

                {/* Card 3: Hyper-Local Lead Radar */}
                <div className="min-w-[320px] md:min-w-[450px] h-[300px] rounded-[2rem] overflow-hidden relative group snap-start shrink-0 cursor-pointer shadow-xl border border-white/10">
                  <img src="/images/modern_gazebo copy.webp" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700" alt="Radar" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center mb-4 border border-emerald-500/30 shadow-lg">
                      <MapPin className="text-emerald-400" size={20} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 leading-tight">Hyper-Local Lead Radar</h4>
                    <p className="text-[15px] font-medium text-white/80 leading-relaxed drop-shadow-md">
                      <strong className="text-emerald-400">Real Leads, Right in Your Zone.</strong> No more chasing cold inquiries. Get instant notifications for premium events happening right in your target regions (like grand wedding inquiries, corporate events, or pre-wedding shoots). Your next big booking is just a tap away.
                    </p>
                  </div>
                </div>

                {/* Card 4: Elite Vendor Analytics */}
                <div className="min-w-[320px] md:min-w-[450px] h-[300px] rounded-[2rem] overflow-hidden relative group snap-start shrink-0 cursor-pointer shadow-xl border border-white/10">
                  <img src="/images/3d_camera copy.webp" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700" alt="Analytics" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 backdrop-blur-md flex items-center justify-center mb-4 border border-rose-500/30 shadow-lg">
                      <TrendingUp className="text-rose-400" size={20} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 leading-tight">Elite Vendor Analytics</h4>
                    <p className="text-[15px] font-medium text-white/80 leading-relaxed drop-shadow-md">
                      <strong className="text-rose-400">Watch Your Brand Soar.</strong> Track your profile views, quote downloads, and lead conversion rates through beautiful, easy-to-read visual widgets. See exactly what clients love about your portfolio so you can fine-tune your packages and dominate the market.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Vibrant Data Widgets (Asymmetric layout) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              
              {/* Main Large Widget (Revenue) */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#1A0B05]/90 to-[#3A0000]/90 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-brand-primary/30 shadow-[0_12px_40px_rgb(239,68,68,0.3)] relative overflow-hidden flex flex-col justify-between min-h-[260px] group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-gold/40 to-brand-primary/40 rounded-full blur-[80px] transform translate-x-1/3 -translate-y-1/3 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <span className="text-lg font-bold text-brand-gold mb-1 block">Total Estimated Revenue</span>
                    <span className="text-[13px] font-semibold text-white/50 uppercase tracking-widest">This Month</span>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-black/30 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
                    <TrendingUp className="text-brand-gold" size={24} />
                  </div>
                </div>
                <div className="relative z-10 mt-10 flex items-end gap-4">
                  <span className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg">₹3.2L</span>
                  <span className="text-lg font-bold text-emerald-400 mb-3">+24%</span>
                </div>
              </div>

              {/* Stacked Smaller Widgets */}
              <div className="flex flex-col gap-6">
                <div className="flex-1 bg-black/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group flex items-center justify-between">
                   <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] group-hover:bg-blue-500/30 transition-colors"></div>
                   <div className="relative z-10">
                     <span className="text-sm font-bold text-white/60 uppercase tracking-wider block mb-1">Profile Views</span>
                     <span className="text-4xl font-black text-white">2,481</span>
                   </div>
                   <div className="w-16 h-16 relative z-10">
                     <img src="/images/3d_venue copy.webp" className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform" alt="Views" />
                   </div>
                </div>

                <div className="flex-1 bg-black/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group flex items-center justify-between">
                   <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px] group-hover:bg-emerald-500/30 transition-colors"></div>
                   <div className="relative z-10">
                     <span className="text-sm font-bold text-white/60 uppercase tracking-wider block mb-1">Active Leads</span>
                     <span className="text-4xl font-black text-white">42</span>
                   </div>
                   <div className="w-16 h-16 relative z-10">
                     <img src="/images/3d_invitation copy.webp" className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform" alt="Leads" />
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Ticket-style Leads Feed */}
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                  <CalendarDays className="text-brand-primary" /> Live Inquiries
                </h3>
                <button className="text-[15px] font-bold text-brand-gold hover:text-yellow-400 flex items-center gap-1 transition-colors">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Ticket 1 */}
                <div className="relative bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)] transition-all duration-300">
                  {/* Side Color Bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-primary"></div>
                  {/* Ticket Stamp Background */}
                  <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <CalendarDays size={200} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 text-brand-primary flex items-center justify-center font-black text-xl border border-brand-primary/30 shadow-inner">
                        A
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">Aditya & Sneha's Wedding</h4>
                        <p className="text-sm font-medium text-white/60 flex items-center gap-2">
                          <MapPin size={14} /> Guntur, Andhra Pradesh
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-8">
                      <div className="text-left md:text-right">
                        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Event Date</p>
                        <p className="text-lg font-bold text-white">Nov 24, 2026</p>
                      </div>
                      <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                      <div className="text-left md:text-right">
                         <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[13px] font-bold rounded-full border border-emerald-500/30">
                           <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                           Hot Lead
                         </span>
                      </div>
                      <button className="px-6 py-3 bg-white text-black rounded-xl font-bold text-[15px] hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                        Respond
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ticket 2 */}
                <div className="relative bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)] transition-all duration-300">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-gold"></div>
                  <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <CalendarDays size={200} />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-brand-gold/20 text-brand-gold flex items-center justify-center font-black text-xl border border-brand-gold/30 shadow-inner">
                        M
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">Meera's Sangeet</h4>
                        <p className="text-sm font-medium text-white/60 flex items-center gap-2">
                          <MapPin size={14} /> Hyderabad, Telangana
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-8">
                      <div className="text-left md:text-right">
                        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Event Date</p>
                        <p className="text-lg font-bold text-white">Dec 05, 2026</p>
                      </div>
                      <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                      <div className="text-left md:text-right">
                         <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-500/20 text-blue-400 text-[13px] font-bold rounded-full border border-blue-500/30">
                           Viewed
                         </span>
                      </div>
                      <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-[15px] hover:bg-white/20 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

          </motion.div>
        )}

        {/* Profile Tab Placeholder */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative z-10 max-w-7xl mx-auto">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col items-center justify-center min-h-[400px] text-center relative z-10 max-w-7xl mx-auto">
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
