import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Filter, AlertCircle, Camera, LogIn, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Mock inspiration images (Normally fetched from API)
const INSPIRATION_IMAGES = [
  { id: 1, src: '/images/3d_decor copy.webp', category: 'Decor', title: 'Neon Sangeet Stage', vendorId: 'v1' },
  { id: 2, src: '/images/modern_gazebo copy.webp', category: 'Venues', title: 'Outdoor Gazebo', vendorId: 'v2' },
  { id: 3, src: '/images/3d_clothes copy.webp', category: 'Apparel', title: 'Designer Lehenga', vendorId: 'v3' },
  { id: 4, src: '/images/neon_sangeet_stage copy.webp', category: 'Decor', title: 'Premium Light Setup', vendorId: 'v1' },
  { id: 5, src: '/images/temple_mandap copy.webp', category: 'Venues', title: 'Traditional Mandapam', vendorId: 'v4' },
  { id: 6, src: '/images/3d_jewelry copy.webp', category: 'Jewelry', title: 'Bridal Set', vendorId: 'v5' },
];

const InspirationBoard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [savedItems, setSavedItems] = useState([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Load from local storage on mount (Deferred sign-up strategy)
  useEffect(() => {
    const saved = localStorage.getItem('gomandap_inspiration');
    if (saved) {
      setSavedItems(JSON.parse(saved));
    }
  }, []);

  const handleToggleSave = (item) => {
    let newSaved;
    if (savedItems.some(i => i.id === item.id)) {
      newSaved = savedItems.filter(i => i.id !== item.id);
      toast.success('Removed from Inspiration Board');
    } else {
      newSaved = [...savedItems, item];
      toast.success('Added to Inspiration Board!', {
        icon: '💖',
      });
      
      // If they save their 3rd item, prompt them gently to sign up
      if (newSaved.length === 3) {
        setTimeout(() => setShowAuthPrompt(true), 1000);
      }
    }
    setSavedItems(newSaved);
    localStorage.setItem('gomandap_inspiration', JSON.stringify(newSaved));
  };

  const filteredImages = activeFilter === 'All' 
    ? INSPIRATION_IMAGES 
    : INSPIRATION_IMAGES.filter(img => img.category === activeFilter);

  const categories = ['All', 'Decor', 'Venues', 'Apparel', 'Jewelry'];

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-pink-50 text-pink-700 mb-4 border border-pink-100">
            <Heart size={14} /> Mood Board
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-4">
            Find your <span className="text-brand-primary">inspiration.</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Browse beautiful real weddings. Heart what you love to save it to your local device. Sign up later when you're ready to contact the vendors.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  activeFilter === cat 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Saved Items Counter */}
        {savedItems.length > 0 && (
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                 <Heart className="text-pink-600 fill-pink-600" size={18} />
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-900">{savedItems.length} items saved</p>
                 <p className="text-xs font-semibold text-gray-500">Stored on this device</p>
               </div>
             </div>
             <button 
                onClick={() => setShowAuthPrompt(true)}
                className="px-5 py-2.5 bg-brand-primary/10 text-brand-primary font-bold text-sm rounded-xl hover:bg-brand-primary/20 transition-colors"
              >
               Create Account to Backup
             </button>
          </div>
        )}

        {/* Masonry Grid Simulation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredImages.map((img, i) => {
              const isSaved = savedItems.some(item => item.id === img.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  key={img.id}
                  className="relative group rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100"
                >
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img 
                      src={img.src} 
                      alt={img.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  </div>
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Top Right Save Button */}
                  <button 
                    onClick={() => handleToggleSave(img)}
                    className={`absolute top-4 right-4 w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                      isSaved ? 'bg-white shadow-lg' : 'bg-white/40 hover:bg-white border border-white/50 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart size={22} className={isSaved ? 'text-pink-500 fill-pink-500' : 'text-gray-900'} />
                  </button>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-[11px] font-black uppercase tracking-widest text-brand-gold mb-1 block">
                      {img.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3">{img.title}</h3>
                    <button 
                      onClick={() => navigate(`/vendor/${img.vendorId}`)}
                      className="px-5 py-2 bg-white/20 hover:bg-white hover:text-black backdrop-blur-md border border-white/30 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      View Vendor
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Auth Prompt Modal */}
      <AnimatePresence>
        {showAuthPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center relative"
            >
              <button 
                onClick={() => setShowAuthPrompt(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full p-2"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-brand-primary fill-brand-primary" size={36} />
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">You have great taste!</h2>
              <p className="text-gray-500 font-medium mb-8">
                You've saved a few items to your mood board. Create a free account to permanently save them, share with family, and contact the vendors.
              </p>

              <button 
                onClick={() => {
                  setShowAuthPrompt(false);
                  // Dispatch custom event to trigger login modal in App
                  window.dispatchEvent(new CustomEvent('open-login'));
                }}
                className="w-full py-4 bg-brand-primary text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#d41b4d] transition-colors shadow-lg shadow-brand-primary/20 mb-4"
              >
                <LogIn size={20} /> Create Free Account
              </button>
              
              <button 
                onClick={() => setShowAuthPrompt(false)}
                className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Continue Browsing
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InspirationBoard;
