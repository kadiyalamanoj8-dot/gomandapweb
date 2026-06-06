import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyMotion, domAnimation, m as motion, AnimatePresence } from 'framer-motion';
import { 
  X, Phone, Lock, CheckCircle2, ShieldCheck, 
  TrendingUp, Sparkles, Building2, UserCircle2, ArrowRight
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
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-brand-primary/20 pb-safe">
      
      {/* Apple-style sticky transparent/blur header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-[#1D1D1F]/5 transition-all duration-300">
        <div className="container mx-auto max-w-[1400px] px-6 h-[54px] flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.svg?v=2" alt="Gomandap Business Logo" className="h-7 md:h-8 w-auto object-contain hover:scale-105 transition-transform" />
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://gomandap.com" target="_blank" rel="noopener noreferrer" className="hidden md:block text-[13px] font-medium tracking-wide text-gray-500 hover:text-black transition-colors">
              Client Portal
            </a>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="text-[13px] font-medium tracking-wide flex items-center gap-1.5 text-[#1D1D1F] hover:text-brand-primary transition-colors"
            >
              Vendor Login <UserCircle2 size={16} className="opacity-80" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Apple Pro Style */}
      <section className="relative pt-[120px] pb-24 w-full bg-black overflow-hidden flex flex-col justify-center items-center min-h-[90vh]">
        <img 
          src="/images/temple_background.webp" 
          alt="Premium Event Background" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 scale-105 transform origin-center animate-image-drift"
        />
        {/* Radical Vignette Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/60 to-black z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F7] via-transparent to-transparent z-10"></div>
        
        <div className="relative z-20 w-full max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[60px] sm:text-[90px] md:text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 tracking-tighter leading-[0.9] mb-4 drop-shadow-2xl">
              Event Pro.
            </h1>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-semibold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6"
          >
            The ultimate command center for <br className="hidden md:block" /> Indian event professionals.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl font-medium text-white/70 tracking-wide max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            From grand Kalyana Mandapams to intricate Sangeet decor and elite Photography. <br className="hidden md:block" />
            Connect directly with verified families ready to book your craft.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-white text-black rounded-full font-semibold text-[17px] hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Join Gomandap Business
          </motion.button>
        </div>
      </section>

      {/* Brand Explanation Section */}
      <section className="py-24 px-6 bg-[#F5F5F7] text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-[56px] font-bold tracking-tighter text-[#1D1D1F] mb-6 leading-[1.05]">
          Your craft. <br /> Our connections.
        </h2>
        <p className="text-[21px] md:text-[24px] font-medium text-[#86868B] leading-[1.4] max-w-3xl mx-auto">
          Whether you run a Kalyana Mandapam, offer Bridal Makeup, or design Sangeet Decor, Gomandap connects you directly with families ready to book. Elevate your brand and reach the clients who value your expertise.
        </p>
      </section>

      {/* APPLE BENTO GRID SECTION */}
      <section className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[400px]">
          
          {/* Card 1: Wide (Span 2) - Elite Networking */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:col-span-2 relative bg-white rounded-[2.5rem] p-10 md:p-16 overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow"
          >
            <div className="relative z-20 md:w-1/2">
              <div className="inline-flex items-center gap-1.5 mb-4 text-[#86868B] font-semibold tracking-wide text-sm uppercase">
                <TrendingUp size={16} /> Elite Networking
              </div>
              <h3 className="text-[40px] md:text-[56px] font-bold text-[#1D1D1F] tracking-tighter leading-[1.05] mb-6">
                Unmatched <br /> visibility.
              </h3>
              <p className="text-[19px] text-[#86868B] font-medium leading-snug">
                Connect directly with serious clients planning high-end Indian weddings and grand events. We bridge the gap between top-tier professionals and the families searching for them.
              </p>
            </div>
            {/* Dynamic art for the right side */}
            <div className="absolute top-0 right-0 bottom-0 w-full md:w-1/2 flex justify-end items-center opacity-40 md:opacity-100 p-8 pointer-events-none">
                <div className="relative w-full h-full max-w-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-orange-500/20 rounded-full blur-[60px] animate-pulse"></div>
                    <img src="/images/3d_planner copy.webp" alt="Event Planner" className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] scale-125 translate-x-12" />
                </div>
            </div>
          </motion.div>

          {/* Card 2: Square - Verified Leads */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="relative bg-white rounded-[2.5rem] p-10 overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow flex flex-col justify-between"
          >
            <div className="relative z-20">
              <div className="inline-flex items-center gap-1.5 mb-4 text-[#86868B] font-semibold tracking-wide text-sm uppercase">
                <ShieldCheck size={16} /> Authentic Leads
              </div>
              <h3 className="text-[32px] md:text-[40px] font-bold text-[#1D1D1F] tracking-tighter leading-[1.1] mb-4">
                Real families. <br /> Verified intent.
              </h3>
              <p className="text-[17px] text-[#86868B] font-medium leading-snug">
                Every inquiry is OTP-verified. Spend your time closing meaningful deals, not chasing spam.
              </p>
            </div>
            <div className="relative h-40 mt-8">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-full blur-[30px]"></div>
                <img src="/images/3d_invitation copy.webp" alt="Verified Contacts" className="w-full h-full object-contain object-bottom relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]" />
            </div>
          </motion.div>

          {/* Card 3: Square - Elite Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative bg-[#1D1D1F] rounded-[2.5rem] p-10 overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-shadow flex flex-col justify-between"
          >
            <div className="relative z-20">
              <div className="inline-flex items-center gap-1.5 mb-4 text-[#F5F5F7]/60 font-semibold tracking-wide text-sm uppercase">
                <Building2 size={16} /> Premium Storefront
              </div>
              <h3 className="text-[32px] md:text-[40px] font-bold text-white tracking-tighter leading-[1.1] mb-4">
                Your brand, <br /> elevated.
              </h3>
              <p className="text-[17px] text-[#F5F5F7]/80 font-medium leading-snug">
                Showcase your portfolio, define custom packages, and track analytics on our stunning dashboard.
              </p>
            </div>
            <div className="relative h-40 mt-8">
                <div className="absolute inset-0 bg-gradient-to-t from-[#EF4444]/20 to-transparent rounded-full blur-[30px]"></div>
                <img src="/images/3d_venue copy.webp" alt="Premium Dashboard" className="w-full h-full object-contain object-bottom relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)]" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* 21 Categories Matrix Grid - Apple App Store Style */}
      <section className="bg-white py-32 rounded-t-[3rem] border-t border-gray-200/50 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-[56px] font-bold tracking-tighter text-[#1D1D1F] mb-4">A place for every professional.</h2>
            <p className="text-[21px] font-medium text-[#86868B]">Supporting 21 distinct event categories.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
            {CATEGORIES.map((cat, idx) => {
              const imageSrc = ICON_MAP[cat.label] || '/images/3d_venue copy.webp';
              return (
                <div 
                  key={cat.id}
                  onClick={() => setShowAuthModal(true)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-full aspect-square rounded-[1.2rem] bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-4 md:p-6 mb-3 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] group-hover:-translate-y-1">
                    <img 
                      src={imageSrc} 
                      alt={cat.label} 
                      className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                  <h4 className="text-[11px] md:text-[13px] font-semibold text-[#1D1D1F] text-center leading-snug px-1 line-clamp-2">{cat.label}</h4>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Footer */}
      <Footer />

      {/* Auth Modal (Apple ID Style) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-xl">
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0, scale: 0.98 }} transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-[420px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-[2rem] overflow-hidden"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-10 flex flex-col items-center text-center">
                <div className="mb-6">
                   <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                     <span className="text-white font-bold text-xl tracking-tighter">G.</span>
                   </div>
                </div>
                <h2 className="text-[26px] font-semibold text-[#1D1D1F] mb-2 tracking-tight">
                  {step === 'phone' ? 'Sign in to Business' : 'Verification'}
                </h2>
                <p className="text-[15px] text-[#86868B] font-medium mb-8">
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
                          className="w-full px-4 py-4 bg-white border border-gray-300 text-[#1D1D1F] rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black font-semibold text-[17px] transition-shadow placeholder-gray-400 text-center"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="w-full py-4 font-semibold text-white bg-black hover:bg-gray-800 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-[17px]"
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
                          className="w-full px-4 py-4 bg-white border border-gray-300 text-[#1D1D1F] rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black tracking-[0.5em] text-xl font-bold transition-shadow text-center placeholder-gray-300"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className="w-full py-4 font-semibold text-white bg-black hover:bg-gray-800 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-[17px]"
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
