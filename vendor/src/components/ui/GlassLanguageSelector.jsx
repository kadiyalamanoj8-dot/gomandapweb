import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import axios from 'axios';

const ALL_LANGUAGES = {
  en: { name: 'English', native: 'English' },
  hi: { name: 'Hindi', native: 'हिन्दी' },
  te: { name: 'Telugu', native: 'తెలుగు' },
  ta: { name: 'Tamil', native: 'தமிழ்' },
  mr: { name: 'Marathi', native: 'मराठी' },
  bn: { name: 'Bengali', native: 'বাংলা' }
};

const GlassLanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLanguages, setActiveLanguages] = useState(['en']);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchLangs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings');
        if (res.data?.data?.activeLanguages) {
          setActiveLanguages(res.data.data.activeLanguages);
        }
      } catch (err) {
        console.error('Failed to fetch languages:', err);
      }
    };
    fetchLangs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const currentLang = ALL_LANGUAGES[i18n.language] || ALL_LANGUAGES['en'];

  if (activeLanguages.length <= 1) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white font-medium shadow-[0_4px_15px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 transition-all z-50"
      >
        <Globe size={18} className="text-brand-gold" />
        <span className="text-sm md:text-base hidden sm:block">{currentLang.native}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-48 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
          >
            <div className="p-2 space-y-1">
              {activeLanguages.map((code) => {
                const lang = ALL_LANGUAGES[code];
                if (!lang) return null;
                const isActive = i18n.language === code;

                return (
                  <button
                    key={code}
                    onClick={() => changeLanguage(code)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-brand-gold/20 text-brand-gold font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-xs opacity-50">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassLanguageSelector;
