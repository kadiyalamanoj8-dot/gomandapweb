import React, { useRef, useEffect, useCallback, useState } from 'react';
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
  'Banquet Halls':              '/images/resized/3d_venue copy.webp',
  'Kalyana Mandapams':          '/images/resized/temple_mandap copy.webp',
  'Open Lawns & Farmhouses':    '/images/resized/3d_lawn_farmhouse_1780657291134 copy.webp',
  'Resorts & Destination Venues':'/images/resized/modern_gazebo copy.webp',
  '5-Star Hotels':              '/images/resized/3d_5star_hotel_1780657276128 copy.webp',
  'Party & Mini Halls':         '/images/resized/neon_sangeet_stage copy.webp',
  'Temples & Ashrams':          '/images/resized/temple_mandap copy.webp',
  'Catering Service':           '/images/resized/3d_food copy.webp',
  'Stage & Venue Decor':        '/images/resized/3d_decor copy.webp',
  'Photography & Videography':  '/images/resized/3d_camera copy.webp',
  'DJs & Sound Systems':        '/images/resized/3d_dj copy.webp',
  'Live Musicians / Band Baaja':'/images/resized/3d_band copy.webp',
  'Makeup Artists (MUA)':       '/images/resized/3d_makeup copy.webp',
  'Mehndi Designers':           '/images/resized/3d_mehndi_1780657262687 copy.webp',
  'Wedding Clothes / Boutiques':'/images/resized/3d_clothes copy.webp',
  'Jewelry Shops':              '/images/resized/3d_jewelry copy.webp',
  'Wedding Cards & Invites':    '/images/resized/3d_invitation copy.webp',
  'Cars & Buses (Travel)':      '/images/resized/3d_car copy.webp',
  'Astrologers / Pundits':      '/images/resized/3d_astrologer copy.webp',
  'Honeymoon Packages':         '/images/resized/3d_honeymoon copy.webp',
  'Event Planners':             '/images/resized/3d_planner copy.webp',
};

// ── 3D Liquid Glass Card (No Tilt) ───────────────────────────────────────────
const SimpleAnimatedIconCard = ({ cat, icon3d, iconName, delay, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      className="cursor-pointer flex flex-col items-center gap-3 p-4 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] rounded-[24px] transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative z-10 w-20 h-20 flex items-center justify-center">
        {icon3d ? (
          <img
            src={icon3d}
            alt={cat.label}
            fetchpriority={delay < 0.2 ? 'high' : 'auto'}
            loading={delay < 0.2 ? 'eager' : 'lazy'}
            className="w-full h-full object-contain drop-shadow-md"
            style={{ pointerEvents: 'none' }}
          />
        ) : (
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-brand-primary shadow-inner">
            <IconComponent name={iconName} size={32} />
          </div>
        )}
      </div>

      <p className="text-center text-[12px] sm:text-sm font-bold text-gray-800 leading-tight px-1 group-hover:text-brand-primary transition-colors flex items-start justify-center">
        {cat.label}
      </p>
    </motion.div>
  );
};

// ── Main grid ─────────────────────────────────────────────────────────────
const VisualCategoryGrid = () => {
  const navigate = useNavigate();
  const { isCategoryEnabled } = useSettings();

  const activeVenueCategories  = VENUE_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));
  const activeVendorCategories = VENDOR_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));

  return (
    <section className="py-10 bg-gray-50/50">
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
            {activeVendorCategories.map((cat, idx) => (
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
