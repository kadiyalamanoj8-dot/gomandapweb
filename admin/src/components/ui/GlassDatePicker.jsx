import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const GlassDatePicker = ({
  value,           // Date object or null
  onChange,        // (Date) => void
  placeholder = 'Pick a date',
  variant = 'glass', // 'glass' (dark) | 'light'
  className = '',
}) => {
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState((value || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((value || today).getMonth());
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDark = variant === 'glass' || variant === 'ios';

  // --- Styles ---
  const triggerCls = isDark
    ? 'text-white border-none bg-transparent'
    : 'text-gray-800 bg-white/70 border border-gray-200/70 shadow-sm backdrop-blur-sm px-4 py-3 rounded-2xl';

  const panelCls = isDark
    ? 'bg-black/30 backdrop-blur-2xl border border-white/15 border-t-white/35 shadow-[inset_0_1px_3px_rgba(255,255,255,0.18),0_28px_56px_rgba(0,0,0,0.65)] rounded-[26px]'
    : 'bg-white/95 backdrop-blur-2xl border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.10)] rounded-[26px]';

  const headerCls = isDark ? 'text-white' : 'text-gray-900';
  const dayLabelCls = isDark ? 'text-white/35 text-[11px] font-semibold' : 'text-gray-400 text-[11px] font-semibold';
  const dayBtnBase = isDark
    ? 'rounded-full text-[13px] font-medium text-white/80 hover:bg-white/12 hover:text-white transition-all w-9 h-9 flex items-center justify-center cursor-pointer select-none'
    : 'rounded-full text-[13px] font-medium text-gray-700 hover:bg-gray-100 transition-all w-9 h-9 flex items-center justify-center cursor-pointer select-none';
  const todayRing = isDark ? 'ring-1 ring-white/30 text-white' : 'ring-1 ring-gray-300 text-gray-900';
  const selectedCls = 'bg-gradient-to-br from-[#DC2626] to-[#EF4444] text-white shadow-[0_4px_14px_rgba(220,38,38,0.4)] scale-105 font-bold';
  const outsideCls = isDark ? 'text-white/20' : 'text-gray-300';
  const navBtnCls = isDark
    ? 'w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer'
    : 'w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer';

  // --- Calendar helpers ---
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  // Previous month tail
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, thisMonth: false, month: viewMonth - 1, year: viewYear });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, thisMonth: true, month: viewMonth, year: viewYear });
  }
  // Next month fill to complete rows
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: next++, thisMonth: false, month: viewMonth + 1, year: viewYear });
  }

  const isSameDay = (cell) => {
    if (!value) return false;
    const cellDate = new Date(cell.year, cell.month, cell.day);
    return (
      cellDate.getDate() === value.getDate() &&
      cellDate.getMonth() === value.getMonth() &&
      cellDate.getFullYear() === value.getFullYear()
    );
  };

  const isToday = (cell) => {
    if (!cell.thisMonth) return false;
    return (
      cell.day === today.getDate() &&
      cell.month === today.getMonth() &&
      cell.year === today.getFullYear()
    );
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleSelect = (cell) => {
    const date = new Date(cell.year, cell.month, cell.day);
    onChange(date);
    setIsOpen(false);
  };

  const formatted = value
    ? value.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      {/* Trigger */}
      <div
        className={`flex items-center gap-2 cursor-pointer w-full ${triggerCls}`}
        onClick={() => setIsOpen(v => !v)}
      >
        <Calendar size={18} strokeWidth={2} className={isDark ? 'text-white/60 shrink-0' : 'text-gray-400 shrink-0'} />
        <span className={`font-semibold text-[16px] tracking-tight truncate ${!formatted ? (isDark ? 'text-white/45' : 'text-gray-400') : (isDark ? 'text-white' : 'text-gray-800')}`}>
          {formatted || placeholder}
        </span>
      </div>

      {/* Calendar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute z-[9999] mt-3 p-4 w-[320px] ${panelCls}`}
            style={{ transformOrigin: 'top left' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Month / Year Navigation */}
            <div className={`flex items-center justify-between mb-4 ${headerCls}`}>
              <button className={navBtnCls} onClick={handlePrev}>
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="text-[15px] font-bold tracking-tight select-none">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button className={navBtnCls} onClick={handleNext}>
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className={`text-center py-1 ${dayLabelCls}`}>{d}</div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(cell)}
                  className={`flex items-center justify-center mx-auto ${dayBtnBase} ${
                    isSameDay(cell) ? selectedCls : isToday(cell) ? todayRing : !cell.thisMonth ? outsideCls : ''
                  }`}
                >
                  {cell.day}
                </div>
              ))}
            </div>

            {/* Footer — today shortcut */}
            <div
              className={`mt-3 pt-3 border-t ${isDark ? 'border-white/[0.07]' : 'border-gray-100'} flex justify-center`}
            >
              <button
                onClick={() => { onChange(today); setIsOpen(false); setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
                className={`text-[12px] font-semibold px-4 py-1.5 rounded-full transition-all ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassDatePicker;
