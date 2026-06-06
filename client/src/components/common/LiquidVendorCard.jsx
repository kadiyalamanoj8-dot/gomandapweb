import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Heart, CheckCircle2, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategorySchema } from '../../config/categorySchemas';
import { useAuth } from '../../context/AuthContext';
import ProtectedImage from './ProtectedImage';

const LiquidVendorCard = ({ vendor, layout = 'carousel' }) => {
  const [ripples, setRipples] = useState([]);
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  // Function to create an authentic, organic liquid ripple effect
  const addRipple = (e) => {
    // Only fire ripple if we didn't click a button
    if (e.target.closest('button')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    // Delay navigation slightly to let the user enjoy the ripple effect
    setTimeout(() => {
      requireAuth(() => {
        navigate(`/vendor/${vendor.id || vendor._id}`, { state: { vendor } });
      });
    }, 350);
  };

  const removeRipple = (id) => {
    setRipples((prev) => prev.filter(r => r.id !== id));
  };

  // Organic blob shapes for the liquid effect
  const blobShapes = [
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "60% 40% 30% 70% / 60% 30% 70% 40%",
    "40% 60% 70% 30% / 40% 50% 60% 50%"
  ];

  const schema = getCategorySchema(vendor.category);
  const firstFeature = schema.featuresList[0] || 'Premium Service';

  // --- LIST VIEW (WeddingBazaar Style) ---
  if (layout === 'list') {
    return (
      <motion.div
        onClick={addRipple}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative flex flex-col md:flex-row bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer overflow-hidden group w-full mb-6"
      >
        {/* Ripple Container */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-30 mix-blend-overlay">
          <AnimatePresence>
            {ripples.map((ripple) => (
              <React.Fragment key={ripple.id}>
                <motion.span
                  initial={{ top: ripple.y, left: ripple.x, width: 0, height: 0, opacity: 0.6, borderRadius: blobShapes[0], rotate: 0 }}
                  animate={{ top: ripple.y - 300, left: ripple.x - 300, width: 600, height: 600, opacity: 0, borderRadius: blobShapes[1], rotate: 180 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute bg-white/40 backdrop-blur-sm"
                />
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>

        {/* Image Section */}
        <div className="relative w-full md:w-[35%] h-56 md:h-auto shrink-0 overflow-hidden">
          <ProtectedImage 
            src={vendor.imageUrl} 
            alt={vendor.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {vendor.featured && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full shadow-sm z-20">
              Featured
            </span>
          )}
          <button className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-500 hover:text-brand-primary hover:bg-white transition-colors z-20">
            <Heart size={18} />
          </button>
        </div>
        
        {/* Details Section */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between relative z-20">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-black text-brand-secondary uppercase tracking-widest mb-1 block">{vendor.category}</span>
                <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-brand-primary transition-colors">{vendor.name}</h3>
              </div>
              <div className="flex items-center gap-1 bg-brand-gold/10 px-2 py-1 rounded-lg border border-brand-gold/20 shrink-0">
                <Star className="text-brand-gold w-4 h-4" fill="currentColor" />
                <span className="text-sm font-bold text-brand-gold">{vendor.rating}</span>
                <span className="text-xs text-brand-gold/70 ml-1">({vendor.reviewsCount})</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-6">
              <MapPin size={16} className="text-gray-400 shrink-0" /> {vendor.location}
            </p>

            {/* List of Features */}
            <div className="flex flex-wrap gap-2 mb-6">
              {schema.featuresList.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                  <CheckCircle2 size={12} className="text-brand-primary" /> {feature}
                </span>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-auto">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Starting Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 leading-none">{vendor.pricePerPlate}</span>
                <span className="text-xs font-bold text-gray-500">{schema.pricingUnit}</span>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto z-40">
              <button 
                onClick={(e) => e.stopPropagation()}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-primary/10 text-brand-primary px-5 py-3 rounded-xl font-black text-sm hover:bg-brand-primary/20 transition-colors"
              >
                <Phone size={16} /> Contact
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/vendor/${vendor.id}`, { state: { vendor } });
                }}
                className="flex-1 md:flex-none bg-brand-primary text-white px-8 py-3 rounded-xl font-black text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- DEFAULT (Grid/Carousel) VIEW ---
  return (
    <motion.div
      onClick={addRipple}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-[1.5rem] bg-white shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(255,51,102,0.15)] transition-all duration-400 cursor-pointer overflow-hidden group flex flex-col border border-transparent hover:border-brand-primary/10 ${
        layout === 'carousel' 
          ? 'w-[200px] md:w-[240px] shrink-0 snap-start' 
          : 'w-full h-full'
      }`}
    >
      {/* Glow Effect Element */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/0 via-brand-primary/0 to-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.5rem] pointer-events-none z-10"></div>
      {/* Authentic Liquid Ripple Container */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-30 mix-blend-overlay">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <React.Fragment key={ripple.id}>
              <motion.span
                initial={{ top: ripple.y, left: ripple.x, width: 0, height: 0, opacity: 0.6, borderRadius: blobShapes[0], rotate: 0 }}
                animate={{ top: ripple.y - 300, left: ripple.x - 300, width: 600, height: 600, opacity: 0, borderRadius: blobShapes[1], rotate: 180 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute bg-white/40 backdrop-blur-sm"
              />
              <motion.span
                initial={{ top: ripple.y, left: ripple.x, width: 0, height: 0, opacity: 0.4, borderRadius: blobShapes[1], rotate: 45 }}
                animate={{ top: ripple.y - 250, left: ripple.x - 250, width: 500, height: 500, opacity: 0, borderRadius: blobShapes[2], rotate: -90 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                onAnimationComplete={() => removeRipple(ripple.id)}
                className="absolute bg-white/20 backdrop-blur-md shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]"
              />
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

      {/* Tall Portrait Image */}
      <div className="relative w-full h-48 md:h-52 overflow-hidden shrink-0">
        <ProtectedImage 
          src={vendor.imageUrl} 
          alt={vendor.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          containerClassName="w-full h-full"
        />
        {/* Subtle dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {vendor.featured && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-[9px] uppercase tracking-wider font-black px-2 py-1 rounded-full shadow-sm z-20">
            Featured
          </span>
        )}
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-gray-500 hover:text-brand-primary hover:bg-white transition-colors z-20">
          <Heart size={16} />
        </button>

        {/* Dynamic Schema Feature Badge over image */}
        <div className="absolute bottom-3 left-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="flex items-center gap-1 text-[10px] text-white font-semibold backdrop-blur-md bg-black/40 px-2 py-1 rounded-md w-fit">
             <CheckCircle2 size={10} className="text-brand-gold" /> {firstFeature}
           </span>
        </div>
      </div>
      
      <div className="p-3 bg-white relative z-20 flex-1 flex flex-col justify-between">
        <div className="mb-2">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-brand-primary transition-colors line-clamp-1">{vendor.name}</h3>
            <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 shrink-0 ml-1">
              <Star className="text-brand-gold w-3 h-3" fill="currentColor" />
              <span className="text-xs font-bold text-gray-900">{vendor.rating}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0" /> {vendor.location}
          </p>
        </div>
        
        <div className="pt-2 border-t border-gray-100 flex justify-between items-end mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-0.5 line-clamp-1">{vendor.category}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-gray-900 leading-none">{vendor.pricePerPlate}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{schema.pricingUnit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(LiquidVendorCard);
