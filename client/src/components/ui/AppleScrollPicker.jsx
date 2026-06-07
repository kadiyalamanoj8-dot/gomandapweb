import React, { useRef, useEffect } from 'react';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

const ScrollColumn = ({ options, value, onChange, isDark }) => {
  const ulRef = useRef(null);
  const timeoutRef = useRef(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    if (!ulRef.current) return;
    const index = options.findIndex((o) => o.value === value);
    if (index >= 0) {
      isProgrammaticScroll.current = true;
      ulRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 300);
    }
  }, [value, options]);

  const handleScroll = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      if (!ulRef.current || isProgrammaticScroll.current) return;
      
      const scrollY = ulRef.current.scrollTop;
      const index = Math.round(scrollY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(options.length - 1, index));
      
      const newValue = options[clampedIndex].value;
      if (newValue !== value) {
        onChange(newValue);
      }
      
      ulRef.current.scrollTo({ top: clampedIndex * ITEM_HEIGHT, behavior: 'smooth' });
    }, 100);
  };

  return (
    <ul
      ref={ulRef}
      onScroll={handleScroll}
      className={`no-scrollbar flex-1 overflow-y-auto snap-y snap-mandatory relative outline-none overscroll-contain min-w-[60px] ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}
      style={{
        height: `${CONTAINER_HEIGHT}px`,
        paddingTop: `${PADDING}px`,
        paddingBottom: `${PADDING}px`,
      }}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <li
            key={opt.value}
            className={`snap-center flex items-center justify-center text-center font-medium transition-all duration-200 cursor-pointer px-2 ${
              isSelected 
                ? (isDark ? 'opacity-100 text-[18px] text-[#D4AF37] font-bold' : 'opacity-100 text-[18px] text-blue-600 font-bold') 
                : (isDark ? 'opacity-60 text-[15px] hover:opacity-80' : 'opacity-50 text-[15px] hover:opacity-80')
            }`}
            style={{ height: `${ITEM_HEIGHT}px` }}
            onClick={() => {
              if (!isSelected) onChange(opt.value);
            }}
          >
            <span className="truncate">{opt.label}</span>
          </li>
        );
      })}
    </ul>
  );
};

const AppleScrollPicker = ({ columns = [], theme = 'dark', className = '' }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`relative inline-flex w-full overflow-hidden ${className}`}
      style={{ 
        height: `${CONTAINER_HEIGHT}px`,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
      }}
    >
      {/* Selection Window Middle Line */}
      <div 
        className="absolute top-1/2 left-0 w-full z-0 pointer-events-none -translate-y-1/2" 
        style={{ height: `${ITEM_HEIGHT}px` }}
      >
        <div
          className={`w-full h-full border-y ${
            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-gray-50/30'
          }`}
        ></div>
      </div>

      {/* Columns */}
      <div className="relative z-20 flex gap-1 w-full justify-center">
        {columns.map((col, i) => (
          <ScrollColumn
            key={i}
            options={col.options}
            value={col.value}
            onChange={col.onChange}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
};

export default AppleScrollPicker;
