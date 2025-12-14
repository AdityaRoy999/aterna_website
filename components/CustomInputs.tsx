import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { Check } from '@/components/ui/icons/check';

// --- Types ---
interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

interface CustomDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface CustomTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// --- Helper Hooks ---
function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// --- Components ---

export const CustomSelect: React.FC<CustomSelectProps> = ({ label, options, value, onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  const selectedLabel = options.find(opt => opt.value === value)?.label || 'Select...';

  return (
    <div className="relative" ref={ref}>
      <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-void/50 border-b ${isOpen ? 'border-luxury' : 'border-white/10'} text-offwhite p-4 flex justify-between items-center transition-colors hover:border-white/30`}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-luxury">{icon}</span>}
          <span className={value ? 'text-offwhite' : 'text-offwhite/40'}>{value ? selectedLabel : 'Select Option'}</span>
        </div>
        <ChevronDown size={16} className={`text-offwhite/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-stone-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in max-h-60 overflow-y-auto custom-scrollbar"
          style={{ animationDuration: '0.2s' }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-6 py-3 text-sm font-body text-offwhite/70 hover:bg-white/5 hover:text-luxury transition-colors flex justify-between items-center group"
            >
              {opt.label}
              {value === opt.value && <Check size={14} className="text-luxury" animate />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  // Generate time slots (e.g., 10:00 AM to 7:00 PM)
  const timeSlots = [];
  for (let i = 10; i <= 19; i++) {
    const hour = i > 12 ? i - 12 : i;
    const ampm = i >= 12 ? 'PM' : 'AM';
    timeSlots.push(`${hour}:00 ${ampm}`);
    timeSlots.push(`${hour}:30 ${ampm}`);
  }

  return (
    <div className="relative" ref={ref}>
      <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-void/50 border-b ${isOpen ? 'border-luxury' : 'border-white/10'} text-offwhite p-4 flex justify-between items-center transition-colors hover:border-white/30`}
      >
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-luxury" />
          <span className={value ? 'text-offwhite' : 'text-offwhite/40'}>{value || 'Select Time'}</span>
        </div>
        <ChevronDown size={16} className={`text-offwhite/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-stone-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in max-h-60 overflow-y-auto custom-scrollbar"
          style={{ animationDuration: '0.2s' }}
        >
          {timeSlots.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                onChange(time);
                setIsOpen(false);
              }}
              className="w-full text-left px-6 py-3 text-sm font-body text-offwhite/70 hover:bg-white/5 hover:text-luxury transition-colors flex justify-between items-center"
            >
              {time}
              {value === time && <Check size={14} className="text-luxury" animate />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // For navigation
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Format: YYYY-MM-DD for consistency with input type="date" usually, but here we can use a nice string
    // Let's use a nice readable string for display, but maybe standard for value?
    // The parent expects a string. Let's return "Oct 24, 2025" format.
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    onChange(formatted);
    setIsOpen(false);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="relative" ref={ref}>
      <label className="block font-ui text-[10px] uppercase tracking-wider text-offwhite/40 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-void/50 border-b ${isOpen ? 'border-luxury' : 'border-white/10'} text-offwhite p-4 flex justify-between items-center transition-colors hover:border-white/30`}
      >
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-luxury" />
          <span className={value ? 'text-offwhite' : 'text-offwhite/40'}>{value || 'Select Date'}</span>
        </div>
        <ChevronDown size={16} className={`text-offwhite/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-stone-900 border border-white/10 rounded-xl shadow-2xl p-4 animate-fade-in min-w-[300px]"
          style={{ animationDuration: '0.2s' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={prevMonth} className="p-1 hover:text-luxury text-offwhite/60 transition-colors"><ChevronLeft size={16} /></button>
            <span className="font-display text-lg text-offwhite">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <button onClick={nextMonth} className="p-1 hover:text-luxury text-offwhite/60 transition-colors"><ChevronRight size={16} /></button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] text-offwhite/30 font-ui uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = value.includes(`${monthNames[currentDate.getMonth()].substring(0, 3)} ${day},`); // Simple check
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                    isSelected 
                      ? 'bg-luxury text-void font-bold shadow-[0_0_10px_rgba(232,207,160,0.4)]' 
                      : 'text-offwhite/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
