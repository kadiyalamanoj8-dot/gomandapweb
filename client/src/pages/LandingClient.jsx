import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, Sparkles, MapPin, CalendarDays, ArrowRight } from 'lucide-react';

const LandingClient = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="w-full bg-white font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex flex-col justify-center items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/temple_background.webp" 
            alt="Beautiful Wedding" 
            className="w-full h-full object-cover filter brightness-[0.65] transform scale-105 animate-[slow-zoom_20s_ease-in-out_infinite]"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm tracking-wide uppercase mb-6 shadow-lg">
              <Sparkles size={16} className="text-brand-gold" />
              Discover the Extraordinary
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-2xl">
              Your dream wedding, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">perfectly planned.</span>
            </h1>
            
            <p className="text-lg md:text-2xl font-medium text-white/90 max-w-2xl mx-auto mb-10 drop-shadow-lg">
              Find and book India's most exclusive venues, decorators, and artists directly. No middlemen.
            </p>
          </motion.div>

          {/* Massive Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative flex items-center w-full bg-white/90 backdrop-blur-xl border-4 border-white/40 rounded-full p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-white transition-colors duration-300">
              <div className="flex-1 flex items-center pl-6">
                <Search className="text-brand-primary/60 shrink-0" size={24} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you planning? (e.g. Sangeet Decorators in Mumbai)"
                  className="w-full bg-transparent border-none text-gray-900 text-lg md:text-xl font-bold placeholder-gray-400 focus:outline-none px-4 py-3"
                />
              </div>
              <button 
                type="submit"
                className="bg-brand-primary text-white rounded-full px-8 md:px-10 py-4 font-black text-lg hover:bg-[#d41b4d] hover:scale-105 transition-all shadow-lg flex items-center gap-2"
              >
                Search <ArrowRight size={20} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Decorative Bottom Wave/Curve */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10"></div>
      </section>

      {/* Trust & Inspiration Teaser */}
      <section className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-6">
                <MapPin className="text-blue-500" size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Hyper-Local Discovery</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Find verified vendors in your exact neighborhood. View their 4K portfolios instantly.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-6">
                <CalendarDays className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Direct Bookings</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Check real-time availability and book your dates instantly. We don't hold your money.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="w-16 h-16 mx-auto rounded-full bg-pink-50 flex items-center justify-center mb-6">
                <Heart className="text-pink-500" size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Inspiration Boards</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Build beautiful mood boards without signing up. Save what you love, decide later.</p>
            </motion.div>
          </div>

          {/* CTA to Inspiration Board */}
          <div className="relative bg-gray-50 rounded-[3rem] p-12 overflow-hidden border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-12 group cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/inspiration')}>
            <div className="absolute right-0 top-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-primary/10 transition-colors"></div>
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-widest bg-pink-100 text-pink-700 mb-6">
                <Heart size={14} /> New Feature
              </span>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
                Not ready to book? <br/>
                <span className="text-brand-primary">Start an Inspiration Board.</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium mb-8">
                Browse thousands of gorgeous real weddings. Save your favorite decorators, outfits, and venues to a private mood board. Absolutely free.
              </p>
              <button className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                Browse Inspiration <ArrowRight size={18} />
              </button>
            </div>
            
            {/* Visual Teaser */}
            <div className="relative z-10 w-full max-w-sm">
               <div className="grid grid-cols-2 gap-4 transform rotate-6 group-hover:rotate-0 transition-transform duration-500">
                 <div className="space-y-4 pt-8">
                   <div className="w-full h-40 bg-gray-200 rounded-2xl overflow-hidden shadow-lg">
                     <img src="/images/modern_gazebo copy.webp" alt="Inspiration" className="w-full h-full object-cover" />
                   </div>
                   <div className="w-full h-48 bg-gray-200 rounded-2xl overflow-hidden shadow-lg relative">
                     <img src="/images/3d_clothes copy.webp" alt="Inspiration" className="w-full h-full object-cover" />
                     <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center">
                       <Heart className="text-brand-primary fill-brand-primary" size={16} />
                     </div>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <div className="w-full h-48 bg-gray-200 rounded-2xl overflow-hidden shadow-lg relative">
                     <img src="/images/neon_sangeet_stage copy.webp" alt="Inspiration" className="w-full h-full object-cover" />
                     <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center">
                       <Heart className="text-brand-primary fill-brand-primary" size={16} />
                     </div>
                   </div>
                   <div className="w-full h-40 bg-gray-200 rounded-2xl overflow-hidden shadow-lg">
                     <img src="/images/3d_decor copy.webp" alt="Inspiration" className="w-full h-full object-cover" />
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx global>{`
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default LandingClient;
