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
    ios: { // Dark Clear 3D Glass (for hero sections)
      button: "bg-transparent text-white border-none",
      menu: "bg-black/10 backdrop-blur-md border border-white/20 border-t-white/40 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3),0_30px_60px_rgba(0,0,0,0.6)] rounded-[24px] overflow-hidden divide-y divide-white/10",
      item: "text-white hover:bg-white/10 transition-colors active:bg-white/20",
      activeItem: "text-white font-bold bg-white/10",
      menuIcon: "text-white/60",
      activeMenuIcon: "text-white"
    },
    glass: { // Dark Clear 3D Glass
      button: "bg-transparent text-white border-none",
      menu: "bg-black/10 backdrop-blur-md border border-white/20 border-t-white/40 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3),0_30px_60px_rgba(0,0,0,0.6)] rounded-[24px] overflow-hidden divide-y divide-white/10",
      item: "text-white hover:bg-white/10 transition-colors active:bg-white/20",
      activeItem: "text-white font-bold bg-white/10",
      menuIcon: "text-white/60",
      activeMenuIcon: "text-white"
    },
    light: { // Light Clear 3D Glass (for vendor/admin panels)
      button: "bg-transparent text-gray-900 border border-black/5 shadow-sm hover:border-brand-primary focus:border-brand-primary px-4 py-3 rounded-xl",
      menu: "bg-white/20 backdrop-blur-md border border-white/50 border-t-white/80 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),0_20px_50px_rgba(0,0,0,0.1)] rounded-[24px] overflow-hidden divide-y divide-black/5",
      item: "text-gray-900 hover:bg-white/40 transition-colors active:bg-white/60",
      activeItem: "text-brand-primary font-bold bg-white/50",
      menuIcon: "text-gray-500",
      activeMenuIcon: "text-brand-primary"
    }
  };

  const currentStyle = variants[variant] || variants.ios;
  // If variant is iOS or Glass, we change the placeholder and arrow color to be sleek
  const isDarkBg = variant === 'glass';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Visual Button Display */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-[18px] cursor-pointer transition-all duration-300 outline-none ${currentStyle.button} ${className}`}
      >
        <div className="flex items-center gap-2 w-full overflow-hidden pointer-events-none">
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

      {/* Universal Custom Popover */}
      <div className="block">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute left-0 z-[9999] w-full min-w-[220px] mt-2 ${currentStyle.menu} ${dropdownClassName}`}
              style={{ transformOrigin: 'top center' }}
            >
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
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
                      className={`px-5 py-3.5 cursor-pointer flex items-center justify-between gap-3 ${isActive ? currentStyle.activeItem : currentStyle.item}`}
                    >
                      <div className="flex items-center gap-3">
                        {option.icon && <option.icon size={18} strokeWidth={2.5} className={isActive ? currentStyle.activeMenuIcon : currentStyle.menuIcon} />}
                        <span className={`text-[16px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{option.label}</span>
                      </div>
                      {isActive && <Check size={18} strokeWidth={3} className={currentStyle.activeMenuIcon} />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomDropdown;
