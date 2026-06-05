import React from 'react';
import { VENUE_CATEGORIES, VENDOR_CATEGORIES } from '../../data/mockData';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

const IconComponent = ({ name, ...props }) => {
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon {...props} />;
};

// Full icon map for ALL categories using the edited "copy" images
const ICON_MAP = {
  'Banquet Halls':              '/images/.webp',
  'Kalyana Mandapams':          '/images/.webp',
  'Open Lawns & Farmhouses':    '/images/.webp',
  'Resorts & Destination Venues':'/images/.webp',
  '5-Star Hotels':              '/images/.webp',
  'Party & Mini Halls':         '/images/.webp',
  'Temples & Ashrams':          '/images/.webp',
  'Catering Service':           '/images/.webp',
  'Stage & Venue Decor':        '/images/.webp',
  'Photography & Videography':  '/images/.webp',
  'DJs & Sound Systems':        '/images/.webp',
  'Live Musicians / Band Baaja':'/images/.webp',
  'Makeup Artists (MUA)':       '/images/.webp',
  'Mehndi Designers':           '/images/.webp',
  'Wedding Clothes / Boutiques':'/images/.webp',
  'Jewelry Shops':              '/images/.webp',
  'Wedding Cards & Invites':    '/images/.webp',
  'Cars & Buses (Travel)':      '/images/.webp',
  'Astrologers / Pundits':      '/images/.webp',
  'Honeymoon Packages':         '/images/.webp',
  'Event Planners':             '/images/.webp',
};

// Simple animated icon component without borders or containers
const SimpleAnimatedIconCard = ({ cat, icon3d, iconName, delay, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay, duration: 0.4 }}
      className="cursor-pointer group flex flex-col items-center gap-2"
      onClick={onClick}
    >
      {/* Container just for the image and floating animation */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 3, 
          ease: "easeInOut",
          delay: delay * 2 // stagger the animation start slightly
        }}
        className="relative z-10 w-24 h-24 flex items-center justify-center"
      >
        {icon3d ? (
          <img
            src={icon3d}
            alt={cat.label}
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.15)) drop-shadow(0 5px 10px rgba(0,0,0,0.1))',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <IconComponent name={iconName} size={32} />
          </div>
        )}
      </motion.div>
      
      {/* Label */}
      <p className="text-center text-[12px] sm:text-sm font-bold text-gray-800 leading-tight px-1 group-hover:text-brand-primary transition-colors flex items-start justify-center">
        {cat.label}
      </p>
    </motion.div>
  );
};

const VisualCategoryGrid = () => {
  const navigate = useNavigate();
  const { isCategoryEnabled } = useSettings();

  const activeVenueCategories  = VENUE_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));
  const activeVendorCategories = VENDOR_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));

  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">

        {/* ── VENUES ── */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1">Find Wedding Venues</h2>
            <p className="text-sm font-semibold text-gray-400">Discover the perfect location for your grand celebration.</p>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6 lg:gap-8">
            {activeVenueCategories.map((cat, idx) => (
              <SimpleAnimatedIconCard
                key={cat.id}
                cat={cat}
                iconName={cat.iconName}
                icon3d={ICON_MAP[cat.label]}
                delay={idx * 0.04}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.label)}`)}
              />
            ))}
          </div>
        </div>

        {/* ── VENDORS ── */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1">Book Expert Vendors</h2>
            <p className="text-sm font-semibold text-gray-400">From photographers to makeup artists, find the best professionals.</p>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6 lg:gap-8">
            {activeVendorCategories.slice(0, 14).map((cat, idx) => (
              <SimpleAnimatedIconCard
                key={cat.id}
                cat={cat}
                iconName={cat.iconName}
                icon3d={ICON_MAP[cat.label]}
                delay={idx * 0.04}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.label)}`)}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default VisualCategoryGrid;

