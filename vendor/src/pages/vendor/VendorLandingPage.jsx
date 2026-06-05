import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Phone, Mail, 
  ChevronRight, Sparkles, CheckCircle2,
  Search, MessageSquare, Handshake, ArrowRight, Lock, ShieldCheck,
  Hotel, Landmark, TreePine, Palmtree, Crown, PartyPopper, Flame,
  UtensilsCrossed, CalendarCheck, Camera, Music, Mic2, Brush, HandMetal,
  Shirt, Gem, ScrollText, Car, Compass, PlaneTakeoff, IndianRupee
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
  const [step, setStep] = useState('phone'); // phone -> otp
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Auto redirect if already logged in
  useEffect(() => {
    if (vendorStatus !== 'unregistered') {
      if (vendorStatus === 'draft') navigate('/onboarding');
      else navigate('/dashboard');
    }
  }, [vendorStatus, navigate]);

  // Setup Recaptcha
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
      alert("Failed to send OTP. Ensure billing is enabled and domains are authorized in Firebase.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          window.grecaptcha.reset(widgetId);
        });
      }
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
      const user = result.user;
      
      const res = await loginWithPhone(user.phoneNumber);
      if (res.success) {
        if (res.action === 'dashboard') {
          navigate('/dashboard');
        } else {
          // New vendor or draft
          navigate('/onboarding', { state: { phone: res.phoneNumber } });
        }
      } else {
        alert("Backend sync failed.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-brand-primary/20">
      
      {/* Elite Dynamic Background Elements (Ivory/Gold/Orange vibe) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-orange-100 to-amber-50 blur-[120px] opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-rose-100 to-orange-50 blur-[120px] opacity-60"></div>
        {/* Subtle noise texture for premium print feel */}
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.02] mix-blend-multiply"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
              <Building2 className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Gomandap <span className="text-gray-400 font-medium">Business</span></span>
          </div>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors text-sm flex items-center gap-2 shadow-lg shadow-gray-900/10 hover:shadow-xl hover:-translate-y-0.5"
          >
            Vendor Login <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <div className="relative z-10 pt-20 pb-32">
        {/* 1. Hero Section */}
        <section className="container mx-auto max-w-7xl px-6 text-center lg:text-left mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:w-[55%]"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-200 bg-orange-50 mb-8 shadow-sm">
                <Sparkles className="text-orange-600" size={14} />
                <span className="text-xs font-bold text-orange-800 uppercase tracking-widest">The Elite Vendor Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-[1.1]">
                Elevate your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500">
                  wedding business
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                A premium, unified platform to showcase your portfolio to high-intent clients. Zero commissions. Direct communication. Maximum growth.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:-translate-y-1"
                >
                  List Your Business <ArrowRight size={18} />
                </button>
                <div className="flex items-center gap-4 text-sm font-bold text-gray-500 mt-4 sm:mt-0 pl-0 sm:pl-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center"><Building2 size={16} className="text-gray-400" /></div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center"><Sparkles size={16} className="text-orange-500" /></div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center text-orange-600 font-black">+1k</div>
                  </div>
                  <span>Elite Vendors</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual - Premium Composition */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:w-[45%] w-full relative"
            >
              <div className="relative aspect-[4/4] rounded-[2.5rem] border border-white bg-white/60 backdrop-blur-xl overflow-hidden shadow-2xl flex items-center justify-center shadow-orange-900/5">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/50 to-transparent"></div>
                
                {/* Abstract Premium Shapes floating */}
                <motion.div 
                  animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-12 left-8 p-5 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle2 className="text-green-600" size={24} /></div>
                  <div>
                    <div className="text-sm font-black text-gray-900">Lead Verified</div>
                    <div className="text-xs text-gray-500 font-medium">High-Intent Client</div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [8, -8, 8], rotate: [2, -2, 2] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-12 right-8 p-5 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center"><MessageSquare className="text-orange-500" size={24} /></div>
                  <div>
                    <div className="text-sm font-black text-gray-900">New Message</div>
                    <div className="text-xs text-gray-500 font-medium">"Are you available on..."</div>
                  </div>
                </motion.div>

                {/* Central Focus */}
                <div className="text-center z-10 p-8 rounded-[2rem] bg-white shadow-2xl border border-gray-50">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Building2 size={40} className="text-white" />
                  </div>
                  <div className="text-2xl font-black text-gray-900 mb-1">Vendor Portal</div>
                  <div className="text-gray-500 font-medium text-sm">Manage Everything</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Apple Business Style Explanation Grid (Bento/Staggered) */}
        <section className="container mx-auto max-w-7xl px-6 mb-32 pt-20">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">The professional way to grow.</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
              We provide the tools, the verified leads, and the direct contact. You focus on what you do best—creating unforgettable experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Massive Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="bg-white rounded-[3rem] p-10 md:p-14 border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden relative group"
            >
              <div className="relative z-10 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-6">
                  <ShieldCheck size={16} /> Verified Leads
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-[1.1]">Real clients.<br/>No spam.</h3>
                <p className="text-gray-500 font-medium text-lg max-w-sm">Every client phone number is OTP verified before they can contact you, ensuring high-intent, real leads.</p>
              </div>
              <div className="mt-auto relative h-64 w-full md:h-80 -mx-4 -mb-10 md:-mb-14 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
                <img src="/images/marketing_leads.png" alt="Verified Leads" className="w-full h-full object-cover object-top" />
              </div>
            </motion.div>

            {/* Massive Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-[3rem] p-10 md:p-14 border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden relative group"
            >
              <div className="relative z-10 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-bold text-xs uppercase tracking-wider mb-6">
                  <IndianRupee size={16} /> 0% Commission
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-[1.1]">Direct contact.<br/>Pure profit.</h3>
                <p className="text-gray-500 font-medium text-lg max-w-sm">Keep 100% of your earnings. Clients can call or message you directly from your profile. No middlemen.</p>
              </div>
              <div className="mt-auto relative h-64 w-full md:h-80 -mx-4 -mb-10 md:-mb-14 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
                <img src="/images/marketing_chat.png" alt="0% Commission" className="w-full h-full object-cover object-top" />
              </div>
            </motion.div>
          </div>

          {/* Full Width Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-900 rounded-[3rem] p-10 md:p-16 border border-gray-800 shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-12 overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-rose-500/10"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10 md:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-wider mb-6 backdrop-blur-md border border-white/10">
                <Sparkles size={16} /> Powerful Dashboard
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-[1.1]">Manage your business from one place.</h3>
              <p className="text-gray-400 font-medium text-lg max-w-md mb-8">
                Track your profile views, respond to leads, and manage your public portfolio using our state-of-the-art vendor dashboard.
              </p>
              <button onClick={() => setShowAuthModal(true)} className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-colors shadow-xl shadow-white/10">
                Get Started Now
              </button>
            </div>
            
            <div className="md:w-1/2 w-full relative z-10 group-hover:-translate-y-2 transition-transform duration-700">
              <div className="relative aspect-square w-full max-w-md mx-auto">
                <img src="/images/marketing_dashboard.png" alt="Vendor Dashboard" className="w-full h-full object-contain filter drop-shadow-2xl" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3. The 21 Categories Grid (Elite Aesthetic) */}
        <section className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 bg-gray-900 p-10 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            {/* Dark background inside the banner for high contrast */}
            <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Showcase Your Category</h2>
              <p className="text-gray-400 text-lg font-medium">We support 21 specific wedding industry categories. Join the platform and place your business in front of thousands of couples.</p>
            </div>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="relative z-10 px-8 py-4 bg-white text-gray-900 rounded-2xl font-black hover:bg-gray-100 transition-colors shadow-xl"
            >
              List Your Business
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {CATEGORIES.map((cat, idx) => {
              const imageSrc = ICON_MAP[cat.label] || '/images/3d_venue copy.webp';
              return (
                <motion.div 
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (idx % 5) * 0.05 }}
                  onClick={() => setShowAuthModal(true)}
                  className="p-6 rounded-[2rem] bg-white border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 cursor-pointer transition-all group flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 mb-5 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg group-hover:drop-shadow-2xl">
                    <img 
                      src={imageSrc} 
                      alt={cat.label} 
                      className="w-full h-full object-contain filter drop-shadow-sm" 
                    />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 group-hover:text-orange-600 transition-colors leading-snug">{cat.label}</h4>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-10 relative z-10">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 font-medium text-sm">
          <div>&copy; {new Date().getFullYear()} Gomandap Business. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* 4. Firebase Phone Auth Modal (Premium Light Mode) */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-gray-100"
            >
              {/* Close */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute z-10 p-2 text-gray-400 transition-colors rounded-full top-5 right-5 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>

              <div className="p-8 pb-6 bg-gray-50/50 border-b border-gray-100">
                <div className="w-14 h-14 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={28} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                  {step === 'phone' ? 'Vendor Authentication' : 'Verify Identity'}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {step === 'phone' 
                    ? 'Enter your mobile number to securely login or register.' 
                    : `We sent a secure OTP to ${phone}`}
                </p>
              </div>

              <div id="vendor-recaptcha-container"></div>

              <div className="p-8 pt-6">
                {step === 'phone' ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                        <Phone size={20} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Mobile number"
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-gray-400 transition-all font-bold text-lg"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading || phone.length < 10}
                      className="w-full flex items-center justify-center gap-2 py-4 font-bold text-white transition-all bg-gray-900 hover:bg-black rounded-xl disabled:opacity-50 mt-6 shadow-xl shadow-gray-900/10"
                    >
                      {isLoading ? 'Sending OTP...' : 'Continue'}
                      {!isLoading && <ArrowRight size={20} />}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                        <Lock size={20} />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit OTP code"
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-gray-400 tracking-widest text-xl transition-all font-mono font-bold"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full flex items-center justify-center gap-2 py-4 font-bold text-white transition-all bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl disabled:opacity-50 mt-6 shadow-xl shadow-orange-500/25"
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default VendorLandingPage;
