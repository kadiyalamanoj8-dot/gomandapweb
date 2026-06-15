import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle2, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const AnimatedVendorCard = ({ vendor }) => {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const handleCardClick = () => {
    navigate(`/vendor/${vendor.id || vendor._id}`);
  };

  const handleRequestQuote = (e) => {
    e.stopPropagation(); // Prevent card click
    addToCart(vendor);
    setIsCartOpen(true);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative w-[280px] sm:w-[320px] shrink-0 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container with Gradient Overlay */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={vendor.imageUrl || vendor.portfolioImages?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'}
          alt={vendor.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
        
        {/* Featured Badge */}
        {(vendor.featured || vendor.rating > 4.7) && (
          <div className="absolute top-4 left-4 bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
            Must Book
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
          <Star size={12} className="text-brand-gold fill-brand-gold" /> {vendor.rating || '4.5'}
        </div>

        {/* Floating Category Tag */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-brand-gold/90 mb-1">{vendor.category}</div>
          <h3 className="text-lg font-black leading-tight drop-shadow-md truncate w-60">{vendor.name}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={14} className="text-brand-primary/60 shrink-0" />
            <span className="truncate">{vendor.location || vendor.address?.city || 'India'}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-900 font-black shrink-0">
            <IndianRupee size={14} className="text-gray-400" />
            {vendor.pricePerPlate || vendor.pricing?.standardPrice || '₹1,500'}
            <span className="text-[10px] text-gray-400 font-semibold ml-0.5">/ day</span>
          </div>
        </div>

        {/* Quick Features */}
        <div className="flex flex-wrap gap-2">
          {['Verified Profile', 'Instant Booking'].map((feat, i) => (
            <span key={i} className="flex items-center gap-1 bg-gray-50 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100">
              <CheckCircle2 size={10} className="text-brand-primary" /> {feat}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleRequestQuote}
          className="w-full bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 hover:border-transparent py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 group/btn"
        >
          <span>Request Quote</span>
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            className="group-hover/btn:text-white"
          >
            →
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
};

export default AnimatedVendorCard;
