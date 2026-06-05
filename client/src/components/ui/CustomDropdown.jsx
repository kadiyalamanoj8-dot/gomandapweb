import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  icon: Icon,
  className = "",
  dropdownClassName = "",
  variant = "ios" // "ios", "glass", "light", "dark"
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
      menu: "bg-white/80 backdrop-blur-3xl border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-[24px] overflow-hidden divide-y divide-gray-200/50",
      item: "text-gray-900 hover:bg-black/5 transition-colors active:bg-black/10",
      activeItem: "text-brand-primary bg-brand-primary/5",
      menuIcon: "text-gray-500",
      activeMenuIcon: "text-brand-primary"
    },
    glass: {
      button: "bg-transparent text-white border-none",
      menu: "bg-black/70 backdrop-blur-3xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-[24px] overflow-hidden divide-y divide-white/10",
      item: "text-white hover:bg-white/10 transition-colors active:bg-white/20",
      activeItem: "text-amber-400 bg-white/5",
      menuIcon: "text-white/60",
      activeMenuIcon: "text-amber-400"
    },
    light: {
      button: "bg-white text-gray-900 border border-gray-200 shadow-sm hover:border-amber-400 focus:border-amber-500",
      menu: "bg-white border border-gray-100 shadow-2xl rounded-[20px] overflow-hidden divide-y divide-gray-100",
      item: "text-gray-700 hover:bg-gray-50",
      activeItem: "bg-brand-primary/5 text-brand-primary",
      menuIcon: "text-gray-400",
      activeMenuIcon: "text-brand-primary"
    }
  };

  const currentStyle = variants[variant] || variants.ios;
  // If variant is iOS or Glass, we change the placeholder and arrow color to be sleek
  const isDarkBg = variant === 'glass';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-[18px] cursor-pointer transition-all duration-300 outline-none ${currentStyle.button} ${className}`}
      >
        <div className="flex items-center gap-2 w-full overflow-hidden">
          {Icon && <Icon className={isDarkBg ? "text-white" : (variant === 'ios' ? "text-white" : "text-gray-400")} size={20} strokeWidth={2.5} />}
          <span className={`truncate font-semibold text-[17px] tracking-tight ${!selectedOption && isDarkBg ? 'text-white/70' : ''} ${!selectedOption && variant === 'ios' ? 'text-white/80' : ''} ${!selectedOption && variant === 'light' ? 'text-gray-500' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={20} 
          strokeWidth={2.5}
          className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} ${isDarkBg || variant === 'ios' ? 'text-white/60' : 'text-gray-400'}`} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // Apple Spring
            className={`absolute z-[9999] w-full min-w-[220px] mt-2 ${currentStyle.menu} ${dropdownClassName}`}
            style={{ transformOrigin: 'top center', left: 0 }}
          >
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {normalizedOptions.map((option, idx) => {
                const isActive = option.value === value;
                return (
                  <div
                    key={option.value || idx}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`px-5 py-3.5 cursor-pointer flex items-center justify-between gap-3 ${isActive ? currentStyle.activeItem : currentStyle.item}`}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && <option.icon size={18} strokeWidth={2.5} className={isActive ? currentStyle.activeMenuIcon : currentStyle.menuIcon} />}
                      <span className={`text-[16px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{option.label}</span>
                    </div>
                    {/* iOS style Checkmark for active item */}
                    {isActive && <Check size={18} strokeWidth={3} className={currentStyle.activeMenuIcon} />}
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
