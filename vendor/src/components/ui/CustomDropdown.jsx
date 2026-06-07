import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import AppleScrollPicker from './AppleScrollPicker';

const CustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select...", 
  icon: Icon,
  className = "",
  dropdownClassName = "",
  variant = "ios" // "ios", "glass", "light"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  const variants = {
    ios: {
      button: "bg-transparent text-white border-none",
      menu: "bg-black/25 backdrop-blur-2xl border border-white/15 border-t-white/30 shadow-[inset_0_1px_3px_rgba(255,255,255,0.15),0_24px_48px_rgba(0,0,0,0.6)] rounded-[22px] overflow-hidden p-3",
      placeholder: "text-white/45",
      theme: "dark"
    },
    glass: {
      button: "bg-transparent text-white border-none",
      menu: "bg-black/25 backdrop-blur-2xl border border-white/15 border-t-white/30 shadow-[inset_0_1px_3px_rgba(255,255,255,0.15),0_24px_48px_rgba(0,0,0,0.6)] rounded-[22px] overflow-hidden p-3",
      placeholder: "text-white/45",
      theme: "dark"
    },
    light: {
      button: "bg-white/70 text-gray-800 border border-gray-200/70 shadow-sm hover:border-gray-300 backdrop-blur-sm px-4 py-3 rounded-2xl",
      menu: "bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_16px_48px_rgba(0,0,0,0.09)] rounded-[20px] overflow-hidden p-3",
      placeholder: "text-gray-400",
      theme: "light"
    }
  };

  const s = variants[variant] || variants.ios;
  const isDark = s.theme === 'dark';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-[18px] cursor-pointer transition-all duration-200 outline-none ${s.button} ${className}`}
      >
        <div className="flex items-center gap-2 w-full overflow-hidden pointer-events-none">
          {Icon && (
            <Icon 
              className={isDark ? "text-white/55" : "text-gray-400"} 
              size={18} strokeWidth={2} 
            />
          )}
          <span className={`truncate font-semibold text-[16px] tracking-tight ${!selectedOption ? s.placeholder : (isDark ? 'text-white' : 'text-gray-800')}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          strokeWidth={2}
          className={`shrink-0 transition-transform duration-250 ${isOpen ? 'rotate-180' : 'rotate-0'} ${isDark ? 'text-white/35' : 'text-gray-350'}`} 
        />
      </div>

      {/* Menu - Upgraded to Apple Scroll Picker */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 z-[9999] w-full min-w-[280px] mt-2 flex flex-col gap-3 ${s.menu} ${dropdownClassName}`}
            style={{ transformOrigin: 'top center' }}
          >
            <div className="flex justify-between items-center px-2 pt-1">
              <span className={`text-sm font-bold ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{placeholder}</span>
              <button 
                onClick={() => setIsOpen(false)}
                className={`text-sm font-bold px-3 py-1 rounded-lg ${
                  isDark ? 'bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Done
              </button>
            </div>
            
            <div className="w-full flex justify-center pb-1">
              <AppleScrollPicker 
                columns={[{ options: normalizedOptions, value, onChange }]} 
                theme={s.theme} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
