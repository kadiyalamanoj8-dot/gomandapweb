import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, X, Phone, Lock, CheckCircle2, ShieldCheck, 
  MapPin, TrendingUp, Sparkles, Building2, UserCircle2 
} from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';
import { useVendor } from '../../context/VendorContext';
import { auth } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

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
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans selection:bg-brand-primary/20">
      
      {/* Apple-style sticky transparent/blur header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFD]/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
        <div className="container mx-auto max-w-[1400px] px-6 h-[60px] flex items-center justify-between">
          <div className="text-xl font-black text-brand-primary tracking-tight">
            Gomandap <span className="text-gray-500 font-medium ml-1 text-lg">Business</span>
          </div>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="text-[13px] font-semibold tracking-wide flex items-center gap-2 hover:text-brand-primary transition-colors"
          >
            Vendor Login <UserCircle2 size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section - Full bleed majestic event photo */}
      <section className="relative pt-[60px] h-[95vh] w-full bg-black overflow-hidden flex flex-col justify-between">
        <img 
          src="/images/royal_arch_mandap.webp" 
          alt="Premium Event" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 scale-105 transform origin-center animate-image-drift"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FBFBFD] z-10"></div>
        
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-tight max-w-5xl"
          >
            Gomandap for Business.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-3xl font-semibold text-gray-200 tracking-tight max-w-3xl mb-12"
          >
            The premium platform for India’s elite event creators.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6 }}
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
          >
            Start your journey
          </motion.button>
        </div>
      </section>

      {/* Brand Explanation Section */}
      <section className="py-32 px-6 bg-[#FBFBFD] text-center max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#1D1D1F] mb-8 leading-[1.1]">
          Why the best vendors <br /> choose Gomandap.
        </h2>
        <p className="text-xl md:text-2xl font-medium text-[#86868B] leading-relaxed max-w-4xl mx-auto">
          We built Gomandap because the wedding industry needed a platform that respects the vendor. No hidden fees. No stolen leads. We give you direct access to high-intent clients who are ready to book the best in the business.
        </p>
      </section>

      {/* Apple-Style Bento Grid for Marketing -> REPLACED WITH PROFESSIONAL ZIG-ZAG 3D ICON EXPLANATIONS */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="space-y-32">
          
          {/* Feature 1: Zero Commission */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center gap-12 md:gap-20"
          >
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-[80px]"></div>
                <img 
                  src="/images/3d_planner copy.webp" 
                  alt="Zero Commission" 
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]" 
                />
              </div>
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold font-bold text-xs uppercase tracking-wider mb-6">
                <TrendingUp size={16} /> 0% Commission
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-[#1D1D1F] tracking-tight mb-6 leading-tight">Keep 100% of<br/>your hard work.</h3>
              <p className="text-xl text-[#86868B] font-medium leading-relaxed">
                We don't take a cut of your success. Close deals directly with clients and keep your entire profit margin. Gomandap is built to grow your business, not tax it.
              </p>
            </div>
          </motion.div>

          {/* Feature 2: Verified Leads */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20"
          >
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[80px]"></div>
                <img 
                  src="/images/3d_invitation copy.webp" 
                  alt="Verified Leads" 
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-2xl animate-[float_5s_ease-in-out_infinite_reverse]" 
                />
              </div>
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-6">
                <ShieldCheck size={16} /> Verified Leads
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-[#1D1D1F] tracking-tight mb-6 leading-tight">High-intent clients.<br/>Zero spam.</h3>
              <p className="text-xl text-[#86868B] font-medium leading-relaxed">
                Every client phone number is OTP-verified before they can contact you. Spend your time talking to real couples planning real events, not filtering out fake inquiries.
              </p>
            </div>
          </motion.div>

          {/* Feature 3: Powerful Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center gap-12 md:gap-20"
          >
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-[80px]"></div>
                <img 
                  src="/images/3d_venue copy.webp" 
                  alt="Professional Dashboard" 
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-2xl animate-[float_7s_ease-in-out_infinite]" 
                />
              </div>
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs uppercase tracking-wider mb-6">
                <Building2 size={16} /> Elite Dashboard
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-[#1D1D1F] tracking-tight mb-6 leading-tight">Your digital<br/>storefront.</h3>
              <p className="text-xl text-[#86868B] font-medium leading-relaxed mb-8">
                Manage your profile, track views, and respond to client inquiries from a state-of-the-art dashboard designed specifically for Indian event professionals.
              </p>
              <button onClick={() => setShowAuthModal(true)} className="px-8 py-4 bg-[#1D1D1F] text-white font-bold rounded-2xl hover:bg-black transition-colors shadow-lg shadow-black/20">
                Create Your Storefront
              </button>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 21 Categories Matrix Grid - Refined Apple Style */}
      <section className="bg-white py-32 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#1D1D1F] mb-6">Find your perfect fit.</h2>
            <p className="text-xl font-medium text-[#86868B]">Gomandap supports 21 distinct event categories.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {CATEGORIES.map((cat, idx) => {
              const imageSrc = ICON_MAP[cat.label] || '/images/3d_venue copy.webp';
              return (
                <div 
                  key={cat.id}
                  onClick={() => setShowAuthModal(true)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-full aspect-square rounded-[1.5rem] bg-[#F5F5F7] p-6 mb-4 flex items-center justify-center transition-all duration-300 group-hover:bg-[#EAEAEA] group-hover:scale-105 group-hover:shadow-xl">
                    <img 
                      src={imageSrc} 
                      alt={cat.label} 
                      className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                  <h4 className="text-[13px] font-bold text-[#1D1D1F] text-center leading-snug px-2">{cat.label}</h4>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-[#FBFBFD] py-12 border-t border-gray-200/50">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-[13px] text-[#86868B] font-medium">
          <div>Copyright © {new Date().getFullYear()} Gomandap Inc. All rights reserved.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Apple Login Style) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
              className="relative w-full max-w-[400px] bg-white shadow-2xl rounded-[2rem] overflow-hidden"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-10"
              >
                <X size={16} />
              </button>

              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Building2 size={32} className="text-brand-primary" />
                </div>
                <h2 className="text-2xl font-black text-[#1D1D1F] mb-2 tracking-tight">
                  {step === 'phone' ? 'Vendor Portal' : 'Verification'}
                </h2>
                <p className="text-[15px] text-[#86868B] font-medium mb-8">
                  {step === 'phone' ? 'Sign in or register your business securely.' : `Enter the OTP sent to ${phone}`}
                </p>

                <div id="vendor-recaptcha-container"></div>

                <div className="w-full">
                  {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Phone size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Mobile Number"
                          className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-none text-[#1D1D1F] rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary font-bold text-lg transition-shadow"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="w-full py-4 font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-2xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Sending...' : 'Continue'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Lock size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit OTP"
                          className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] border-none text-[#1D1D1F] rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary tracking-[0.5em] text-xl font-bold transition-shadow text-center"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className="w-full py-4 font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-2xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-image-drift {
          animation: image-drift 30s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VendorLandingPage;
