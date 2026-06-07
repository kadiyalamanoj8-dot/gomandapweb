import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const ApplePicker = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  className = '', 
  icon: Icon,
  buttonClassName = '' 
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
        className={`w-full flex items-center justify-between bg-black hover:bg-white/5 active:bg-white/10 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-[#D4AF37] transition-all text-left shadow-lg cursor-pointer ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {Icon && <Icon size={18} className="text-white/30 shrink-0" />}
          <span className={selectedOption ? 'text-white' : 'text-white/40'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`text-white/30 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] mt-1.5 w-full bg-[#111]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in slide-in-from-top-1 duration-150 origin-top">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg text-left transition-colors ${
                    isSelected 
                      ? 'bg-white/10 text-[#D4AF37]' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-[#D4AF37] shrink-0" />}
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
