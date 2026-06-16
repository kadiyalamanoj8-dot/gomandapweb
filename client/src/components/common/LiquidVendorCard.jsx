import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Heart, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategorySchema } from '../../config/categorySchemas';
import { useAuth } from '../../context/AuthContext';
import ProtectedImage from './ProtectedImage';

const LiquidVendorCard = ({ vendor, layout = 'carousel' }) => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on buttons like 'Heart'
    if (e.target.closest('button')) return;

    requireAuth(() => {
      navigate(`/vendor/${vendor.id || vendor._id}`, { state: { vendor } });
    });
  };

  const schema = getCategorySchema(vendor.category);
  const firstFeature = schema.featuresList[0] || 'Premium Service';

  // --- LIST VIEW (WeddingWire Style - Horizontal) ---
  if (layout === 'list') {
    return (
      <motion.div
        onClick={handleCardClick}
        whileHover={{ scale: 1.01 }}
        className="relative flex flex-col md:flex-row bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] rounded-[24px] p-2 transition-all duration-500 cursor-pointer overflow-hidden group w-full mb-6"
      >
        {/* Image Section */}
        <div className="relative w-full md:w-[40%] aspect-[4/3] md:aspect-auto md:h-full shrink-0 overflow-hidden rounded-[20px]">
          <ProtectedImage 
            src={vendor.imageUrl} 
            alt={vendor.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {vendor.isFeatured && (
            <span className="absolute top-3 left-3 bg-brand-gold text-gray-900 text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-md shadow-lg z-20 flex items-center gap-1">
              <Star size={10} fill="currentColor" /> Highlighted
            </span>
          )}

          <button className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/90 backdrop-blur-md p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all z-20">
            <Heart size={18} />
          </button>
        </div>
        
        {/* Details Section */}
        <div className="p-5 md:p-8 flex-1 flex flex-col justify-between relative z-20">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">{vendor.category}</span>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">{vendor.name}</h3>
              </div>
              <div className="flex items-center gap-1 bg-brand-gold/10 px-2.5 py-1 rounded-md border border-brand-gold/20 shrink-0 ml-2">
                <Star className="text-brand-gold w-3.5 h-3.5" fill="currentColor" />
                <span className="text-sm font-bold text-brand-gold">{vendor.rating}</span>
                <span className="text-xs text-brand-gold/70 hidden md:inline ml-1">({vendor.reviewsCount})</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4 md:mb-6">
              <MapPin size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{vendor.location}</span>
            </p>

            {/* List of Features */}
            <div className="hidden md:flex flex-wrap gap-2 mb-6">
              {schema.featuresList.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <CheckCircle2 size={14} className="text-brand-primary" /> {feature}
                </span>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Starting Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg md:text-2xl font-black text-gray-900 leading-none">{vendor.pricePerPlate}</span>
                <span className="text-[10px] font-bold text-gray-500 hidden md:inline">{schema.pricingUnit}</span>
              </div>
            </div>

            <button 
              className="md:hidden text-brand-primary font-bold text-sm bg-brand-primary/10 px-4 py-2 rounded-lg"
            >
              View
            </button>
            <button 
              className="hidden md:block bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-brand-primary transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- DEFAULT (Grid/Carousel) VIEW (Airbnb/Premium Style) ---
  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] rounded-[28px] p-2 transition-all duration-500 cursor-pointer group flex flex-col ${
        layout === 'carousel' 
          ? 'w-[280px] md:w-[320px] shrink-0 snap-start' 
          : 'w-full h-full'
      }`}
    >
      {/* Cinematic Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-[22px] overflow-hidden shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <ProtectedImage 
          src={vendor.imageUrl} 
          alt={vendor.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
          containerClassName="w-full h-full"
        />
        {/* Subtle dark gradient overlay for text readability at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {vendor.isFeatured && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-sm z-20 flex items-center gap-1.5">
            <Star size={10} className="text-brand-gold" fill="currentColor" /> Featured
          </span>
        )}
        <button className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:text-red-500 hover:bg-white shadow-sm transition-all z-20 active:scale-95">
          <Heart size={18} strokeWidth={2.5} />
        </button>

        {/* Dynamic Schema Feature Badge over image on hover */}
        <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
           <span className="flex items-center gap-2 text-xs text-white font-bold backdrop-blur-xl bg-black/40 border border-white/20 px-3 py-2 rounded-xl w-fit shadow-lg">
             <CheckCircle2 size={14} className="text-green-400" /> {firstFeature}
           </span>
        </div>
      </div>
      
      {/* Clean Typography Content */}
      <div className="pt-4 px-1 relative z-20 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-[17px] font-bold text-gray-900 leading-tight truncate pr-4 group-hover:text-brand-primary transition-colors tracking-tight">
            {vendor.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded-md">
            <Star className="text-gray-900 w-3.5 h-3.5" fill="currentColor" />
            <span className="text-[13px] font-bold text-gray-900">{vendor.rating}</span>
          </div>
        </div>
        
        <p className="text-[14px] text-gray-500 font-medium truncate mb-1">
          {vendor.category} <span className="mx-1.5 opacity-40">•</span> {vendor.location.split(',')[0]}
        </p>
        
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[16px] font-black text-gray-900 tracking-tight">{vendor.pricePerPlate}</span>
          <span className="text-[13px] text-gray-500 font-medium truncate">{schema.pricingUnit.replace('/', ' / ')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(LiquidVendorCard);
