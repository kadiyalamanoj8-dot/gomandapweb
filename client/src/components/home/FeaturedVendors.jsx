import React, { useRef, useState, useEffect } from 'react';
import LiquidVendorCard from '../common/LiquidVendorCard';
import * as Icons from 'lucide-react';
import { API_URL } from '../../config/api';

const FeaturedVendors = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vendors`);
        const data = await res.json();
        if (data.success && data.data) {
          // Filter for featured or top-rated vendors
          const featured = data.data.filter(v => v.isFeatured || v.rating > 4.5).slice(0, 8);
          
          // Map backend format to frontend card format
          const mappedVendors = featured.map(v => ({
            id: v._id,
            name: v.name,
            category: v.category,
            pricePerPlate: v.customBlocks?.pricingPackages?.[0]?.price || 'Contact for Price',
            rating: v.rating || 5.0,
            reviewsCount: v.reviewsCount || 0,
            location: v.address?.city ? `${v.address.city}, India` : 'India',
            imageUrl: v.portfolioImages?.length > 0 ? v.portfolioImages[0] : (v.profileImageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'),
            featured: v.isFeatured
          }));
          setVendors(mappedVendors);
        }
      } catch (err) {
        console.error("Failed to load featured vendors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
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
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  if (loading || vendors.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 overflow-hidden group">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Trending Venues & Vendors</h2>
            <p className="text-lg text-gray-500 max-w-2xl">Discover top-rated spaces meticulously vetted for your grand celebration.</p>
          </div>
          
          <div className="hidden md:flex gap-3">
            <button onClick={scrollLeft} className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary shadow-sm hover:shadow-md transition-all">
              <Icons.ChevronLeft size={24} />
            </button>
            <button onClick={scrollRight} className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary shadow-sm hover:shadow-md transition-all">
              <Icons.ChevronRight size={24} />
            </button>
          </div>
        </div>
        
        {/* Horizontal Scrolling Card Container */}
        <div 
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={`flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0 ${
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

export default FeaturedVendors;
