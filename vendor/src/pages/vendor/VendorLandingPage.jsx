import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyMotion, domAnimation, m as motion, AnimatePresence } from 'framer-motion';
import { 
  X, Phone, Lock, CheckCircle2, ShieldCheck, CalendarDays,
  TrendingUp, Sparkles, Building2, UserCircle2, ArrowRight, Camera,
  Globe, Wallet, Crosshair, Activity, AlertCircle, BarChart3, Zap
} from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';
import { useVendor } from '../../context/VendorContext';
import { auth } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import Footer from '../../components/layout/Footer';

const ICON_MAP = {
  'Banquet Halls':              '/images/3d_venue copy.webp',
  'Kalyana Mandapams':          '/images/temple_mandap copy.webp',
  'Open Lawns & Farmhouses':    '/images/3d_lawn_farmhouse_1780657291134 copy.webp',
  'Resorts & Destination Venues':'/images/modern_gazebo copy.webp',
  '5-Star Hotels':              '/images/3d_5star_hotel_1780657276128 copy.webp',
  'Party & Mini Halls':         '/images/neon_sangeet_stage copy.webp',
  'Temples & Ashrams':          '/images/temple_mandap copy.webp',
  'Catering Service':           '/images/3d_food copy.webp',
  'Stage & Venue Decor':        '/images/3d_decor copy.webp',
  'Photography & Videography':  '/images/3d_camera copy.webp',
  'DJs & Sound Systems':        '/images/3d_dj copy.webp',
  'Live Musicians / Band Baaja':'/images/3d_band copy.webp',
  'Makeup Artists (MUA)':       '/images/3d_makeup copy.webp',
  'Mehndi Designers':           '/images/3d_mehndi_1780657262687 copy.webp',
  'Wedding Clothes / Boutiques':'/images/3d_clothes copy.webp',
  'Jewelry Shops':              '/images/3d_jewelry copy.webp',
  'Wedding Cards & Invites':    '/images/3d_invitation copy.webp',
  'Cars & Buses (Travel)':      '/images/3d_car copy.webp',
  'Astrologers / Pundits':      '/images/3d_astrologer copy.webp',
  'Honeymoon Packages':         '/images/3d_honeymoon copy.webp',
  'Event Planners':             '/images/3d_planner copy.webp',
};

const VendorLandingPage = () => {
  const navigate = useNavigate();
  const { vendorStatus, loginWithPhone } = useVendor();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (vendorStatus !== 'unregistered') {
      if (vendorStatus === 'draft') navigate('/onboarding');
      else navigate('/dashboard');
    }
  }, [vendorStatus, navigate]);

  useEffect(() => {
    if (showAuthModal && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'vendor-recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {}
      });
    }
  }, [showAuthModal]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setIsLoading(true);
    
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP.");
      if (window.recaptchaVerifier) window.recaptchaVerifier.render().then(id => window.grecaptcha.reset(id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setIsLoading(true);
    
    try {
      const result = await confirmationResult.confirm(otp);
      const res = await loginWithPhone(result.user.phoneNumber);
      if (res.success) {
        if (res.action === 'dashboard') navigate('/dashboard');
        else navigate('/onboarding', { state: { phone: res.phoneNumber } });
      } else {
        alert("Backend sync failed.");
      }
    } catch (error) {
      alert("Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-gold/20 pb-safe">
      
      {/* Dark Apple-style sticky header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto max-w-[1400px] px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center">
             <div className="text-xl font-black text-brand-gold tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                  <span className="text-black font-black text-sm">G.</span>
                </div>
                Gomandap <span className="text-white/70 font-medium text-lg">Business</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://gomandap.com" target="_blank" rel="noopener noreferrer" className="hidden md:block text-[13px] font-bold tracking-wide text-white/50 hover:text-white transition-colors">
              Client Portal
            </a>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="text-[13px] font-bold tracking-wide flex items-center gap-1.5 text-white hover:text-brand-gold transition-colors"
            >
              Vendor Login <UserCircle2 size={16} className="opacity-80" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[120px] pb-24 w-full bg-black overflow-hidden flex flex-col justify-center items-center min-h-[90vh]">
        <img 
          src="/images/temple_background.webp" 
          alt="Premium Event Background" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-105 transform origin-center animate-image-drift"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/80 to-black z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
        
        <div className="relative z-20 w-full max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-[50px] sm:text-[80px] md:text-[110px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FACC15] via-[#D4AF37] to-[#8C7323] tracking-tighter leading-[0.9] mb-4 drop-shadow-2xl">
              Event Pro.
            </h1>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-5xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6"
          >
            The elite network for <br className="hidden md:block" /> Indian event professionals.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl font-medium text-white/60 tracking-wide max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            From grand Kalyana Mandapams to intricate Sangeet decor and elite Photography. <br className="hidden md:block" />
            Connect directly with verified families ready to book your craft.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center w-full mt-10"
          >
            <motion.button 
              whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowAuthModal(true)}
              className="relative overflow-hidden px-8 md:px-14 py-4 md:py-5 bg-gradient-to-b from-[#FACC15]/90 to-[#D4AF37]/80 backdrop-blur-xl border-t-2 border-white/50 border-x border-[#D4AF37]/30 border-b border-black/40 text-black rounded-full font-black text-[16px] md:text-[22px] tracking-wide shadow-[0_20px_40px_rgba(212,175,55,0.4),inset_0_4px_10px_rgba(255,255,255,0.7)] flex flex-row items-center justify-center gap-3 w-fit mx-auto"
            >
              <motion.div 
                className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 filter blur-[2px]"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 2 }}
              />
              <div className="relative z-10 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-black rounded-full shadow-inner border border-white/10">
                <span className="text-white font-bold text-sm md:text-lg tracking-tighter">G.</span>
              </div>
              <span className="relative z-10 drop-shadow-md whitespace-nowrap">Join Business</span>
              <Sparkles size={20} className="relative z-10 text-black/80 drop-shadow-sm hidden sm:block" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: Why Gomandap is Different (The Old Way vs New Way) */}
      <section className="py-24 px-6 bg-black border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[50px] font-black tracking-tighter text-white mb-6 leading-tight">
              A fundamentally <br className="md:hidden" /> different approach.
            </h2>
            <p className="text-lg md:text-xl font-medium text-white/50 max-w-2xl mx-auto">
              We act as your 24/7 digital marketing engine. No middlemen, no forced discounts.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* The Old Way */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 opacity-70">
              <div className="flex items-center gap-3 mb-8">
                <AlertCircle className="text-red-500" size={28} />
                <h3 className="text-2xl font-bold text-white">The Old Way</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <X className="text-red-500 shrink-0 mt-1" size={20} />
                  <p className="text-white/60 font-medium">Aggregators charge massive 15-30% commissions on every booking.</p>
                </li>
                <li className="flex items-start gap-4">
                  <X className="text-red-500 shrink-0 mt-1" size={20} />
                  <p className="text-white/60 font-medium">Your funds are held in escrow for weeks after the event is over.</p>
                </li>
                <li className="flex items-start gap-4">
                  <X className="text-red-500 shrink-0 mt-1" size={20} />
                  <p className="text-white/60 font-medium">You compete on price, forced to offer discounts to win low-budget leads.</p>
                </li>
              </ul>
            </motion.div>

            {/* The Gomandap Way */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 bg-gradient-to-br from-brand-gold/20 to-black backdrop-blur-2xl border border-brand-gold/30 rounded-[2.5rem] p-10 relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="text-brand-gold" size={28} />
                  <h3 className="text-2xl font-bold text-white">The Gomandap Way</h3>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="text-brand-gold shrink-0 mt-1" size={20} />
                    <p className="text-white font-medium text-lg">0% Commission. You negotiate your price and keep every single Rupee.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="text-brand-gold shrink-0 mt-1" size={20} />
                    <p className="text-white font-medium text-lg">Instant direct payouts. You sign the contract directly with the client.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="text-brand-gold shrink-0 mt-1" size={20} />
                    <p className="text-white font-medium text-lg">We bring you high-intent, verified families actively planning high-budget weddings.</p>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: How We Get You More Clients */}
      <section className="py-24 px-6 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[50px] font-black tracking-tighter text-white mb-6 leading-tight">
              How we drive <br className="md:hidden" /> massive growth.
            </h2>
            <p className="text-lg md:text-xl font-medium text-white/50 max-w-2xl mx-auto">
              Our infrastructure is engineered to match your portfolio with the perfect client.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
                  <Crosshair size={28} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Hyper-Local Lead Radar</h3>
                <p className="text-white/60 leading-relaxed font-medium mb-8">
                  When a family in your city searches for your exact category—like Sangeet Decorators in Hyderabad—your 4K portfolio is instantly pushed to the top of their feed. We run localized SEO and targeted ads so you don't have to.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                  <Globe size={28} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">The Digital Marketing Engine</h3>
                <p className="text-white/60 leading-relaxed font-medium mb-8">
                  We invest heavily in digital marketing campaigns targeting couples and families currently planning events. We capture their intent, filter their requirements, and route these premium leads directly to your dashboard.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Smart Calendar & Muhurtham Management */}
      <section className="py-24 px-6 bg-black border-y border-white/10">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white font-bold text-[13px] tracking-wide uppercase mb-6 border border-white/20">
              <CalendarDays size={16} /> Intelligent Scheduling
            </div>
            <h2 className="text-4xl md:text-[56px] font-black tracking-tighter text-white mb-6 leading-[1.05]">
              Master the <br /> Muhurtham rush.
            </h2>
            <p className="text-[19px] font-medium text-white/50 leading-relaxed mb-8">
              The Indian wedding season is frantic. Our Smart Booking Calendar is designed to prevent double-booking disasters. It tracks peak dates, automatically blocks out days when you confirm a booking, and visually maps out your availability for the entire season.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/80 font-medium">
                <CheckCircle2 className="text-brand-gold" size={20} /> Syncs with client inquiries instantly.
              </li>
              <li className="flex items-center gap-3 text-white/80 font-medium">
                <CheckCircle2 className="text-brand-gold" size={20} /> Visual heatmaps of high-demand dates.
              </li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex-1 relative w-full">
            <div className="absolute inset-0 bg-brand-gold/20 blur-[100px] rounded-full"></div>
            <div className="relative bg-[#111111] border border-white/20 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
               {/* Mockup of a Calendar */}
               <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                 <h4 className="text-white font-bold text-lg">August 2026</h4>
                 <div className="flex gap-2">
                   <div className="w-8 h-8 rounded-full bg-white/5"></div>
                   <div className="w-8 h-8 rounded-full bg-white/5"></div>
                 </div>
               </div>
               <div className="grid grid-cols-7 gap-2 text-center text-white/40 text-xs font-bold mb-4">
                 <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
               </div>
               <div className="grid grid-cols-7 gap-2">
                 {[...Array(28)].map((_, i) => (
                   <div key={i} className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm ${[12,13,24].includes(i) ? 'bg-brand-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/80'}`}>
                     {i + 1}
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: Zero Commission & Instant Payouts */}
      <section className="py-32 px-6 bg-gradient-to-br from-[#111111] to-black relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[150px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <div className="w-20 h-20 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <Wallet size={40} className="text-brand-gold" />
          </div>
          <h2 className="text-5xl md:text-[80px] font-black tracking-tighter text-white mb-8 leading-[1.05]">
            0% Commission.<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-300">100% Yours.</span>
          </h2>
          <p className="text-xl md:text-2xl font-medium text-white/60 leading-relaxed max-w-3xl mx-auto mb-12">
            Why should a platform take 20% of your hard-earned booking? Gomandap exists to connect you. Once the connection is made, the negotiation, the contract, and the payouts happen entirely on your terms, directly with the client.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-3">
              <Zap className="text-brand-gold" size={24} />
              <span className="text-white font-bold text-lg">Instant Liquidity</span>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-3">
              <Lock className="text-brand-gold" size={24} />
              <span className="text-white font-bold text-lg">Your Contracts</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: The Pro Dashboard Showcase */}
      <section className="py-32 bg-black border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-gold/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white font-bold text-[13px] tracking-wide uppercase mb-6 border border-white/20">
            <BarChart3 size={16} /> Business Intelligence
          </div>
          <h2 className="text-4xl md:text-[64px] font-black tracking-tighter text-white mb-6 leading-[1.05]">
            The ultimate command center.
          </h2>
          <p className="text-xl font-medium text-white/50 mb-16 max-w-2xl mx-auto">
            Experience an elite vendor dashboard designed for speed, clarity, and total control over your event business.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-16">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <Activity className="text-brand-gold mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Live Analytics</h3>
              <p className="text-white/50 font-medium">Track your profile views, active leads, and estimated monthly revenue in real-time.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <UserCircle2 className="text-brand-gold mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Bento Profile Editor</h3>
              <p className="text-white/50 font-medium">Update your pricing packages and 4K portfolio instantly through an Apple-inspired interface.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <Phone className="text-brand-gold mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Instant Lead Feed</h3>
              <p className="text-white/50 font-medium">View the client's name, event date, and contact details the second they inquire.</p>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, type: "spring" }}
            className="relative mx-auto max-w-5xl bg-[#0A0A0A] rounded-[2.5rem] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] p-4 md:p-8 overflow-hidden group cursor-pointer"
            onClick={() => setShowAuthModal(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            {/* Dashboard Mockup Representation */}
            <div className="w-full aspect-video bg-[#111] rounded-3xl overflow-hidden relative border border-white/5 flex flex-col">
               {/* Mock Header */}
               <div className="h-16 border-b border-white/10 flex items-center px-8 justify-between bg-[#000]">
                 <div className="w-32 h-4 bg-white/20 rounded-full"></div>
                 <div className="w-10 h-10 bg-brand-gold/20 rounded-full"></div>
               </div>
               {/* Mock Content */}
               <div className="flex-1 p-8 grid grid-cols-3 gap-6">
                 <div className="col-span-2 space-y-6">
                   <div className="h-48 bg-gradient-to-br from-brand-gold/20 to-black border border-brand-gold/30 rounded-2xl relative overflow-hidden">
                      <div className="absolute bottom-6 left-6 w-32 h-10 bg-brand-gold rounded-lg"></div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                     <div className="h-32 bg-white/5 rounded-2xl"></div>
                     <div className="h-32 bg-white/5 rounded-2xl"></div>
                   </div>
                 </div>
                 <div className="col-span-1 bg-white/5 rounded-2xl p-6 space-y-4">
                    <div className="h-6 w-1/2 bg-white/20 rounded-full mb-8"></div>
                    <div className="h-16 bg-black rounded-xl"></div>
                    <div className="h-16 bg-black rounded-xl"></div>
                    <div className="h-16 bg-black rounded-xl"></div>
                 </div>
               </div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center border border-brand-gold text-black shadow-[0_0_30px_rgba(212,175,55,0.6)] scale-90 group-hover:scale-110 transition-transform">
                <ArrowRight size={32} />
              </div>
              <span className="mt-4 font-black text-white tracking-widest uppercase text-lg drop-shadow-md">Access Dashboard</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dark Apple Bento Grid (Venues & Artists) */}
      <section className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white">Dominate your category.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[400px]">
          {/* Card 1: Venues */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:col-span-2 relative bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 md:p-16 overflow-hidden border border-white/10 group shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          >
            <div className="relative z-20 md:w-1/2">
              <div className="inline-flex items-center gap-1.5 mb-4 text-brand-gold font-bold tracking-wide text-sm uppercase">
                <Building2 size={16} /> Venue Owners
              </div>
              <h3 className="text-[40px] md:text-[56px] font-black text-white tracking-tighter leading-[1.05] mb-6">
                Fill your <br /> Mandapam.
              </h3>
              <p className="text-[19px] text-white/60 font-medium leading-snug">
                Whether you own a massive Kalyana Mandapam or a luxury destination resort, Gomandap puts your property in front of thousands of couples searching for their dream venue.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-[80%] md:w-[60%] h-[90%] transform translate-x-[10%] translate-y-[10%] group-hover:scale-105 group-hover:-translate-x-[5%] transition-transform duration-700 ease-out">
               <img src="/images/temple_mandap copy.webp" alt="Premium Mandapam" className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" />
            </div>
          </motion.div>

          {/* Card 2: Photographers / Artists */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="relative bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 overflow-hidden border border-white/10 group shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          >
            <div className="relative z-20 h-full flex flex-col">
              <div className="inline-flex items-center gap-1.5 mb-4 text-brand-gold font-bold tracking-wide text-sm uppercase">
                <Camera size={16} /> Creative Artists
              </div>
              <h3 className="text-[32px] md:text-[40px] font-black text-white tracking-tighter leading-tight mb-4">
                Showcase your craft in 4K.
              </h3>
              <p className="text-[17px] text-white/60 font-medium leading-snug mb-8">
                Upload your finest portfolios. Let brides fall in love with your photography, makeup skills, or decor setups instantly.
              </p>
            </div>
            <div className="absolute bottom-0 right-0 w-[70%] h-[60%] translate-x-10 translate-y-10 group-hover:scale-105 transition-transform duration-700">
               <img src="/images/3d_camera copy.webp" alt="Photography Portfolio" className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" />
            </div>
          </motion.div>

          {/* Card 3: Decor & Event Planners */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 overflow-hidden border border-white/10 group shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          >
            <div className="relative z-20 h-full flex flex-col">
              <div className="inline-flex items-center gap-1.5 mb-4 text-brand-gold font-bold tracking-wide text-sm uppercase">
                <Sparkles size={16} /> Decorators & Planners
              </div>
              <h3 className="text-[32px] md:text-[40px] font-black text-white tracking-tighter leading-tight mb-4">
                Design the <br/> unforgettable.
              </h3>
              <p className="text-[17px] text-white/60 font-medium leading-snug">
                From floral arches to neon Sangeet stages, position your event planning and decor business as the premium choice in your city.
              </p>
            </div>
            <div className="absolute bottom-0 right-0 w-[80%] h-[70%] translate-x-10 translate-y-10 group-hover:scale-105 transition-transform duration-700">
               <img src="/images/3d_decor copy.webp" alt="Wedding Decor" className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 21 Categories Matrix Grid */}
      <section className="bg-[#0A0A0A] py-32 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-[48px] font-black tracking-tighter text-white mb-4">A place for every professional.</h2>
            <p className="text-[19px] font-medium text-white/50">Supporting 21 distinct event categories.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
            {CATEGORIES.map((cat, idx) => {
              const imageSrc = ICON_MAP[cat.label] || '/images/3d_venue copy.webp';
              return (
                <div 
                  key={cat.id}
                  onClick={() => setShowAuthModal(true)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-full aspect-square rounded-[1.2rem] bg-white/5 border border-white/10 p-4 md:p-6 mb-3 flex items-center justify-center transition-all duration-300 group-hover:bg-white/10 group-hover:border-brand-gold/30 group-hover:-translate-y-1 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                    <img 
                      src={imageSrc} 
                      alt={cat.label} 
                      className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                  <h4 className="text-[11px] md:text-[13px] font-bold text-white/80 text-center leading-snug px-1 line-clamp-2 group-hover:text-brand-gold transition-colors">{cat.label}</h4>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Golden CTA */}
      <section className="py-32 bg-gradient-to-t from-[#D4AF37]/20 to-black text-center border-t border-brand-gold/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/temple_background.webp')] opacity-5 object-cover mix-blend-screen"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-5xl md:text-[80px] font-black text-white tracking-tighter leading-tight mb-8">
            The future of <br/> Indian events is here.
          </h2>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="px-10 py-5 bg-brand-gold text-black rounded-full font-black text-xl hover:bg-[#FACC15] hover:scale-105 transition-all shadow-[0_0_50px_rgba(212,175,55,0.4)]"
          >
            Claim Your Spot Now
          </button>
        </div>
      </section>

      {/* Dynamic Footer */}
      <Footer />

      {/* Dark Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl">
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-[420px] bg-[#111111] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-10 flex flex-col items-center text-center">
                <div className="mb-6">
                   <div className="w-16 h-16 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)] mx-auto">
                     <span className="text-brand-gold font-black text-2xl tracking-tighter">G.</span>
                   </div>
                </div>
                <h2 className="text-[26px] font-black text-white mb-2 tracking-tight">
                  {step === 'phone' ? 'Sign in to Business' : 'Verification'}
                </h2>
                <p className="text-[15px] text-white/50 font-medium mb-8">
                  {step === 'phone' ? 'Enter your mobile number to continue.' : `Enter the OTP sent to ${phone}`}
                </p>

                <div id="vendor-recaptcha-container"></div>

                <div className="w-full">
                  {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Mobile Number"
                          className="w-full px-4 py-4 bg-black border border-white/10 text-white rounded-2xl outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold font-bold text-[17px] transition-shadow placeholder-white/30 text-center"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="w-full py-4 font-black text-black bg-brand-gold hover:bg-[#FACC15] rounded-2xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-[17px] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      >
                        {isLoading ? 'Sending...' : 'Continue'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="Code"
                          className="w-full px-4 py-4 bg-black border border-white/10 text-white rounded-2xl outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold tracking-[0.5em] text-xl font-black transition-shadow text-center placeholder-white/20"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className="w-full py-4 font-black text-black bg-brand-gold hover:bg-[#FACC15] rounded-2xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-[17px] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      >
                        {isLoading ? 'Verifying...' : 'Sign In'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes image-drift {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.1) translate(-1%, -1%); }
          100% { transform: scale(1.05) translate(0, 0); }
        }
      `}</style>
      </div>
    </LazyMotion>
  );
};

export default VendorLandingPage;
