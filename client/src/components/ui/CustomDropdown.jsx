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

  // LOGO GRADIENT: #DC2626 to #EF4444 (Gomandap brand)
  const logoGradient = 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)';

  const variants = {
    ios: {
      button: "bg-transparent text-white border-none",
      menu: "bg-black/20 backdrop-blur-xl border border-white/20 border-t-white/40 shadow-[inset_0_1px_4px_rgba(255,255,255,0.25),0_30px_60px_rgba(0,0,0,0.7)] rounded-[24px] overflow-hidden",
      item: "text-white hover:bg-white/10 transition-colors active:bg-white/20",
      activeItemBg: "bg-white/10",
      menuIcon: "text-white/50",
    },
    glass: {
      button: "bg-transparent text-white border-none",
      menu: "bg-black/20 backdrop-blur-xl border border-white/20 border-t-white/40 shadow-[inset_0_1px_4px_rgba(255,255,255,0.25),0_30px_60px_rgba(0,0,0,0.7)] rounded-[24px] overflow-hidden",
      item: "text-white hover:bg-white/10 transition-colors active:bg-white/20",
      activeItemBg: "bg-white/10",
      menuIcon: "text-white/50",
    },
    light: {
      button: "bg-white/60 text-gray-900 border border-gray-200/60 shadow-sm hover:border-red-400 backdrop-blur-sm px-4 py-3 rounded-2xl",
      menu: "bg-white/90 backdrop-blur-xl border border-gray-200/60 shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[24px] overflow-hidden",
      item: "text-gray-800 hover:bg-red-50/60 transition-colors active:bg-red-100/60",
      activeItemBg: "bg-red-50/60",
      menuIcon: "text-gray-400",
    }
  };

  const currentStyle = variants[variant] || variants.ios;
  const isDark = variant === 'glass' || variant === 'ios';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-[18px] cursor-pointer transition-all duration-300 outline-none ${currentStyle.button} ${className}`}
      >
        <div className="flex items-center gap-2 w-full overflow-hidden pointer-events-none">
          {Icon && <Icon className={isDark ? "text-white/70" : "text-gray-400"} size={20} strokeWidth={2.5} />}
          <span className={`truncate font-semibold text-[17px] tracking-tight ${!selectedOption ? (isDark ? 'text-white/60' : 'text-gray-400') : (isDark ? 'text-white' : 'text-gray-900')}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={18} 
          strokeWidth={2.5}
          className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} ${isDark ? 'text-white/50' : 'text-gray-400'}`} 
        />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 z-[9999] w-full min-w-[220px] mt-2 ${currentStyle.menu} ${dropdownClassName}`}
            style={{ transformOrigin: 'top center' }}
          >
            <div className="max-h-[320px] overflow-y-auto overscroll-contain" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
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
                    className={`px-5 py-3.5 cursor-pointer flex items-center justify-between gap-3 border-b last:border-b-0 ${isDark ? 'border-white/[0.07]' : 'border-gray-100'} ${isActive ? currentStyle.activeItemBg : currentStyle.item}`}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <option.icon 
                          size={18} strokeWidth={2.5} 
                          className={!isActive ? currentStyle.menuIcon : ''} 
                          style={isActive ? {color: '#EF4444'} : {}} 
                        />
                      )}
                      <span 
                        className={`text-[15px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}
                        style={isActive ? {background: logoGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'} : {}}
                      >
                        {option.label}
                      </span>
                    </div>
                    {isActive && (
                      <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{background: logoGradient}}>
                        <Check size={11} strokeWidth={3} className="text-white" />
                      </div>
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
