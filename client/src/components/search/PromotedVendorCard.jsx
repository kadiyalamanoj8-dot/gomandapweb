import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Crown, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProtectedImage from '../common/ProtectedImage';
import { getCategorySchema } from '../../config/categorySchemas';

const PromotedVendorCard = ({ vendor }) => {
  const navigate = useNavigate();
  const schema = getCategorySchema(vendor.category);

  return (
    <motion.div
      onClick={() => navigate(`/vendor/${vendor.id || vendor._id}`, { state: { vendor } })}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      className="relative w-[320px] md:w-[480px] shrink-0 cursor-pointer group rounded-[32px] overflow-hidden"
    >
      {/* Animated Glowing Border Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold opacity-30 blur-xl group-hover:opacity-100 transition-opacity duration-1000"></div>
      
      {/* Actual Card Container */}
      <div className="relative bg-white h-full w-full rounded-[30px] border border-brand-gold/30 overflow-hidden flex flex-col m-[2px] shadow-[0_20px_60px_rgba(212,175,55,0.15)]">
        
        {/* Promoted Badge & Image */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden shrink-0 bg-black">
          <ProtectedImage 
            src={vendor.imageUrl} 
            alt={vendor.name} 
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-90 group-hover:opacity-100"
            containerClassName="w-full h-full"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute top-4 left-4 z-20">
            <motion.div 
              animate={{ boxShadow: ['0 0 0 0 rgba(212,175,55,0.7)', '0 0 0 10px rgba(212,175,55,0)'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-brand-gold text-white text-[11px] uppercase tracking-widest font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-yellow-300"
            >
              <Crown size={14} fill="currentColor" /> Promoted Ad
            </motion.div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20">
            <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-lg">
              {vendor.name}
            </h3>
            <div className="flex items-center gap-3 text-white/90">
              <span className="flex items-center gap-1 text-sm font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                <Star size={14} className="text-brand-gold" fill="currentColor" /> {vendor.rating}
              </span>
              <span className="text-sm font-medium flex items-center gap-1.5 opacity-90">
                <MapPin size={14} /> {vendor.location}
              </span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-b from-brand-gold/5 to-transparent relative z-10">
          <div className="flex-1 w-full">
            <div className="flex flex-wrap gap-2 mb-4">
              {schema.featuresList.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="flex items-center gap-1.5 text-xs font-bold text-brand-gold bg-brand-gold/10 px-3 py-1.5 rounded-lg border border-brand-gold/20">
                  <Award size={14} /> {feature}
                </span>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-500 line-clamp-2 pr-4">
              {vendor.customBlocks?.policies?.[0]?.value || 'Book today to secure your date with one of the most highly rated vendors in the region. Contact for custom quotes and availability.'}
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 shrink-0 border-t border-brand-gold/10 pt-4 md:border-0 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest block mb-1">Starting At</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900">{vendor.pricePerPlate}</span>
                <span className="text-xs font-bold text-gray-400">{schema.pricingUnit.replace('/', '/ ')}</span>
              </div>
            </div>
            
            <button className="bg-gray-900 hover:bg-brand-primary text-white p-4 rounded-2xl shadow-lg transition-colors group-hover:animate-pulse">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default React.memo(PromotedVendorCard);
