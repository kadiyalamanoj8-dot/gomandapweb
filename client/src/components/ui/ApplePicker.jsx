import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const ApplePicker = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  className = '', 
  icon: Icon,
  buttonClassName = '',
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-left ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {Icon && <Icon size={20} className="text-white/40 shrink-0" />}
          <span className={selectedOption ? 'text-white' : 'text-white/40'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`text-white/30 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-1.5 animate-in fade-in duration-150 ${
          position === 'top' 
            ? 'bottom-full mb-2 origin-bottom slide-in-from-bottom-1' 
            : 'mt-2 origin-top slide-in-from-top-1'
        }`}>
          <div className="max-h-60 overflow-y-auto space-y-0.5 no-scrollbar">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl text-left transition-colors ${
                    isSelected 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={16} className="text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplePicker;
