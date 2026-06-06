import React, { useRef, useState } from 'react';
import { CATEGORIES } from '../../data/mockData';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

const SwipeableCategorySlider = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const { isCategoryEnabled } = useSettings();
  const activeCategories = CATEGORIES.filter(cat => isCategoryEnabled(cat.label));

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  // Mouse Drag to Scroll Logic
  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section className="py-6 bg-white overflow-hidden relative group">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 relative">
        <h2 className="text-xl md:text-3xl font-black mb-6 text-gray-900 tracking-tight">Browse by Category</h2>
        
        {/* Desktop Navigation Arrows */}
        <button 
          onClick={scrollLeft}
          className="hidden md:flex absolute left-4 top-[60%] -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm z-10 text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-all opacity-0 group-hover:opacity-100"
        >
          <Icons.ChevronLeft size={18} />
        </button>
        
        <button 
          onClick={scrollRight}
          className="hidden md:flex absolute right-4 top-[60%] -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm z-10 text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-all opacity-0 group-hover:opacity-100"
        >
          <Icons.ChevronRight size={18} />
        </button>

        {/* Drag to Scroll Container */}
        <div 
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={`flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 ${
            isDragging ? 'cursor-grabbing select-none snap-none scroll-auto' : 'cursor-grab snap-x snap-mandatory scroll-smooth'
          }`}
        >
          {activeCategories.map((category, idx) => {
            const Icon = Icons[category.iconName];
            return (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03, type: "spring" }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="snap-start shrink-0 w-24 md:w-32 flex flex-col items-center gap-3 group/item"
                // Prevent drag from triggering click if user dragged
                onClick={(e) => isDragging && e.preventDefault()}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] bg-gray-50 flex items-center justify-center text-gray-500 group-hover/item:bg-gradient-to-tr group-hover/item:from-brand-primary/10 group-hover/item:to-brand-primary/5 group-hover/item:text-brand-primary shadow-sm group-hover/item:shadow-lg transition-all duration-300 pointer-events-none border border-gray-100 group-hover/item:border-brand-primary/20">
                  {Icon && <Icon size={28} strokeWidth={1.5} />}
                </div>
                <span className="text-[11px] md:text-sm font-bold text-center text-gray-600 group-hover/item:text-brand-primary transition-colors pointer-events-none leading-tight">
                  {category.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default React.memo(SwipeableCategorySlider);
