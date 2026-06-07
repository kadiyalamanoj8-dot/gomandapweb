import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import AppleScrollPicker from './AppleScrollPicker';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => ({
    value: currentYear + i,
    label: (currentYear + i).toString()
  }));
};

const generateMonths = () => {
  return MONTHS.map((m, i) => ({
    value: i,
    label: m
  }));
};

const generateDates = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString().padStart(2, '0')
  }));
};

const AppleDateTimePicker = ({ 
  value, 
  onChange, 
  placeholder = 'Pick a date', 
  className = '', 
  theme = 'dark',
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initialDate = value || new Date();
  
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(initialDate.getDate());

  const years = useMemo(() => generateYears(), []);
  const months = useMemo(() => generateMonths(), []);
  const dates = useMemo(() => generateDates(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  // Sync incoming value
  useEffect(() => {
    if (value && value instanceof Date && !isNaN(value)) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setSelectedDate(value.getDate());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update parent instantly when any part of the date changes
  const handleDateChange = (y, m, d) => {
    const maxDays = new Date(y, m + 1, 0).getDate();
    const safeDate = Math.min(d, maxDays);
    
    setSelectedYear(y);
    setSelectedMonth(m);
    setSelectedDate(safeDate);

    if (onChange) {
      onChange(new Date(y, m, safeDate));
    }
  };

  const isDark = theme === 'dark';

  const columns = [
    { 
      options: dates, 
      value: selectedDate, 
      onChange: (d) => handleDateChange(selectedYear, selectedMonth, d) 
    },
    { 
      options: months, 
      value: selectedMonth, 
      onChange: (m) => handleDateChange(selectedYear, m, selectedDate) 
    },
    { 
      options: years, 
      value: selectedYear, 
      onChange: (y) => handleDateChange(y, selectedMonth, selectedDate) 
    }
  ];

  const getDisplayText = () => {
    if (!value) return placeholder;
    return value.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none transition-all text-left ${
          isDark 
            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white focus:ring-2 focus:ring-[#D4AF37]/50' 
            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Calendar size={18} className={isDark ? 'text-white/40' : 'text-gray-400'} />
          <span className={value ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-white/40' : 'text-gray-400')}>
            {getDisplayText()}
          </span>
        </div>
        <ChevronDown size={18} className={`${isDark ? 'text-white/30' : 'text-gray-400'} transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-[9999] p-4 ${
          isDark ? 'bg-[#111]/95 border-white/10 shadow-2xl' : 'bg-white border-gray-100 shadow-[0_16px_48px_rgba(0,0,0,0.1)]'
        } backdrop-blur-2xl border rounded-3xl animate-in fade-in duration-150 flex flex-col gap-2 min-w-[280px] w-full ${
          position === 'top' 
            ? 'bottom-full mb-2 origin-bottom slide-in-from-bottom-1' 
            : 'mt-2 origin-top slide-in-from-top-1'
        }`}>
          
          <div className="px-1 text-center w-full mb-1">
            <span className={`text-xs uppercase tracking-widest font-bold ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{placeholder}</span>
          </div>

          <AppleScrollPicker columns={columns} theme={theme} className="w-full" />
        </div>
      )}
    </div>
  );
};

export default AppleDateTimePicker;
