import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FEATURED_VENDORS } from '../data/mockData';
import { getCategorySchema } from '../config/categorySchemas';
import { Star, MapPin, Heart, Share2, CheckCircle2, ChevronLeft, Info, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import * as Icons from 'lucide-react';
import CustomDropdown from '../components/ui/CustomDropdown';
import DynamicSEO from '../components/DynamicSEO';
import LocationMapClient from '../components/vendor/LocationMapClient';

const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [vendor, setVendor] = useState(null);
  const { addToCart } = useCart();
  
  // Dynamic state for the booking form fields
  const [formData, setFormData] = useState({});

  // Inquiry/Quote State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: '', phone: '', message: '' });
  const [isSendingQuote, setIsSendingQuote] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (location.state?.vendor) {
      const v = location.state.vendor;
      setVendor({
        id: v.id || v._id,
        name: v.name,
        category: v.category,
        location: v.location || (v.address?.city ? `${v.address.city}, India` : 'India'),
        imageUrl: v.imageUrl || (v.portfolioImages?.length > 0 ? v.portfolioImages[0] : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80'),
        pricePerPlate: v.pricePerPlate || v.customBlocks?.pricingPackages?.[0]?.price || 'Contact for Price',
        rating: v.rating || 5.0,
        reviewsCount: v.reviewsCount || 0,
        deepFeatures: v.deepFeatures,
        portfolioImages: v.portfolioImages || (v.imageUrl ? [v.imageUrl] : []),
        contact: v.contact,
        pricingPackages: v.pricingPackages || v.customBlocks?.pricingPackages || [],
        locationData: v.locationData
      });
      return;
    }

    // 2. Otherwise, fetch from backend API
    const fetchVendorDetails = async () => {
      try {
        const res = await fetch(`https://gomandap-api.onrender.com/api/vendors/${id}`);
        const data = await res.json();
        
        if (data.success) {
          const v = data.data;
          setVendor({
            id: v._id,
            name: v.name,
            category: v.category,
            location: v.address?.city ? `${v.address.city}, India` : 'India',
            imageUrl: v.portfolioImages?.length > 0 ? v.portfolioImages[0] : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
            pricePerPlate: v.customBlocks?.pricingPackages?.[0]?.price || 'Contact for Price',
            rating: v.rating || 5.0,
            reviewsCount: v.reviewsCount || 0,
            deepFeatures: v.deepFeatures,
            portfolioImages: v.portfolioImages,
            contact: v.contact,
            pricingPackages: v.customBlocks?.pricingPackages || []
          });
        }
      } catch (error) {
        console.error("Failed to load vendor details:", error);
      }
    };

    fetchVendorDetails();
  }, [id, location.state]);

  if (!vendor) return <div className="min-h-screen bg-white"></div>;

  const schema = getCategorySchema(vendor.category);

  // Initialize form data based on schema defaults
  useEffect(() => {
    if (schema && schema.bookingFields) {
      const initialData = {};
      schema.bookingFields.forEach(field => {
        if (field.type === 'select' && field.options?.length > 0) {
          initialData[field.id] = field.options[0];
        } else {
          initialData[field.id] = '';
        }
      });
      setFormData(initialData);
    }
  }, [vendor.category]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleAddToCart = () => {
    addToCart(vendor, formData);
  };

  const handleSendQuote = async () => {
    if (!quoteForm.name || !quoteForm.phone || !quoteForm.message) {
      alert("Please fill out your name, phone number, and message.");
      return;
    }
    setIsSendingQuote(true);
    try {
      const payload = {
        vendorId: vendor.id,
        clientName: quoteForm.name,
        clientPhone: quoteForm.phone,
        eventDate: formData.date || new Date().toISOString(), // Fallback to today if not selected
        message: quoteForm.message,
        // Optional fields from form
        guestCount: formData.guests || formData.guestSize || formData.quantity || '',
        eventType: formData.eventType || formData.serviceType || formData.designType || ''
      };
      
      const res = await fetch('https://gomandap-api.onrender.com/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setIsQuoteModalOpen(false);
        setQuoteForm({ name: '', phone: '', message: '' });
        alert('Your quote request has been sent to the vendor! They will contact you shortly.');
      } else {
        alert(data.message || 'Failed to send inquiry.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error. Please try again.');
    } finally {
      setIsSendingQuote(false);
    }
  };

  // Build gallery array dynamically based on Cloudinary uploads, fallback to Unsplash
  const gallery = vendor.portfolioImages && vendor.portfolioImages.length > 0 
    ? vendor.portfolioImages
    : [
        vendor.imageUrl,
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&q=80',
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'
      ];

  const vendorSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": vendor.name,
    "image": gallery,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": vendor.location.split(',')[0],
      "addressCountry": "IN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": vendor.rating,
      "reviewCount": vendor.reviewsCount || 1
    },
    "priceRange": vendor.pricePerPlate
  };

  const handleShare = async () => {
    const shareData = {
      title: `${vendor.name} - Gomandap`,
      text: `Check out ${vendor.name} on Gomandap!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-32 md:pb-20">
      <DynamicSEO customSchema={vendorSchema} />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Back Button & Actions */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-primary transition-colors"
          >
            <ChevronLeft size={20} /> Back to Search
          </button>
          
          <div className="flex gap-3">
            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-primary bg-white px-4 py-2 rounded-full shadow-sm active:scale-95 transition-transform">
              <Share2 size={16} /> <span className="hidden md:inline">Share</span>
            </button>
            <button className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-500 bg-white px-4 py-2 rounded-full shadow-sm active:scale-95 transition-transform">
              <Heart size={16} /> <span className="hidden md:inline">Save</span>
            </button>
          </div>
        </div>

        {/* Hero Title Area */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            {vendor.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
            <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-2 py-1 rounded-md">
              <Star size={16} fill="currentColor" /> {vendor.rating} <span className="text-gray-500">({vendor.reviewsCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-gray-400" /> {vendor.location}
            </div>
            <div className="flex items-center gap-1 text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-md uppercase tracking-wider text-xs font-black">
              {vendor.category}
            </div>
          </div>
        </div>

        {/* Cinematic Masonry Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 md:gap-4 h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-10">
          <div className="col-span-1 md:col-span-2 row-span-2 relative group cursor-pointer">
            <img src={gallery[0]} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          </div>
          {gallery.length > 1 && (
            <div className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
              <img src={gallery[1]} alt="View 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
          )}
          {gallery.length > 2 && (
            <div className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
              <img src={gallery[2]} alt="View 3" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
          )}
          {gallery.length > 3 && (
            <div className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
              <img src={gallery[3]} alt="View 4" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
          )}
          {gallery.length > 4 && (
            <div className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden">
              <img src={gallery[4]} alt="View 5" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              {gallery.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{gallery.length - 5} Photos</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
          
          {/* Left Column (Details) */}
          <div className="flex-1 w-full space-y-12">
            
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 mb-4">{schema.aboutTitle}</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                Experience unparalleled quality and elegance at {vendor.name}. Known for breathtaking work and impeccable service, this vendor is the perfect choice for your dream event. We ensure every moment of your celebration is flawless and memorable.
              </p>
            </section>

            {/* --- DYNAMIC LAYOUT BLOCKS (Phase 9) --- */}
            {schema.customBlocks && (
              <>
                {/* 1. Dynamic Pricing Packages (Photography, MUA, Decor) */}
                {vendor.pricingPackages && vendor.pricingPackages.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Pricing Packages</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vendor.pricingPackages.map((pkg, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-brand-primary transition-colors shadow-sm">
                          <h3 className="text-lg font-black text-gray-900 mb-1">{pkg.title}</h3>
                          <span className="text-2xl font-black text-brand-primary block mb-3">{pkg.price}</span>
                          <p className="text-sm font-semibold text-gray-500">{pkg.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. Cuisine Tags & Specialities (Caterers, Decorators) */}
                {schema.customBlocks.cuisineTags && (
                  <section>
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Specialities & Cuisines</h2>
                    <div className="flex flex-wrap gap-3">
                      {schema.customBlocks.cuisineTags.map((tag, idx) => (
                        <span key={idx} className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-4 py-2 rounded-xl text-sm font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Policies & Travel (MUA, Photographers) */}
                {schema.customBlocks.policies && (
                  <section>
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Terms & Policies</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 divide-y divide-gray-200">
                      {schema.customBlocks.policies.map((policy, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{policy.label}</span>
                          <span className="text-base font-black text-gray-900">{policy.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Features/Amenities Section (Uses deep data from DB) */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 mb-6">{schema.featuresTitle || 'Amenities'}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                {vendor.deepFeatures && Object.entries(vendor.deepFeatures).map(([key, value], i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-brand-primary shrink-0" />
                    <span className="text-sm font-semibold text-gray-700 capitalize">
                      {value === "Yes" || value === "No" ? `${key}: ${value}` : value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Venue Map Location */}
            {vendor.locationData && (
              <section>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Venue Location</h2>
                <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
                  <LocationMapClient locationData={vendor.locationData} />
                </div>
              </section>
            )}

          </div>

          {/* Right Column (Direct Booking Engine) */}
          <aside className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-28 z-40">
            {/* Booking Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100"
            >
              <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-1">Starting Price</span>
                  <span className="text-3xl font-black text-gray-900">{vendor.pricePerPlate}</span>
                  <span className="text-sm font-bold text-gray-500">{schema.pricingUnit}</span>
                </div>
              </div>

              {/* Dynamic Booking Form */}
              <div className="space-y-4 mb-8">
                {schema.bookingFields.map(field => {
                  const IconComponent = Icons[field.icon] || Icons.HelpCircle;
                  return (
                    <div key={field.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-brand-primary transition-colors">
                      <IconComponent className="text-gray-400 shrink-0" size={24} />
                      <div className="w-full">
                        <span className="block text-xs font-bold text-gray-400 uppercase">{field.label}</span>
                        {field.type === 'select' ? (
                          <CustomDropdown 
                            options={field.options}
                            value={formData[field.id] || ''} 
                            onChange={(val) => handleInputChange(field.id, val)} 
                            variant="light"
                            className="!bg-transparent !border-none !shadow-none !p-0 !min-h-0"
                            dropdownClassName="-ml-12 w-[calc(100%+48px)]"
                          />
                        ) : (
                          <input 
                            type={field.type} 
                            value={formData[field.id] || ''} 
                            onChange={(e) => handleInputChange(field.id, e.target.value)} 
                            className="bg-transparent font-bold text-gray-900 focus:outline-none w-full cursor-pointer" 
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Desktop Buttons */}
              <div className="hidden lg:flex flex-col gap-3">
                <button 
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full btn-liquid text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all active:scale-95"
                >
                  <Icons.MessageSquare size={20} /> Request Quote
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary/20 transition-all active:scale-95"
                  >
                    <ShoppingCart size={18} /> Cart
                  </button>
                  <button className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95">
                    Book Now
                  </button>
                </div>
              </div>

              <p className="hidden lg:flex items-center justify-center gap-2 text-xs font-bold text-gray-400 mt-4 text-center">
                <Info size={14} /> You won't be charged yet.
              </p>
            </motion.div>
          </aside>
          
          {/* Mobile Fixed Booking Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex justify-between items-center pb-safe gap-3">
            <div className="flex-1">
              <span className="text-xl md:text-2xl font-black text-gray-900 block leading-none truncate">{vendor.pricePerPlate}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">{schema.pricingUnit.replace('/', 'Per')}</span>
            </div>
            
            <button 
              onClick={() => setIsQuoteModalOpen(true)}
              className="flex-[1.5] btn-liquid text-white py-3.5 rounded-xl font-black text-sm md:text-base shadow-lg active:scale-95 transition-transform text-center flex items-center justify-center gap-2"
            >
              <Icons.MessageSquare size={18} /> Get Quote
            </button>
          </div>

        </div>
      </div>

      {/* Quote/Inquiry Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900">Request Quote</h3>
                <p className="text-xs font-bold text-gray-500 mt-1">Direct message to {vendor.name}</p>
              </div>
              <button onClick={() => setIsQuoteModalOpen(false)} className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 shadow-sm">
                <Icons.X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Your Name</label>
                <input 
                  type="text" 
                  value={quoteForm.name} 
                  onChange={e => setQuoteForm({...quoteForm, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-brand-primary font-semibold"
                  placeholder="e.g. Rahul Kumar"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  value={quoteForm.phone} 
                  onChange={e => setQuoteForm({...quoteForm, phone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-brand-primary font-semibold"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Message / Requirements</label>
                <textarea 
                  value={quoteForm.message} 
                  onChange={e => setQuoteForm({...quoteForm, message: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-brand-primary font-semibold min-h-[100px] resize-none"
                  placeholder={`Hi, I'm interested in booking ${vendor.name} for my event. Please share pricing and availability...`}
                />
              </div>
              
              <button 
                onClick={handleSendQuote}
                disabled={isSendingQuote}
                className="w-full mt-4 btn-liquid text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSendingQuote ? 'Sending...' : (
                  <>
                    <Icons.Send size={18} /> Send Inquiry
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorDetailsPage;
