import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { 
  LogOut, Eye, CheckCircle2, ChevronRight, Bell, Menu, X, 
  MapPin, TrendingUp, Sparkles, CalendarDays, Plus, Trash2, ShieldCheck 
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategorySchema } from '../../config/categorySchemas';
import ProfileCard from '../../components/auth/ProfileCard';
import Bookings from '../Bookings';
import { API_URL } from '../../config/api';
import toast, { Toaster } from 'react-hot-toast';

const VendorDashboard = () => {
  const { vendorProfile, vendorStatus, logoutVendor, updateVendorProfile } = useVendor();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    totalRevenue: 0,
    activeLeads: 0
  });

  const fetchInquiriesAndAnalytics = async () => {
    if (!vendorProfile?._id) return;
    const token = localStorage.getItem('vendorToken');
    try {
      // Fetch inquiries
      const resInq = await fetch(`${API_URL}/api/inquiries/vendor/${vendorProfile._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataInq = await resInq.json();
      if (dataInq.success) {
        setInquiries(dataInq.data);
      }
      
      // Fetch analytics
      const resAnalytics = await fetch(`${API_URL}/api/vendors/${vendorProfile._id}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataAnalytics = await resAnalytics.json();
      if (dataAnalytics.success) {
        setAnalytics(dataAnalytics.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  // Initialize edit form when profile is loaded or changes
  useEffect(() => {
    if (vendorProfile && !editForm) {
      setEditForm({
        name: vendorProfile.name || '',
        ownerName: vendorProfile.ownerName || '',
        phone: vendorProfile.contact?.phone || '',
        city: vendorProfile.address?.city || '',
        bio: vendorProfile.bio || '',
        faqs: vendorProfile.faqs || [],
        customBlocks: vendorProfile.customBlocks || { pricingPackages: [] },
        deepFeatures: vendorProfile.deepFeatures || {},
        bookingSettings: vendorProfile.bookingSettings || { maxCapacity: 1, availability: [] },
        pricing: vendorProfile.pricing || { standardPrice: 0, b2bPrice: 0, pricingUnit: 'per_day' }
      });
      fetchInquiriesAndAnalytics();
    }
  }, [vendorProfile]);

  const schema = getCategorySchema(vendorProfile?.category);

  const handleAddPackage = () => {
    setEditForm(prev => ({
      ...prev,
      customBlocks: {
        ...prev.customBlocks,
        pricingPackages: [...(prev.customBlocks?.pricingPackages || []), { title: '', price: '', desc: '' }]
      }
    }));
  };

  const handleRemovePackage = (index) => {
    setEditForm(prev => ({
      ...prev,
      customBlocks: {
        ...prev.customBlocks,
        pricingPackages: prev.customBlocks.pricingPackages.filter((_, i) => i !== index)
      }
    }));
  };

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...(editForm.customBlocks?.pricingPackages || [])];
    newPackages[index][field] = value;
    setEditForm(prev => ({
      ...prev,
      customBlocks: { ...prev.customBlocks, pricingPackages: newPackages }
    }));
  };

  const handleFeatureToggle = (feature) => {
    const currentFeatures = { ...editForm.deepFeatures };
    if (currentFeatures[feature] === "Yes") {
      delete currentFeatures[feature];
    } else {
      currentFeatures[feature] = "Yes";
    }
    setEditForm(prev => ({ ...prev, deepFeatures: currentFeatures }));
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          category: vendorProfile.category,
          city: editForm.city,
          experience: 'Professional vendor with great experience.'
        })
      });
      const data = await res.json();
      if (res.ok && data.bio && data.faqs) {
        setEditForm(prev => ({
          ...prev,
          bio: data.bio,
          faqs: data.faqs
        }));
        toast.success('Bio and FAQs successfully generated using AI!');
      } else {
        toast.error('AI Generation failed. Ensure API key is set in backend.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while generating AI content.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: editForm.name,
        ownerName: editForm.ownerName,
        contact: { ...vendorProfile.contact, phone: editForm.phone },
        address: { ...vendorProfile.address, city: editForm.city },
        bio: editForm.bio,
        faqs: editForm.faqs,
        customBlocks: editForm.customBlocks,
        deepFeatures: editForm.deepFeatures,
        bookingSettings: editForm.bookingSettings,
        pricing: editForm.pricing
      };

      const res = await fetch(`${API_URL}/api/vendors/draft/${vendorProfile._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        updateVendorProfile(data.data);
        setIsEditingProfile(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

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
      <Toaster position="top-right" />
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
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'overview' ? 'bg-brand-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)] text-brand-gold border border-brand-gold/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'overview' ? 'scale-110 drop-shadow-lg' : 'grayscale-[0.3] opacity-80'}`}>
              <img src="/images/3d_venue copy.webp" alt="Overview" className="w-full h-full object-contain" />
            </div>
            Overview
          </button>
          
          <button 
            onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'bookings' ? 'bg-brand-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)] text-brand-gold border border-brand-gold/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'bookings' ? 'scale-110 drop-shadow-lg' : 'grayscale-[0.3] opacity-80'}`}>
              <img src="/images/3d_invitation copy.webp" alt="Bookings" className="w-full h-full object-contain" />
            </div>
            Leads & Inquiries
            {inquiries.filter(i => i.status === 'new').length > 0 && (
              <span className="ml-auto bg-brand-gold text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">
                {inquiries.filter(i => i.status === 'new').length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'profile' ? 'bg-brand-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)] text-brand-gold border border-brand-gold/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'profile' ? 'scale-110 drop-shadow-lg' : 'grayscale-[0.3] opacity-80'}`}>
              <img src="/images/3d_planner copy.webp" alt="Profile" className="w-full h-full object-contain" />
            </div>
            Business Profile
          </button>
          
          <button 
            onClick={() => { setActiveTab('verification'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${activeTab === 'verification' ? 'bg-brand-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)] text-brand-gold border border-brand-gold/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${activeTab === 'verification' ? 'scale-110 drop-shadow-lg' : 'grayscale-[0.3] opacity-80'}`}>
              <ShieldCheck className="text-white" size={24} />
            </div>
            Verification Status
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
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-colors border border-transparent hover:border-brand-gold/20">
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
                  <button onClick={() => navigate(`/vendor/${vendorProfile.id}`, { state: { vendor: vendorProfile } })} className="flex items-center gap-2 bg-brand-gold px-6 py-3.5 rounded-full text-[15px] font-bold text-[#1D1D1F] hover:bg-brand-gold transition-colors shadow-lg shadow-brand-gold/20">
                    <Eye size={18} /> View Storefront
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Vibrant Data Widgets (Asymmetric layout) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              
              {/* Main Large Widget (Revenue) */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#000000]/90 to-[#111111]/90 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-brand-gold/30 shadow-[0_12px_40px_rgb(239,68,68,0.3)] relative overflow-hidden flex flex-col justify-between min-h-[260px] group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-gold/40 to-brand-gold/40 rounded-full blur-[80px] transform translate-x-1/3 -translate-y-1/3 group-hover:opacity-80 transition-opacity"></div>
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
                  <span className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg">₹{analytics.totalRevenue ? (analytics.totalRevenue / 100000).toFixed(1) + 'L' : '0'}</span>
                  <span className="text-lg font-bold text-white/80 mb-3">Total</span>
                </div>
              </div>

              {/* Stacked Smaller Widgets */}
              <div className="flex flex-col gap-6">
                <div className="flex-1 bg-black/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group flex items-center justify-between">
                   <div className="absolute -left-10 -top-10 w-32 h-32 bg-brand-gold/20 rounded-full blur-[50px] group-hover:bg-brand-gold/30 transition-colors"></div>
                   <div className="relative z-10">
                     <span className="text-sm font-bold text-white/60 uppercase tracking-wider block mb-1">Profile Views</span>
                     <span className="text-4xl font-black text-white">{analytics.profileViews || 0}</span>
                   </div>
                   <div className="w-16 h-16 relative z-10">
                     <img src="/images/3d_venue copy.webp" className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform" alt="Views" />
                   </div>
                </div>

                <div className="flex-1 bg-black/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group flex items-center justify-between">
                   <div className="absolute -left-10 -top-10 w-32 h-32 bg-brand-gold/20 rounded-full blur-[50px] group-hover:bg-brand-gold/30 transition-colors"></div>
                   <div className="relative z-10">
                     <span className="text-sm font-bold text-white/60 uppercase tracking-wider block mb-1">Active Leads</span>
                     <span className="text-4xl font-black text-white">{analytics.newInquiries || inquiries.length || 0}</span>
                   </div>
                   <div className="w-16 h-16 relative z-10">
                     <img src="/images/3d_invitation copy.webp" className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform" alt="Leads" />
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Ticket-style Leads Feed */}
            <motion.div variants={itemVariants} className="mb-12">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                  <CalendarDays className="text-brand-gold" /> Live Inquiries
                </h3>
                <button onClick={() => setActiveTab('bookings')} className="text-[15px] font-bold text-brand-gold hover:text-brand-gold flex items-center gap-1 transition-colors">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                {inquiries.slice(0, 3).map((inquiry) => (
                  <div key={inquiry._id} className="relative bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)] transition-all duration-300">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${inquiry.status === 'new' ? 'bg-brand-gold' : 'bg-brand-gold'}`}></div>
                    <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                      <CalendarDays size={200} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${inquiry.status === 'new' ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/30' : 'bg-brand-gold/20 text-brand-gold border-brand-gold/30'} flex items-center justify-center font-black text-xl border shadow-inner`}>
                          {inquiry.clientName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white mb-1">{inquiry.clientName}'s Inquiry</h4>
                          <p className="text-sm font-medium text-white/60 flex items-center gap-2">
                            <MapPin size={14} /> Contact: {inquiry.clientPhone}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-8">
                        <div className="text-left md:text-right">
                          <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Event Date</p>
                          <p className="text-lg font-bold text-white">{new Date(inquiry.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                        <div className="text-left md:text-right">
                          {inquiry.status === 'new' ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-gold/20 text-brand-gold text-[13px] font-bold rounded-full border border-brand-gold/30">
                              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                              New Lead
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-gold/20 text-brand-gold text-[13px] font-bold rounded-full border border-brand-gold/30">
                              Viewed
                            </span>
                          )}
                        </div>
                        <button onClick={() => setActiveTab('bookings')} className="px-6 py-3 bg-white text-black rounded-xl font-bold text-[15px] hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                          Respond
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {inquiries.length === 0 && (
                  <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                    <p className="text-white/40 font-semibold mb-2">No live inquiries yet.</p>
                    <p className="text-white/20 text-sm">Your new leads will appear here automatically.</p>
                  </div>
                )}
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
                    <div className="w-12 h-12 rounded-full bg-brand-gold/20 backdrop-blur-md flex items-center justify-center mb-4 border border-brand-gold/30 shadow-lg">
                      <CalendarDays className="text-white/80" size={20} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 leading-tight">The Smart Booking Calendar</h4>
                    <p className="text-[15px] font-medium text-white/80 leading-relaxed drop-shadow-md">
                      <strong className="text-white/80">Never Miss a Peak Muhurtham.</strong> The Indian event season moves fast. Our smart dashboard tracks your upcoming bookings, available dates, and crew schedules in real-time, helping you maximize your calendar during the busiest wedding seasons without double-booking.
                    </p>
                  </div>
                </div>

                {/* Card 3: Hyper-Local Lead Radar */}
                <div className="min-w-[320px] md:min-w-[450px] h-[300px] rounded-[2rem] overflow-hidden relative group snap-start shrink-0 cursor-pointer shadow-xl border border-white/10">
                  <img src="/images/modern_gazebo copy.webp" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700" alt="Radar" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/20 backdrop-blur-md flex items-center justify-center mb-4 border border-brand-gold/30 shadow-lg">
                      <MapPin className="text-white/80" size={20} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 leading-tight">Hyper-Local Lead Radar</h4>
                    <p className="text-[15px] font-medium text-white/80 leading-relaxed drop-shadow-md">
                      <strong className="text-white/80">Real Leads, Right in Your Zone.</strong> No more chasing cold inquiries. Get instant notifications for premium events happening right in your target regions (like grand wedding inquiries, corporate events, or pre-wedding shoots). Your next big booking is just a tap away.
                    </p>
                  </div>
                </div>

                {/* Card 4: Elite Vendor Analytics */}
                <div className="min-w-[320px] md:min-w-[450px] h-[300px] rounded-[2rem] overflow-hidden relative group snap-start shrink-0 cursor-pointer shadow-xl border border-white/10">
                  <img src="/images/3d_camera copy.webp" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700" alt="Analytics" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/20 backdrop-blur-md flex items-center justify-center mb-4 border border-brand-gold/30 shadow-lg">
                      <TrendingUp className="text-brand-gold" size={20} />
                    </div>
                    <h4 className="text-2xl font-black text-white mb-2 leading-tight">Elite Vendor Analytics</h4>
                    <p className="text-[15px] font-medium text-white/80 leading-relaxed drop-shadow-md">
                      <strong className="text-brand-gold">Watch Your Brand Soar.</strong> Track your profile views, quote downloads, and lead conversion rates through beautiful, easy-to-read visual widgets. See exactly what clients love about your portfolio so you can fine-tune your packages and dominate the market.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>

          </motion.div>
        )}

        {/* Bookings / Leads Tab */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
            <Bookings />
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 max-w-4xl mx-auto space-y-8">
            <ProfileCard 
              user={vendorProfile} 
              onLogout={handleLogout} 
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              onCancel={() => {
                setIsEditingProfile(false);
                setEditForm({
                  name: vendorProfile.name || '',
                  ownerName: vendorProfile.ownerName || '',
                  phone: vendorProfile.contact?.phone || '',
                  city: vendorProfile.address?.city || '',
                });
              }}
              onSave={handleSaveProfile}
              isSaving={isSaving}
            />
             
            <div className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] border border-white/10 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Business Name</label>
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-1 focus:ring-brand-gold/50 transition-all"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-white bg-black/20 rounded-xl px-4 py-3 border border-transparent">{vendorProfile.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Owner Name</label>
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={editForm.ownerName} 
                      onChange={e => setEditForm({...editForm, ownerName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-1 focus:ring-brand-gold/50 transition-all"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-white bg-black/20 rounded-xl px-4 py-3 border border-transparent">{vendorProfile.ownerName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Contact Phone</label>
                  {isEditingProfile ? (
                    <input 
                      type="tel" 
                      value={editForm.phone} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-1 focus:ring-brand-gold/50 transition-all"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-white bg-black/20 rounded-xl px-4 py-3 border border-transparent">{vendorProfile.contact?.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">City</label>
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={editForm.city} 
                      onChange={e => setEditForm({...editForm, city: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-1 focus:ring-brand-gold/50 transition-all"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-white bg-black/20 rounded-xl px-4 py-3 border border-transparent">{vendorProfile.address?.city}</div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Generator / Bio & FAQs */}
            <div className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] border border-white/10 shadow-inner mt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white">About & FAQs</h3>
                {isEditingProfile && (
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-brand-gold/20 text-brand-gold border border-brand-gold/30 rounded-xl font-bold text-sm hover:from-purple-500/30 hover:to-brand-gold/30 transition-all shadow-lg"
                  >
                    <Sparkles size={16} /> {isGeneratingAI ? 'Generating...' : 'Auto-Generate via AI'}
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Vendor Bio</label>
                    <textarea 
                      value={editForm.bio} 
                      onChange={e => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-1 focus:ring-brand-gold/50 transition-all min-h-[120px]"
                      placeholder="Write a beautiful description about your services..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Frequently Asked Questions (JSON format)</label>
                    <textarea 
                      value={typeof editForm.faqs === 'string' ? editForm.faqs : JSON.stringify(editForm.faqs, null, 2)} 
                      onChange={e => {
                        try {
                          setEditForm({...editForm, faqs: JSON.parse(e.target.value)});
                        } catch {
                          setEditForm({...editForm, faqs: e.target.value});
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-1 focus:ring-brand-gold/50 transition-all min-h-[150px] font-mono text-sm"
                      placeholder='[{"q": "How far in advance should we book?", "a": "At least 3 months."}]'
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Vendor Bio</h4>
                    <p className="text-sm text-white/80 leading-relaxed bg-black/20 rounded-xl px-4 py-3 border border-transparent">
                      {vendorProfile.bio || "No bio added yet."}
                    </p>
                  </div>
                  {vendorProfile.faqs && vendorProfile.faqs.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">FAQs</h4>
                      <div className="bg-black/20 rounded-xl p-4 space-y-3">
                        {vendorProfile.faqs.map((faq, i) => (
                          <div key={i}>
                            <strong className="text-white text-sm">{faq.q}</strong>
                            <p className="text-white/60 text-sm mt-1">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Features Editor */}
            {schema?.featuresList && (
              <div className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] border border-white/10 shadow-inner mt-6">
                <h3 className="text-lg font-black text-white mb-4">Service Features & Amenities</h3>
                {isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schema.featuresList.map((feature, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={editForm.deepFeatures?.[feature] === "Yes"}
                          onChange={() => handleFeatureToggle(feature)}
                          className="w-5 h-5 accent-brand-gold bg-white/5 border border-white/10 rounded cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-white/80">{feature}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(vendorProfile.deepFeatures || {}).map(([key, value], i) => 
                      value === "Yes" && (
                        <span key={i} className="px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-sm font-semibold text-white/80">
                          {key}
                        </span>
                      )
                    )}
                    {(!vendorProfile.deepFeatures || Object.keys(vendorProfile.deepFeatures).length === 0) && (
                      <span className="text-sm font-semibold text-white/40">No features specified yet.</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Base Pricing & Calendar Settings */}
            <div className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] border border-white/10 shadow-inner mt-6 space-y-8">
              
              {/* Base Pricing Structure */}
              <section>
                <h3 className="text-lg font-black text-white mb-4">Base Pricing Structure</h3>
                {isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Standard Price (D2C)</label>
                      <input type="number" value={editForm.pricing.standardPrice} onChange={e => setEditForm({...editForm, pricing: {...editForm.pricing, standardPrice: Number(e.target.value)}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-brand-gold font-bold text-sm focus:outline-none focus:border-brand-gold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">B2B Price (Agencies)</label>
                      <input type="number" value={editForm.pricing.b2bPrice} onChange={e => setEditForm({...editForm, pricing: {...editForm.pricing, b2bPrice: Number(e.target.value)}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-brand-gold font-bold text-sm focus:outline-none focus:border-brand-gold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Pricing Unit</label>
                      <select value={editForm.pricing.pricingUnit} onChange={e => setEditForm({...editForm, pricing: {...editForm.pricing, pricingUnit: e.target.value}})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-brand-gold">
                        <option value="per_day" className="bg-gray-900">Per Day</option>
                        <option value="per_event" className="bg-gray-900">Per Event</option>
                        <option value="per_hour" className="bg-gray-900">Per Hour</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                      <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Standard (D2C)</span>
                      <span className="text-lg font-black text-white">₹{vendorProfile.pricing?.standardPrice || 0}</span>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                      <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">B2B Price</span>
                      <span className="text-lg font-black text-brand-gold">₹{vendorProfile.pricing?.b2bPrice || 0}</span>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                      <span className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Unit</span>
                      <span className="text-lg font-black text-white capitalize">{vendorProfile.pricing?.pricingUnit?.replace('_', ' ') || 'Per Day'}</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Availability Calendar (Simplified) */}
              <section className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-black text-white mb-4">Availability Calendar</h3>
                {isEditingProfile ? (
                  <div>
                    <div className="flex gap-4 mb-4">
                      <input 
                        type="date" 
                        id="blockDateInput"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-gold" 
                      />
                      <button 
                        onClick={() => {
                          const dateVal = document.getElementById('blockDateInput').value;
                          if (!dateVal) return;
                          setEditForm({
                            ...editForm,
                            bookingSettings: {
                              ...editForm.bookingSettings,
                              availability: [...(editForm.bookingSettings.availability || []), { date: new Date(dateVal), isBlocked: true }]
                            }
                          });
                        }}
                        className="px-4 py-2 bg-brand-gold/20 text-brand-gold rounded-xl font-bold text-sm hover:bg-brand-gold/30 transition-colors"
                      >
                        Block Date
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.bookingSettings?.availability?.map((av, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-semibold">
                          {new Date(av.date).toLocaleDateString()}
                          <button onClick={() => {
                            const newAv = [...editForm.bookingSettings.availability];
                            newAv.splice(i, 1);
                            setEditForm({...editForm, bookingSettings: {...editForm.bookingSettings, availability: newAv}});
                          }} className="hover:text-red-300"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {vendorProfile.bookingSettings?.availability?.length > 0 ? (
                      vendorProfile.bookingSettings.availability.map((av, i) => (
                        <div key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-semibold">
                          Blocked: {new Date(av.date).toLocaleDateString()}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-white/40">No dates blocked. Fully available.</span>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Pricing Packages Editor */}
            <div className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] border border-white/10 shadow-inner mt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white">Pricing Packages</h3>
                {isEditingProfile && (
                  <button onClick={handleAddPackage} className="flex items-center gap-2 px-4 py-2 bg-brand-gold/20 text-brand-gold rounded-xl font-bold text-sm hover:bg-brand-gold/30 transition-colors">
                    <Plus size={16} /> Add Package
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  {editForm.customBlocks?.pricingPackages?.map((pkg, i) => (
                    <div key={i} className="bg-black/40 p-5 rounded-2xl border border-white/10 relative group">
                      <button onClick={() => handleRemovePackage(i)} className="absolute top-4 right-4 p-2 text-brand-gold/50 hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Package Name</label>
                          <input type="text" value={pkg.title} onChange={e => handlePackageChange(i, 'title', e.target.value)} placeholder="e.g. Standard Decor" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-gold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Price</label>
                          <input type="text" value={pkg.price} onChange={e => handlePackageChange(i, 'price', e.target.value)} placeholder="e.g. ₹50,000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-brand-gold font-bold text-sm focus:outline-none focus:border-brand-gold" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Description / What's Included</label>
                        <input type="text" value={pkg.desc} onChange={e => handlePackageChange(i, 'desc', e.target.value)} placeholder="e.g. Stage setup, mandap flowers, and entrance arch" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-brand-gold" />
                      </div>
                    </div>
                  ))}
                  {(!editForm.customBlocks?.pricingPackages || editForm.customBlocks.pricingPackages.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-2xl">
                      <p className="text-sm font-semibold text-white/40 mb-2">No packages added yet.</p>
                      <button onClick={handleAddPackage} className="text-brand-gold font-bold text-sm hover:underline">Create your first package</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendorProfile.customBlocks?.pricingPackages?.map((pkg, i) => (
                    <div key={i} className="bg-black/30 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-black text-white">{pkg.title}</h4>
                        <span className="text-sm font-black text-brand-gold">{pkg.price}</span>
                      </div>
                      <p className="text-sm font-semibold text-white/60">{pkg.desc}</p>
                    </div>
                  ))}
                  {(!vendorProfile.customBlocks?.pricingPackages || vendorProfile.customBlocks.pricingPackages.length === 0) && (
                    <span className="text-sm font-semibold text-white/40 col-span-2">No packages specified yet.</span>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-[13px] font-medium text-white/40 mt-8 text-center border-t border-white/10 pt-6">
              More advanced editing options (pricing, features, portfolio images) will be available in future updates.
            </p>
          </motion.div>
        )}

        {/* Bookings / Leads Tab */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] min-h-[500px] relative z-10 max-w-7xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight text-white mb-8 flex items-center gap-3">
              <CalendarDays className="text-brand-gold" size={32} /> Leads & Inquiries
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {inquiries.map(inquiry => (
                <div key={inquiry._id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${inquiry.status === 'new' ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' : 'bg-gray-500/20 text-gray-400'}`}>
                        {inquiry.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{inquiry.clientName}</h4>
                        <div className="flex items-center gap-3 text-sm font-semibold text-white/50 mt-1">
                          <span className="flex items-center gap-1"><Icons.Phone size={14}/> {inquiry.clientPhone}</span>
                          <span className="flex items-center gap-1"><CalendarDays size={14}/> {new Date(inquiry.eventDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {inquiry.status === 'new' && (
                      <span className="bg-brand-gold/20 text-brand-gold text-xs font-bold px-3 py-1 rounded-full border border-brand-gold/30">NEW</span>
                    )}
                  </div>
                  
                  <div className="bg-black/30 rounded-xl p-4 mb-4 border border-white/5">
                    <p className="text-white/80 font-medium whitespace-pre-wrap text-sm leading-relaxed">
                      {inquiry.message}
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/5 flex gap-4 text-xs font-semibold text-brand-gold">
                      {inquiry.eventType && <span>Event: {inquiry.eventType}</span>}
                      {inquiry.guestCount && <span>Guests: {inquiry.guestCount}</span>}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <a 
                      href={`tel:${inquiry.clientPhone}`}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                    >
                      <Icons.Phone size={14} /> Call Client
                    </a>
                    <a 
                      href={`https://wa.me/91${inquiry.clientPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
                    >
                      <Icons.MessageCircle size={14} /> WhatsApp
                    </a>
                  </div>
                </div>
              ))}

              {inquiries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="w-24 h-24 mb-6 opacity-50 drop-shadow-2xl grayscale">
                     <img src="/images/3d_invitation copy.webp" alt="Messages" className="w-full h-full object-contain" />
                   </div>
                   <h3 className="text-xl font-black text-white/50 mb-2">No leads yet</h3>
                   <p className="text-white/40 font-medium">When clients request a quote on your storefront, they will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Verification Status Tab */}
        {activeTab === 'verification' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] min-h-[500px] relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight text-white mb-8 flex items-center gap-3">
              <ShieldCheck className="text-brand-gold" size={32} /> Verification Status
            </h2>
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Business Verification</h3>
                  <p className="text-sm font-medium text-white/50">Your documents are reviewed to ensure trust and safety.</p>
                </div>
                {vendorProfile.isVerified ? (
                  <span className="bg-green-500/20 text-green-400 font-bold px-4 py-2 rounded-full border border-green-500/30 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Verified
                  </span>
                ) : vendorProfile.documents && vendorProfile.documents.length > 0 ? (
                  <span className="bg-yellow-500/20 text-yellow-400 font-bold px-4 py-2 rounded-full border border-yellow-500/30 flex items-center gap-2">
                    <Icons.Clock size={16} /> Pending Review
                  </span>
                ) : (
                  <span className="bg-red-500/20 text-red-400 font-bold px-4 py-2 rounded-full border border-red-500/30 flex items-center gap-2">
                    <X size={16} /> Not Verified
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Uploaded Documents</h4>
                {vendorProfile.documents && vendorProfile.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendorProfile.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                            <Icons.FileText size={16} className="text-brand-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase">{doc.type}</p>
                            <p className="text-xs text-brand-gold font-semibold">Under Review</p>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                          <Icons.ExternalLink size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-white/10">
                    <p className="text-sm text-white/50 mb-4">No documents uploaded yet.</p>
                    <button className="text-brand-gold font-bold text-sm hover:underline" onClick={() => setActiveTab('profile')}>Upload in Profile</button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Completion Score */}
            <div className="mt-8 bg-brand-gold/10 rounded-2xl p-6 border border-brand-gold/20">
              <h3 className="text-lg font-black text-brand-gold mb-4">Profile Completion</h3>
              <div className="w-full bg-black/40 rounded-full h-3 mb-2 overflow-hidden">
                <div className="bg-brand-gold h-3 rounded-full" style={{ width: `${vendorProfile.documents?.length > 0 ? '90%' : '60%'}` }}></div>
              </div>
              <p className="text-sm font-medium text-brand-gold/80">
                {vendorProfile.documents?.length > 0 ? 'Your profile is almost complete! Waiting for verification.' : 'Upload your verification documents to reach 100% completion and get the Verified badge.'}
              </p>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default React.memo(VendorDashboard);
