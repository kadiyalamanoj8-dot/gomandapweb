import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLLECTIONS = [
  {
    id: 1,
    title: 'Heritage Mandapams',
    subtitle: 'Timeless architecture for your Kalyanam',
    image: '/images/temple_mandap.webp',
    category: 'Kalyana Mandapams',
    color: 'from-orange-500/80 to-red-600/80'
  },
  {
    id: 2,
    title: 'Elite Sangeet Decor',
    subtitle: 'Neon, glitz, and absolute glamour',
    image: '/images/neon_sangeet_stage.webp',
    category: 'Stage & Venue Decor',
    color: 'from-purple-500/80 to-pink-600/80'
  },
  {
    id: 3,
    title: 'Luxury Resorts',
    subtitle: 'Destination weddings redefined',
    image: '/images/modern_gazebo.webp',
    category: 'Resorts & Destination Venues',
    color: 'from-blue-500/80 to-emerald-600/80'
  },
  {
    id: 4,
    title: 'Master Photographers',
    subtitle: 'Capture every stolen glance',
    image: '/images/royal_arch_mandap.webp',
    category: 'Photography & Videography',
    color: 'from-amber-500/80 to-orange-600/80'
  }
];

const CuratedCollections = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-[#FAFAFC]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-[32px] md:text-[48px] font-black tracking-tighter text-[#1D1D1F] leading-[1.1] mb-3">
              Curated Collections.
            </h2>
            <p className="text-[19px] font-medium text-[#86868B]">
              Handpicked venues and vendors for extraordinary celebrations.
            </p>
          </div>
          <button className="text-[15px] font-bold text-brand-primary flex items-center gap-1 hover:text-red-700 transition-colors w-fit">
            Explore All <ArrowRight size={16} />
          </button>
        </div>

        {/* Horizontal Scroll Snap Container */}
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {COLLECTIONS.map((col, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              key={col.id} 
              onClick={() => navigate(`/search?category=${encodeURIComponent(col.category)}`)}
              className="min-w-[300px] md:min-w-[400px] h-[450px] rounded-[2rem] overflow-hidden relative group snap-start shrink-0 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500"
            >
              <img 
                src={col.image} 
                alt={col.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" 
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${col.color} opacity-60 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-40`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-bold tracking-widest uppercase border border-white/30 shadow-sm">
                     Featured
                   </span>
                   <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                     <ArrowRight size={18} />
                   </div>
                </div>
                
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-black text-white leading-tight tracking-tight mb-2 drop-shadow-md">
                    {col.title}
                  </h3>
                  <p className="text-[15px] font-medium text-white/90 drop-shadow-sm">
                    {col.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedCollections;
