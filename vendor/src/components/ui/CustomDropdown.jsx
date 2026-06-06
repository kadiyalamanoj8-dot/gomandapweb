import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

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
      // Dark clear glass — used in hero / dark backgrounds
      button: "bg-transparent text-white border-none",
      menu: "bg-black/25 backdrop-blur-2xl border border-white/15 border-t-white/30 shadow-[inset_0_1px_3px_rgba(255,255,255,0.15),0_24px_48px_rgba(0,0,0,0.6)] rounded-[22px] overflow-hidden",
      itemBase: "text-white/90 hover:bg-white/8 hover:text-white transition-colors",
      activeText: "text-white font-semibold",
      activeBg: "bg-white/10",
      divider: "border-white/[0.06]",
      placeholder: "text-white/45",
    },
    glass: {
      button: "bg-transparent text-white border-none",
      menu: "bg-black/25 backdrop-blur-2xl border border-white/15 border-t-white/30 shadow-[inset_0_1px_3px_rgba(255,255,255,0.15),0_24px_48px_rgba(0,0,0,0.6)] rounded-[22px] overflow-hidden",
      itemBase: "text-white/90 hover:bg-white/8 hover:text-white transition-colors",
      activeText: "text-white font-semibold",
      activeBg: "bg-white/10",
      divider: "border-white/[0.06]",
      placeholder: "text-white/45",
    },
    light: {
      // Light glass — vendor/admin panels on white/gray backgrounds
      button: "bg-white/70 text-gray-800 border border-gray-200/70 shadow-sm hover:border-gray-300 backdrop-blur-sm px-4 py-3 rounded-2xl",
      menu: "bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_16px_48px_rgba(0,0,0,0.09)] rounded-[20px] overflow-hidden",
      itemBase: "text-gray-700 hover:bg-gray-50 transition-colors",
      activeText: "text-gray-900 font-semibold",
      activeBg: "bg-gray-50",
      divider: "border-gray-100",
      placeholder: "text-gray-400",
    }
  };

  const s = variants[variant] || variants.ios;
  const isDark = variant === 'glass' || variant === 'ios';

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

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 z-[9999] w-full min-w-[200px] mt-2 ${s.menu} ${dropdownClassName}`}
            style={{ transformOrigin: 'top center' }}
          >
            <div 
              className="max-h-[300px] overflow-y-auto overscroll-contain" 
              style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
            >
              {normalizedOptions.map((option, idx) => {
                const isActive = option.value === value;
                return (
                  <div
                    key={option.value || idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      px-5 py-3 cursor-pointer flex items-center justify-between gap-3 
                      border-b last:border-b-0 ${s.divider}
                      ${isActive ? s.activeBg : s.itemBase}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <option.icon 
                          size={17} strokeWidth={2} 
                          className={isDark ? (isActive ? 'text-white/80' : 'text-white/40') : (isActive ? 'text-gray-600' : 'text-gray-400')} 
                        />
                      )}
                      <span className={`text-[14.5px] tracking-tight ${isActive ? s.activeText : 'font-normal'}`}>
                        {option.label}
                      </span>
                    </div>
                    {isActive && (
                      <Check 
                        size={15} strokeWidth={2.5} 
                        className={isDark ? 'text-white/70' : 'text-gray-500'} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
