import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ShieldCheck, Phone, 
  Sparkles, IndianRupee, MessageSquare, X, ArrowRight, Lock
} from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';
import { useVendor } from '../../context/VendorContext';
import { auth } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const ICON_MAP = {
  'Banquet Halls':               '/images/3d_venue copy.webp',
  'Kalyana Mandapams':           '/images/temple_mandap copy.webp',
  'Open Lawns & Farmhouses':     '/images/3d_lawn_farmhouse_1780657291134 copy.webp',
  'Resorts & Destination Venues':'/images/modern_gazebo copy.webp',
  '5-Star Hotels':               '/images/3d_5star_hotel_1780657276128 copy.webp',
  'Party & Mini Halls':          '/images/neon_sangeet_stage copy.webp',
  'Temples & Ashrams':           '/images/temple_mandap copy.webp',
  'Catering Service':            '/images/3d_food copy.webp',
  'Stage & Venue Decor':         '/images/3d_decor copy.webp',
  'Photography & Videography':   '/images/3d_camera copy.webp',
  'DJs & Sound Systems':         '/images/3d_dj copy.webp',
  'Live Musicians / Band Baaja': '/images/3d_band copy.webp',
  'Makeup Artists (MUA)':        '/images/3d_makeup copy.webp',
  'Mehndi Designers':            '/images/3d_mehndi_1780657262687 copy.webp',
  'Wedding Clothes / Boutiques': '/images/3d_clothes copy.webp',
  'Jewelry Shops':               '/images/3d_jewelry copy.webp',
  'Wedding Cards & Invites':     '/images/3d_invitation copy.webp',
  'Cars & Buses (Travel)':       '/images/3d_car copy.webp',
  'Astrologers / Pundits':       '/images/3d_astrologer copy.webp',
  'Honeymoon Packages':          '/images/3d_honeymoon copy.webp',
  'Event Planners':              '/images/3d_planner copy.webp',
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

  // Intro Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden selection:bg-brand-primary/30">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-12 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand-primary/20 to-orange-400/20 blur-[80px]"
          />
          <motion.div 
            animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-500/10 to-brand-primary/20 blur-[80px]"
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Hero Content */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:w-1/2 text-center lg:text-left"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-primary/20 shadow-sm text-brand-primary font-bold text-sm mb-6">
                <Sparkles size={16} /> <span>0% Commission Platform</span>
              </motion.div>
              
              <motion.div variants={itemVariants} className="relative">
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight mb-6">
                  Grow Your <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-orange-500">
                    Wedding Business
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 font-medium mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Join Gomandap, the fastest-growing network of verified wedding vendors. Get direct leads, connect with clients instantly, and manage your bookings—all in one place.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Start Selling <ArrowRight size={20} />
                </button>
                <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-primary/20 flex items-center justify-center text-brand-primary">+1k</div>
                  </div>
                  <span>Vendors Registered</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual - Floating Grid */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative w-full max-w-lg mx-auto aspect-square">
                {/* Center Image */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 m-auto w-64 h-64 bg-white rounded-full shadow-2xl p-4 z-20 flex items-center justify-center border border-gray-100"
                >
                  <img src="/images/temple_mandap copy.webp" className="w-full h-full object-cover rounded-full" alt="Mandap" />
                </motion.div>
                
                {/* Orbiting Elements */}
                <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-10 right-10 w-32 h-32 bg-white rounded-2xl shadow-xl p-3 z-30 -rotate-12 border border-gray-100">
                  <img src="/images/3d_camera copy.webp" className="w-full h-full object-contain" alt="Photography" />
                </motion.div>
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-2xl shadow-xl p-3 z-30 rotate-12 border border-gray-100">
                  <img src="/images/3d_food copy.webp" className="w-full h-full object-contain" alt="Catering" />
                </motion.div>
                
                {/* Abstract Data Cards */}
                <motion.div className="absolute top-1/4 -left-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 z-40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold">New Leads</div>
                      <div className="text-lg font-black text-gray-900">+42 This Week</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Why Join Gomandap (Value Proposition) */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Why the best vendors choose us</h2>
            <p className="text-lg text-gray-600 font-medium">We built Gomandap to solve the biggest problems in the wedding industry. No hidden fees, no fake leads, just business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: IndianRupee, title: "0% Commission", desc: "You keep 100% of what you earn. We don't take a cut from your bookings.", color: "text-green-600", bg: "bg-green-100" },
              { icon: MessageSquare, title: "Direct Contact", desc: "Clients message or call you directly. No middlemen interfering with your deals.", color: "text-blue-600", bg: "bg-blue-100" },
              { icon: ShieldCheck, title: "Verified Leads", desc: "Every client phone number is verified via OTP, ensuring you only deal with real customers.", color: "text-brand-primary", bg: "bg-brand-primary/10" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The 21 Categories Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">What you can list</h2>
              <p className="text-lg text-gray-600 font-medium">Gomandap supports 21 distinct wedding categories. Find your niche and start receiving inquiries today.</p>
            </div>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-colors"
            >
              List Your Business
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, idx) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 5) * 0.1 }}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all text-center group cursor-pointer"
                onClick={() => setShowAuthModal(true)}
              >
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-xl p-3 mb-3 group-hover:scale-110 transition-transform">
                  <img 
                    src={ICON_MAP[cat.name] || '/images/3d_venue copy.webp'} 
                    alt={cat.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">{cat.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Firebase Phone Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden"
            >
              {/* Close */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute z-10 p-2 text-gray-400 transition-colors rounded-full top-4 right-4 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

              <div className="p-8 pb-6">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={24} className="text-brand-primary" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {step === 'phone' ? 'Vendor Portal' : 'Verify Identity'}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {step === 'phone' 
                    ? 'Enter your mobile number to login or register your business.' 
                    : `We sent a secure OTP to ${phone}`}
                </p>
              </div>

              <div id="vendor-recaptcha-container"></div>

              <div className="p-8 pt-0">
                {step === 'phone' ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter mobile number"
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 font-bold transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading || phone.length < 10}
                      className="w-full flex items-center justify-center gap-2 py-4 font-bold text-white transition-all bg-gray-900 hover:bg-black rounded-xl disabled:opacity-50"
                    >
                      {isLoading ? 'Sending OTP...' : 'Continue'}
                      {!isLoading && <ArrowRight size={18} />}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                        <Lock size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit OTP"
                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 font-bold tracking-widest text-lg transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full flex items-center justify-center gap-2 py-4 font-bold text-white transition-all bg-brand-primary hover:bg-orange-600 rounded-xl shadow-lg shadow-brand-primary/30 disabled:opacity-50"
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
