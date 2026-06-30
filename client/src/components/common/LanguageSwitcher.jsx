import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const ALL_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { activeLanguages } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  // Only show the switcher if there is more than one active language
  if (!activeLanguages || activeLanguages.length <= 1) return null;

  const activeLangObjects = ALL_LANGUAGES.filter(lang => activeLanguages.includes(lang.code));
  const currentLang = activeLangObjects.find(l => l.code === i18n.language) || activeLangObjects[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
      >
        <Globe size={16} />
        <span className="hidden sm:inline-block">{currentLang.nativeName}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          {activeLangObjects.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                i18n.language === lang.code 
                  ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                  : 'text-gray-700 hover:bg-gray-50 font-medium'
              }`}
            >
              <span>{lang.nativeName}</span>
              <span className="text-[10px] text-gray-400 uppercase">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
