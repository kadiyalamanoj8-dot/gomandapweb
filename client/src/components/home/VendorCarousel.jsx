import React, { useRef, useState } from 'react';
import LiquidVendorCard from '../common/LiquidVendorCard';
import * as Icons from 'lucide-react';

const VendorCarousel = ({ title, subtitle, vendors, bgColor = "bg-white" }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
  };

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
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section className={`py-6 md:py-8 ${bgColor} overflow-hidden group border-b border-gray-100 last:border-0`}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-end gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-1 tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 max-w-2xl">{subtitle}</p>}
          </div>
          
          <div className="hidden md:flex gap-4 items-center">
            {vendors.length > 0 && (
              <button 
                onClick={() => window.location.href = `/search?category=${encodeURIComponent(vendors[0].category)}`} 
                className="text-sm font-bold text-brand-primary hover:underline px-2"
              >
                View All
              </button>
            )}
            <div className="flex gap-2">
              <button onClick={scrollLeft} className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary shadow-sm hover:shadow-md transition-all">
                <Icons.ChevronLeft size={16} />
              </button>
              <button onClick={scrollRight} className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary shadow-sm hover:shadow-md transition-all">
                <Icons.ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={`flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0 ${
            isDragging ? 'cursor-grabbing select-none snap-none scroll-auto' : 'cursor-grab snap-x snap-mandatory scroll-smooth'
          }`}
        >
          {vendors.map((vendor) => (
            <div 
              key={vendor.id} 
              className="snap-start shrink-0" 
              onClick={(e) => isDragging && e.preventDefault()}
            >
              <LiquidVendorCard vendor={vendor} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VendorCarousel;
