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
  'Banquet Halls':              '/images/3d_venue copy.webp',
  'Kalyana Mandapams':          '/images/temple_mandap copy.webp',
  'Open Lawns & Farmhouses':    '/images/3d_lawn_farmhouse_1780657291134 copy.webp',
  'Resorts & Destination Venues':'/images/modern_gazebo copy.webp',
  '5-Star Hotels':              '/images/3d_5star_hotel_1780657276128 copy.webp',
  'Party & Mini Halls':         '/images/neon_sangeet_stage copy.webp',
  'Temples & Ashrams':          '/images/temple_mandap copy.webp',
  'Catering Service':           '/images/3d_food copy.webp',
  'Stage & Venue Decor':        '/images/3d_decor copy.webp',
  'Photography & Videography':  '/images/3d_camera copy.webp',
  'DJs & Sound Systems':        '/images/3d_dj copy.webp',
  'Live Musicians / Band Baaja':'/images/3d_band copy.webp',
  'Makeup Artists (MUA)':       '/images/3d_makeup copy.webp',
  'Mehndi Designers':           '/images/3d_mehndi_1780657262687 copy.webp',
  'Wedding Clothes / Boutiques':'/images/3d_clothes copy.webp',
  'Jewelry Shops':              '/images/3d_jewelry copy.webp',
  'Wedding Cards & Invites':    '/images/3d_invitation copy.webp',
  'Cars & Buses (Travel)':      '/images/3d_car copy.webp',
  'Astrologers / Pundits':      '/images/3d_astrologer copy.webp',
  'Honeymoon Packages':         '/images/3d_honeymoon copy.webp',
  'Event Planners':             '/images/3d_planner copy.webp',
};

// Subtle gyro offset — shared across all cards, updated from deviceorientation
const gyroState = { rx: 0, ry: 0 };

// ── 3D Tilt Card ───────────────────────────────────────────────────────────
const SimpleAnimatedIconCard = ({ cat, icon3d, iconName, delay, onClick }) => {
  const cardRef = useRef(null);
  const rafRef  = useRef(null);
  const tiltRef = useRef({ x: 0, y: 0 });

  // Apply transform via RAF for buttery-smooth rendering
  const applyTransform = useCallback((tx, ty) => {
    if (!cardRef.current) return;
    const MAX_TILT = 14;  // degrees max tilt on hover
    const rx = Math.max(-MAX_TILT, Math.min(MAX_TILT, ty)); // rotateX
    const ry = Math.max(-MAX_TILT, Math.min(MAX_TILT, tx)); // rotateY
    cardRef.current.style.transform =
      `perspective(600px) rotateX(${-rx}deg) rotateY(${ry}deg) scale3d(1.06,1.06,1.06)`;
  }, []);

  const resetTransform = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      `perspective(600px) rotateX(${gyroState.rx}deg) rotateY(${gyroState.ry}deg) scale3d(1,1,1)`;
  }, []);

  const onMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2); // -1..1
    const dy = (e.clientY - cy) / (rect.height / 2); // -1..1
    tiltRef.current = { x: dx * 14, y: dy * 14 };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() =>
      applyTransform(tiltRef.current.x, tiltRef.current.y)
    );
  }, [applyTransform]);

  const onMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
      resetTransform();
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = '';
      }, 500);
    }
  }, [resetTransform]);

  // Gyro tick — only desktop applies tilt on hover; gyro nudges idle state
  useEffect(() => {
    let tick;
    const update = () => {
      if (cardRef.current && !cardRef.current.matches(':hover')) {
        cardRef.current.style.transform =
          `perspective(600px) rotateX(${gyroState.rx}deg) rotateY(${gyroState.ry}deg) scale3d(1,1,1)`;
      }
      tick = requestAnimationFrame(update);
    };
    tick = requestAnimationFrame(update);
    return () => cancelAnimationFrame(tick);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay, duration: 0.4 }}
      className="cursor-pointer flex flex-col items-center gap-2"
      onClick={onClick}
    >
      {/* 3D tilt container */}
      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative z-10 w-24 h-24 flex items-center justify-center"
        style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
      >
        {icon3d ? (
          <img
            src={icon3d}
            alt={cat.label}
            fetchpriority={delay < 0.2 ? 'high' : 'auto'}
            loading={delay < 0.2 ? 'eager' : 'lazy'}
            className="w-full h-full object-contain"
            style={{ pointerEvents: 'none' }}
          />
        ) : (
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <IconComponent name={iconName} size={32} />
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-center text-[12px] sm:text-sm font-bold text-gray-800 leading-tight px-1 group-hover:text-brand-primary transition-colors flex items-start justify-center">
        {cat.label}
      </p>
    </motion.div>
  );
};

// ── Gyro listener (mobile) — very subtle, capped at ±3° ──────────────────
const GyroListener = () => {
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const MAX = 3; // degrees max nudge from gyro
    const handle = (e) => {
      // gamma = left/right tilt, beta = front/back tilt
      const ry =  (e.gamma ?? 0) * 0.06;  // very small factor
      const rx = -(e.beta  ?? 0) * 0.04;
      gyroState.ry = Math.max(-MAX, Math.min(MAX, ry));
      gyroState.rx = Math.max(-MAX, Math.min(MAX, rx));
    };

    window.addEventListener('deviceorientation', handle, { passive: true });
    return () => window.removeEventListener('deviceorientation', handle);
  }, []);

  return null;
};

// ── Main grid ─────────────────────────────────────────────────────────────
const VisualCategoryGrid = () => {
  const navigate = useNavigate();
  const { isCategoryEnabled } = useSettings();

  const activeVenueCategories  = VENUE_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));
  const activeVendorCategories = VENDOR_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));

  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
      <GyroListener />
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
