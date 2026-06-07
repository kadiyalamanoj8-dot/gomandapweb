import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import AppleScrollPicker from './AppleScrollPicker';

// Generate Options
const generateDays = () => {
  const days = [];
  const date = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dateNum = d.getDate();
    days.push({
      value: d.toISOString().split('T')[0],
      label: `${dayName} ${monthName} ${dateNum}`
    });
  }
  return days;
};

const generateHours = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i === 0 ? 12 : i,
    label: (i === 0 ? 12 : i).toString()
  }));
};

const generateMinutes = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i * 5,
    label: (i * 5).toString().padStart(2, '0')
  }));
};

const amPmOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' }
];

const AppleDateTimePicker = ({ 
  value, 
  onChange, 
  placeholder = 'Pick a date & time', 
  className = '', 
  theme = 'dark',
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Data Sources
  const [days] = useState(generateDays());
  const [hours] = useState(generateHours());
  const [minutes] = useState(generateMinutes());

  // Current Selections
  const [selectedDay, setSelectedDay] = useState(days[0].value);
  const [selectedHour, setSelectedHour] = useState(hours[0].value);
  const [selectedMinute, setSelectedMinute] = useState(minutes[0].value);
  const [selectedAmPm, setSelectedAmPm] = useState(amPmOptions[0].value);

  // Sync incoming value to local states (simplified)
  useEffect(() => {
    if (value && value.day) setSelectedDay(value.day);
    if (value && value.hour) setSelectedHour(value.hour);
    if (value && value.minute !== undefined) setSelectedMinute(value.minute);
    if (value && value.amPm) setSelectedAmPm(value.amPm);
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

  const handleApply = () => {
    if (onChange) {
      onChange({
        day: selectedDay,
        hour: selectedHour,
        minute: selectedMinute,
        amPm: selectedAmPm
      });
    }
    setIsOpen(false);
  };

  const isDark = theme === 'dark';

  const columns = [
    { options: days, value: selectedDay, onChange: setSelectedDay },
    { options: hours, value: selectedHour, onChange: setSelectedHour },
    { options: minutes, value: selectedMinute, onChange: setSelectedMinute },
    { options: amPmOptions, value: selectedAmPm, onChange: setSelectedAmPm },
  ];

  const getDisplayText = () => {
    if (!value) return placeholder;
    const dayOpt = days.find(d => d.value === value.day);
    const dayStr = dayOpt ? dayOpt.label : value.day;
    const minStr = value.minute.toString().padStart(2, '0');
    return `${dayStr} at ${value.hour}:${minStr} ${value.amPm}`;
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
        } backdrop-blur-2xl border rounded-3xl animate-in fade-in duration-150 flex flex-col gap-4 ${
          position === 'top' 
            ? 'bottom-full mb-2 origin-bottom slide-in-from-bottom-1' 
            : 'mt-2 origin-top slide-in-from-top-1'
        }`}>
          
          <div className="flex justify-between items-center px-1">
            <span className={`text-sm font-bold ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Select Date & Time</span>
            <button 
              onClick={handleApply}
              className={`text-sm font-bold px-3 py-1 rounded-lg ${
                isDark ? 'bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Done
            </button>
          </div>

          <AppleScrollPicker columns={columns} theme={theme} />
        </div>
      )}
    </div>
  );
};

export default AppleDateTimePicker;
