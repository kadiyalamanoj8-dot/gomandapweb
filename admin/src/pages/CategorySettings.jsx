import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, CheckCircle2, XCircle, Loader2, Globe, ShieldAlert } from 'lucide-react';

// All categories — mirrors the mockData structure exactly
const CATEGORY_BUCKETS = [
  {
    id: 'function-places',
    label: '🏛️ Function Places',
    subtitle: 'Venues for grand celebrations.',
    categories: [
      { id: 'banquet-halls', label: 'Banquet Halls' },
      { id: 'kalyana-mandapams', label: 'Kalyana Mandapams' },
      { id: 'open-lawns', label: 'Open Lawns & Farmhouses' },
      { id: 'resorts', label: 'Resorts & Destination Venues' },
      { id: '5-star-hotels', label: '5-Star Hotels' },
      { id: 'party-halls', label: 'Party & Mini Halls' },
      { id: 'temples', label: 'Temples & Ashrams' },
    ],
  },
  {
    id: 'food-decor',
    label: '🍲 Food & Decoration',
    subtitle: 'Core essentials to make your event unforgettable.',
    categories: [
      { id: 'catering', label: 'Catering Service' },
      { id: 'decor', label: 'Stage & Venue Decor' },
      { id: 'planners', label: 'Event Planners' },
    ],
  },
  {
    id: 'photos-music',
    label: '📸 Photos & Music',
    subtitle: 'Capture memories and keep the party alive.',
    categories: [
      { id: 'photography', label: 'Photography & Videography' },
      { id: 'djs', label: 'DJs & Sound Systems' },
      { id: 'live-musicians', label: 'Live Musicians / Band Baaja' },
    ],
  },
  {
    id: 'styling',
    label: '💅 Bridal & Groom Styling',
    subtitle: 'Look and feel your absolute best.',
    categories: [
      { id: 'makeup-artists', label: 'Makeup Artists (MUA)' },
      { id: 'mehndi-specialists', label: 'Mehndi Designers' },
      { id: 'wedding-wear', label: 'Wedding Clothes / Boutiques' },
      { id: 'jewelry-providers', label: 'Jewelry Shops' },
    ],
  },
  {
    id: 'logistics',
    label: '🚗 Invites & Travel',
    subtitle: 'From the first invitation to the honeymoon.',
    categories: [
      { id: 'invitation-designers', label: 'Wedding Cards & Invites' },
      { id: 'transportation', label: 'Cars & Buses (Travel)' },
      { id: 'astrologers', label: 'Astrologers / Pundits' },
      { id: 'honeymoon-travel', label: 'Honeymoon Packages' },
    ],
  },
];

const API_BASE = import.meta.env.VITE_API_URL || 'https://gomandap-api.onrender.com';

// Animated Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, loading }) => (
  <button
    onClick={onChange}
    disabled={loading}
    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
      enabled ? 'bg-green-500' : 'bg-gray-300'
    } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
    role="switch"
    aria-checked={enabled}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
    {loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <Loader2 size={12} className="animate-spin text-white" />
      </span>
    )}
  </button>
);

const CategorySettings = () => {
  const [disabledCategories, setDisabledCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingCategory, setTogglingCategory] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const data = await res.json();
      if (data.success) {
        setDisabledCategories(data.data.disabledCategories || []);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (categoryLabel) => {
    const currentlyEnabled = !disabledCategories.includes(categoryLabel);
    const newEnabledState = !currentlyEnabled; // what we WANT it to become

    setTogglingCategory(categoryLabel);

    try {
      const res = await fetch(`${API_BASE}/api/settings/categories/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryLabel, enabled: newEnabledState }),
      });
      const data = await res.json();

      if (data.success) {
        setDisabledCategories(data.data.disabledCategories || []);
        showNotification(
          newEnabledState
            ? `✅ "${categoryLabel}" is now LIVE`
            : `🔴 "${categoryLabel}" is now HIDDEN`,
          newEnabledState ? 'success' : 'warning'
        );
      }
    } catch (err) {
      console.error('Toggle failed:', err);
      showNotification('Failed to update. Check server connection.', 'error');
    } finally {
      setTogglingCategory(null);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const isCategoryEnabled = (label) => !disabledCategories.includes(label);

  const totalCategories = CATEGORY_BUCKETS.flatMap(b => b.categories).length;
  const activeCategories = totalCategories - disabledCategories.length;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-brand-primary" />
          <p className="font-bold text-gray-500">Loading Category Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl font-bold text-white shadow-2xl text-sm ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'warning' ? 'bg-orange-500' : 'bg-red-500'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-xl">
              <Sliders size={24} className="text-brand-primary" />
            </div>
            Category Controls
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-medium mt-1">
            Toggle categories on or off globally. Changes are reflected <strong>instantly</strong> in the Client and Vendor apps.
          </p>
        </div>

        {/* Live Stats */}
        <div className="flex gap-3">
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-center">
            <div className="text-2xl font-black text-green-600">{activeCategories}</div>
            <div className="text-xs font-bold text-green-500 uppercase tracking-wide">Active</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center">
            <div className="text-2xl font-black text-red-600">{disabledCategories.length}</div>
            <div className="text-xs font-bold text-red-500 uppercase tracking-wide">Hidden</div>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-center">
            <div className="text-2xl font-black text-gray-700">{totalCategories}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {disabledCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3"
        >
          <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              {disabledCategories.length} {disabledCategories.length === 1 ? 'category is' : 'categories are'} currently hidden from the platform.
            </p>
            <p className="text-xs font-semibold text-amber-600 mt-0.5">
              Hidden: {disabledCategories.join(', ')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Category Buckets */}
      <div className="space-y-8">
        {CATEGORY_BUCKETS.map((bucket) => (
          <div key={bucket.id}>
            {/* Bucket Header */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-black text-gray-800">{bucket.label}</h2>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {bucket.categories.filter(c => isCategoryEnabled(c.label)).length}/{bucket.categories.length} active
              </span>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {bucket.categories.map((cat) => {
                const enabled = isCategoryEnabled(cat.label);
                const isToggling = togglingCategory === cat.label;

                return (
                  <motion.div
                    key={cat.id}
                    layout
                    animate={{ opacity: enabled ? 1 : 0.5 }}
                    transition={{ duration: 0.3 }}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                      enabled
                        ? 'bg-white border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md'
                        : 'bg-gray-50 border-dashed border-gray-200'
                    }`}
                  >
                    {/* Status Ribbon */}
                    <div className={`absolute top-3 right-3`}>
                      {enabled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          <Globe size={8} /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                          <XCircle size={8} /> Hidden
                        </span>
                      )}
                    </div>

                    <div className="pr-12 mb-4">
                      <p className={`font-black text-sm leading-snug ${enabled ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                        {cat.label}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">
                        {enabled ? 'Tap to hide' : 'Tap to show'}
                      </span>
                      <ToggleSwitch
                        enabled={enabled}
                        onChange={() => handleToggle(cat.label)}
                        loading={isToggling}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySettings;
