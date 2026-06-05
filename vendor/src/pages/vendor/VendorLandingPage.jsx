import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ShieldCheck, MapPin, Phone, Mail, 
  ChevronRight, Sparkles, CheckCircle2, IndianRupee, Star,
  Search, MessageSquare, Handshake, HeartHandshake
} from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';

const FloatingBadge = ({ text, icon: Icon, delay, top, left, right, bottom }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className="hidden md:flex absolute bg-white/95 backdrop-blur-xl border border-orange-100 px-4 py-3 rounded-2xl shadow-xl items-center gap-3 z-20 pointer-events-none"
    style={{ top, left, right, bottom }}
  >
    <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
      <Icon size={18} />
    </div>
    <span className="font-bold text-gray-900 text-sm whitespace-nowrap">{text}</span>
  </motion.div>
);

const ICON_MAP = {
  'Banquet Halls':               '/images/3d_venue copy.png',
  'Kalyana Mandapams':           '/images/temple_mandap copy.png',
  'Open Lawns & Farmhouses':     '/images/3d_lawn_farmhouse_1780657291134 copy.png',
  'Resorts & Destination Venues':'/images/modern_gazebo copy.png',
  '5-Star Hotels':               '/images/3d_5star_hotel_1780657276128 copy.png',
  'Party & Mini Halls':          '/images/neon_sangeet_stage copy.png',
  'Temples & Ashrams':           '/images/temple_mandap copy.png',
  'Catering Service':            '/images/3d_food copy.png',
  'Stage & Venue Decor':         '/images/3d_decor copy.png',
  'Photography & Videography':   '/images/3d_camera copy.png',
  'DJs & Sound Systems':         '/images/3d_dj copy.png',
  'Live Musicians / Band Baaja': '/images/3d_band copy.png',
  'Makeup Artists (MUA)':        '/images/3d_makeup copy.png',
  'Mehndi Designers':            '/images/3d_mehndi_1780657262687 copy.png',
  'Wedding Clothes / Boutiques': '/images/3d_clothes copy.png',
  'Jewelry Shops':               '/images/3d_jewelry copy.png',
  'Wedding Cards & Invites':     '/images/3d_invitation copy.png',
  'Cars & Buses (Travel)':       '/images/3d_car copy.png',
  'Astrologers / Pundits':       '/images/3d_astrologer copy.png',
  'Honeymoon Packages':          '/images/3d_honeymoon copy.png',
  'Event Planners':              '/images/3d_planner copy.png',
};

const VendorLandingPage = () => {
  const navigate = useNavigate();

  // Animated Image Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1519225421980-a95ce669bfaa?auto=format&fit=crop&w=800&q=80", // Mandap
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80", // Mehendi / Celebration
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"  // Wedding Elements
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-orange-50/30 selection:bg-orange-500/20 overflow-hidden font-sans">
      
      {/* 3D Dynamic Background Elements - Indian Festive Colors */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Marigold Orange / Saffron Glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-gradient-to-br from-orange-400/20 to-amber-300/20 blur-[80px] md:blur-[120px] opacity-80"></div>
        {/* Deep Red / Rose Glow */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] rounded-full bg-gradient-to-tr from-rose-500/10 to-red-600/10 blur-[90px] md:blur-[120px] opacity-70"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 lg:left-8 lg:right-8 bg-white/80 backdrop-blur-2xl z-50 border border-orange-100/50 rounded-2xl md:rounded-3xl px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-rose-700 leading-none tracking-tight">Gomandap</span>
            <span className="text-[9px] md:text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none mt-1">Business Partner</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/onboarding')}
          className="bg-gradient-to-r from-rose-600 to-orange-500 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap shrink-0"
        >
          Join Free <ChevronRight size={14} className="hidden md:block" />
        </button>
      </nav>

      {/* HERO SECTION - Indian Aesthetics & Simple English */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-4 md:px-8 z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left relative z-10 w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-orange-100 shadow-sm mb-6 md:mb-8 mx-auto lg:mx-0">
              <Sparkles size={14} className="text-amber-500 shrink-0" />
              <span className="text-[10px] md:text-xs font-bold text-orange-700 uppercase tracking-wider">India's Trusted Wedding Network</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-4 md:mb-6 tracking-tight">
              Grow Your Wedding Business.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500">
                Zero Joining Fees.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-700 font-medium mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 md:px-0">
              Join thousands of trusted Mandap owners, Caterers, and Photographers. Get genuine bookings from verified families directly through Gomandap. Pay commission only when you earn.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => navigate('/onboarding')}
                className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-orange-500 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 md:hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border border-orange-400/50"
              >
                Create Free Profile Now
              </button>
              <div className="text-xs md:text-sm font-bold text-gray-600 flex items-center gap-1.5 md:gap-2 bg-white/50 px-4 py-2 rounded-full border border-orange-100">
                <CheckCircle2 size={16} className="text-green-600 shrink-0" /> Takes only 2 minutes
              </div>
            </div>
          </motion.div>

          {/* 3D Hero Graphic - Festive Theme */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:perspective-1000 mt-8 lg:mt-0"
          >
            <div className="relative w-full h-full lg:transform-style-3d lg:rotate-y-[-10deg] lg:rotate-x-[5deg] lg:hover:rotate-y-0 lg:hover:rotate-x-0 transition-transform duration-700">
              {/* Main Wedding/Mandap Image (Animated Carousel) */}
              <div className="absolute inset-0 bg-white p-2 md:p-3 rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-orange-100 overflow-hidden">
                <div className="relative w-full h-full rounded-[1.25rem] md:rounded-[2rem] overflow-hidden">
                  <AnimatePresence>
                    <motion.img 
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 0.95, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      src={heroImages[currentImageIndex]} 
                      alt="Indian Wedding Business" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
              
              {/* Floating Trust Badges */}
              <FloatingBadge text="100% Genuine Leads" icon={ShieldCheck} delay={0.6} top="15%" left="-10%" />
              <FloatingBadge text="₹0 Registration Fee" icon={IndianRupee} delay={0.8} bottom="25%" right="-5%" />
              <FloatingBadge text="Verified Customers" icon={Star} delay={1.0} top="40%" right="-15%" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* HOW IT WORKS - Simplified */}
      <section className="py-16 md:py-24 px-4 md:px-8 relative z-10 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">How Gomandap Works</h2>
            <p className="text-base md:text-lg text-gray-600 font-medium max-w-2xl mx-auto">A very simple and risk-free process for business owners.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[40%] left-[15%] right-[15%] h-1 bg-gradient-to-r from-orange-100 via-rose-100 to-orange-100 -translate-y-1/2 z-0 rounded-full"></div>

            {[
              {
                step: "1",
                title: "Create Free Profile",
                desc: "Fill your business details, add photos, and set your prices. There are no joining fees at all.",
                icon: Search,
                color: "text-amber-600",
                bg: "bg-amber-100 border-amber-200"
              },
              {
                step: "2",
                title: "Get Customer Messages",
                desc: "Families looking for your service will view your profile and send direct messages to you.",
                icon: MessageSquare,
                color: "text-rose-600",
                bg: "bg-rose-100 border-rose-200"
              },
              {
                step: "3",
                title: "Confirm & Earn",
                desc: "Chat with the customers and finalize the deal. Pay us a small commission only after successful booking.",
                icon: Handshake,
                color: "text-green-600",
                bg: "bg-green-100 border-green-200"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center bg-orange-50/30 p-6 rounded-3xl md:bg-transparent md:p-0 md:rounded-none shadow-sm md:shadow-none border border-orange-50 md:border-none">
                <div className={`w-16 h-16 rounded-full ${item.bg} border-4 flex items-center justify-center mb-6 shadow-lg`}>
                  <item.icon size={28} className={item.color} />
                </div>
                <div className="inline-block px-4 py-1.5 bg-orange-100 rounded-full text-xs font-black text-orange-800 mb-4 border border-orange-200">STEP {item.step}</div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY GOMANDAP (Value Props) */}
      <section className="py-16 md:py-24 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Solve Your Business Problems</h2>
            <p className="text-base md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">We built Gomandap to solve the biggest problem for Indian Vendors: <strong className="text-rose-700">Fake window-shoppers & dead leads.</strong></p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: IndianRupee,
                title: "Pay Only For Success",
                desc: "No monthly subscriptions. No pay-per-lead charges. You only pay when a customer officially books you.",
                color: "from-green-500 to-emerald-500",
                shadow: "shadow-green-500/20"
              },
              {
                icon: ShieldCheck,
                title: "Only Serious Customers",
                desc: "Families see your exact pricing and details before they contact you. By the time they message you, they are ready to book.",
                color: "from-rose-500 to-red-500",
                shadow: "shadow-rose-500/20"
              },
              {
                icon: HeartHandshake,
                title: "Built for Indian Business",
                desc: "Easy to use from your mobile phone. Chat with customers directly in simple language. We support you.",
                color: "from-orange-500 to-amber-500",
                shadow: "shadow-orange-500/20"
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group relative bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-xl ${feature.shadow} transition-all duration-500 md:hover:-translate-y-2 overflow-hidden`}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg text-white transform md:group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon size={28} className="md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 tracking-tight relative z-20">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed relative z-20">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY SHOWCASE (Premium Deep Red / Maroon Mode) */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#3d0c11] text-white relative overflow-hidden rounded-t-[2rem] md:rounded-t-[3rem] border-t-4 border-amber-500">
        {/* Abstract BG - Mandala / Rangoli feel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-rose-600/40 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-amber-500/30 blur-[120px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-amber-50">We Support All Wedding Businesses</h2>
            <p className="text-sm md:text-xl text-rose-200 font-medium max-w-2xl mx-auto">We provide a platform for 20+ types of wedding services across India.</p>
          </div>
          
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {CATEGORIES.slice(0, 12).map((cat, idx) => {
              const icon3d = ICON_MAP[cat.label];
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.03 }}
                  key={cat.id} 
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                >
                  <div className="w-[84px] h-[84px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] flex items-center justify-center group-hover:bg-rose-900/40 group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all relative overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 w-12 h-12 flex items-center justify-center">
                      {icon3d && (
                        <img src={icon3d} alt={cat.label} className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-amber-50/80 group-hover:text-amber-400 transition-colors text-center leading-tight px-1 h-8 flex items-start justify-center">
                    {cat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-12 md:mt-16 text-center">
            <button 
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-[#3d0c11] px-8 py-3.5 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform border border-amber-300"
            >
              See All Categories & Join
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2a080c] pt-10 pb-8 md:pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-amber-500 tracking-tight">Gomandap</span>
          </div>
          
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm font-semibold text-rose-200/60">
            <span className="flex items-center justify-center gap-2 hover:text-amber-400 transition-colors cursor-pointer"><MapPin size={16} /> HQ: Mumbai, India</span>
            <span className="flex items-center justify-center gap-2 hover:text-amber-400 transition-colors cursor-pointer"><Phone size={16} /> +91 98765 43210</span>
            <span className="flex items-center justify-center gap-2 hover:text-amber-400 transition-colors cursor-pointer"><Mail size={16} /> vendor-support@gomandap.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorLandingPage;
