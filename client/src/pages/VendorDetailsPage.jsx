import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { getCategorySchema } from '../config/categorySchemas';
import { API_URL } from '../config/api';
import { Star, MapPin, Heart, Share2, CheckCircle2, ChevronLeft, Info, ShoppingCart, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as Icons from 'lucide-react';
import CustomDropdown from '../components/ui/CustomDropdown';
import DynamicSEO from '../components/DynamicSEO';
import LocationMapClient from '../components/vendor/LocationMapClient';
import AnimatedVendorCard from '../components/search/AnimatedVendorCard';


const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [vendor, setVendor] = useState(null);
  const { addToCart } = useCart();
  const { user, requireAuth } = useAuth();
  
  const userRole = user?.role || 'client'; // 'client' (D2C) or 'business_client' (B2B)
  
  // Dynamic state for the booking form fields
  const [formData, setFormData] = useState({});

  // Inquiry/Quote State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: '', phone: '', message: '' });
  const [isSendingQuote, setIsSendingQuote] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Initialize form data based on schema defaults
  useEffect(() => {
    if (vendor && vendor.category) {
      const currentSchema = getCategorySchema(vendor.category);
      if (currentSchema && currentSchema.bookingFields) {
        const initialData = {};
        currentSchema.bookingFields.forEach(field => {
          if (field.type === 'select' && field.options?.length > 0) {
            initialData[field.id] = field.options[0];
          } else {
            initialData[field.id] = '';
          }
        });
        setFormData(initialData);
      }
    }
  }, [vendor?.category]);

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
        pricePerPlate: v.pricing?.adminOverridePrice || (user?.role === 'business_client' ? v.pricing?.b2bPrice : v.pricing?.standardPrice) || v.pricePerPlate || v.customBlocks?.pricingPackages?.[0]?.price || 'Contact for Price',
        rating: v.rating || 5.0,
        reviewsCount: v.reviewsCount || 0,
        deepFeatures: v.deepFeatures,
        portfolioImages: v.portfolioImages || (v.imageUrl ? [v.imageUrl] : []),
        contact: v.contact,
        pricingPackages: v.pricingPackages || v.customBlocks?.pricingPackages || [],
        locationData: v.locationData,
        isVerified: v.documents?.length > 0 || v.isVerified
      });
      setIsLoading(false);
      return;
    }

    // 2. Otherwise, fetch from backend API
    const fetchVendorDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vendors/${id}`);
        const data = await res.json();
        
        if (data.success) {
          const v = data.data;
          setVendor({
            id: v._id,
            name: v.name,
            category: v.category,
            location: v.address?.city ? `${v.address.city}, India` : 'India',
            imageUrl: v.portfolioImages?.length > 0 ? v.portfolioImages[0] : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
            pricePerPlate: v.pricing?.adminOverridePrice || (user?.role === 'business_client' ? v.pricing?.b2bPrice : v.pricing?.standardPrice) || v.customBlocks?.pricingPackages?.[0]?.price || 'Contact for Price',
            rating: v.rating || 5.0,
            reviewsCount: v.reviewsCount || 0,
            deepFeatures: v.deepFeatures,
            portfolioImages: v.portfolioImages,
            contact: v.contact,
            pricingPackages: v.customBlocks?.pricingPackages || [],
            locationData: v.locationData,
            isVerified: v.documents?.length > 0 || v.isVerified
          });
        } else {
          setFetchError("Vendor not found");
        }
      } catch (error) {
        console.error("Failed to load vendor details:", error);
        setFetchError("Network error loading vendor");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id, location.state]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (fetchError || !vendor) {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Icons.Store size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">{fetchError || "Vendor Not Found"}</h2>
          <p className="text-gray-500 mb-8 font-medium">This vendor might have been removed, or the link you followed is incorrect. Please return to the homepage to explore other vendors.</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-brand-primary hover:bg-[#D41B4D] text-white font-black rounded-xl transition-colors shadow-lg shadow-brand-primary/20">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const schema = getCategorySchema(vendor.category);

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
      
      const res = await fetch(`${API_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setIsQuoteModalOpen(false);
        setQuoteForm({ name: '', phone: '', message: '' });
        alert(userRole === 'client' ? 'Booking request submitted successfully! The vendor will confirm shortly.' : 'Your B2B quote request has been sent to the vendor! They will contact you shortly.');
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

  const handleInstantBook = () => {
    requireAuth(() => {
      setIsQuoteModalOpen(true);
    });
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
    <div className="min-h-screen bg-white pt-16 md:pt-24 pb-24 md:pb-16">
      <DynamicSEO customSchema={vendorSchema} />
      
      {/* Mobile Title & Actions (Visible only on mobile) */}
      <div className="md:hidden px-4 pt-4 pb-2 flex justify-between items-center bg-white z-10 sticky top-16">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handleShare} className="p-2 text-gray-900 bg-gray-100 rounded-full active:scale-95 transition-transform"><Share2 size={16} /></button>
          <button className="p-2 text-gray-900 bg-gray-100 rounded-full active:scale-95 transition-transform hover:text-red-500"><Heart size={16} /></button>
        </div>
      </div>

      {/* Cinematic Masonry Gallery (Desktop) & Edge-to-Edge Scroll (Mobile) */}
      <div className="max-w-[1200px] mx-auto md:px-6 lg:px-8 mb-6 md:mb-10">
        <div className="flex md:grid md:grid-cols-4 md:grid-rows-2 gap-1 md:gap-2 lg:gap-3 h-[30vh] md:h-[50vh] lg:h-[60vh] md:rounded-[2rem] overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:snap-none md:overflow-hidden no-scrollbar">
          
          <div className="w-full shrink-0 snap-center md:col-span-2 md:row-span-2 relative group cursor-pointer md:rounded-l-[2rem] overflow-hidden">
            <img src={gallery[0]} alt="Main" className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors hidden md:block"></div>
          </div>

          {gallery.length > 1 && (
            <div className="w-4/5 shrink-0 snap-center md:w-auto md:col-span-1 md:row-span-1 relative group cursor-pointer overflow-hidden">
              <img src={gallery[1]} alt="View 2" className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" />
            </div>
          )}
          {gallery.length > 2 && (
            <div className="w-4/5 shrink-0 snap-center md:w-auto md:col-span-1 md:row-span-1 relative group cursor-pointer overflow-hidden md:rounded-tr-[2rem]">
              <img src={gallery[2]} alt="View 3" className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" />
            </div>
          )}
          {gallery.length > 3 && (
            <div className="w-4/5 shrink-0 snap-center md:w-auto md:col-span-1 md:row-span-1 relative group cursor-pointer overflow-hidden">
              <img src={gallery[3]} alt="View 4" className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" />
            </div>
          )}
          {gallery.length > 4 && (
            <div className="w-4/5 shrink-0 snap-center md:w-auto md:col-span-1 md:row-span-1 relative group cursor-pointer overflow-hidden md:rounded-br-[2rem]">
              <img src={gallery[4]} alt="View 5" className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" />
              {gallery.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-bold text-lg md:text-xl">+{gallery.length - 5} Photos</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 relative items-start">
          
          {/* Left Column (Details) */}
          <div className="flex-1 w-full pb-8">
            
            {/* Header Area (Desktop only layout, mobile inherits from flow) */}
            <div className="mb-8 md:mb-12 border-b border-gray-200 pb-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h1 className="text-[32px] md:text-[42px] font-black text-gray-900 tracking-tight leading-tight">
                  {vendor.name}
                </h1>
                {vendor.rating >= 4.5 && (
                  <span className="badge-top-rated"><Icons.Award size={14} className="mb-0.5" /> Top Rated</span>
                )}
                {vendor.isVerified && (
                  <span className="badge-verified"><Icons.ShieldCheck size={14} className="mb-0.5" /> Verified</span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-y-3 gap-x-4 text-sm font-medium text-gray-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <Star size={18} className="text-brand-gold" fill="currentColor" /> {vendor.rating} <span className="text-gray-500 font-normal underline cursor-pointer hover:text-gray-900 transition-colors">{vendor.reviewsCount} reviews</span>
                </div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1.5 text-gray-600 underline cursor-pointer hover:text-gray-900 transition-colors">
                  {vendor.location}
                </div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1 text-gray-600">
                  {vendor.category}
                </div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md font-bold text-xs">
                  <Icons.Clock size={14} /> Responds in ~2 hours
                </div>
              </div>
            </div>

            {/* About Section */}
            <section className="mb-10 pb-10 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{schema.aboutTitle}</h2>
              <p className="text-gray-600 leading-relaxed font-normal text-base md:text-[17px]">
                Experience unparalleled quality and elegance at {vendor.name}. Known for breathtaking work and impeccable service, this vendor is the perfect choice for your dream event. We ensure every moment of your celebration is flawless and memorable. Located centrally in {vendor.location.split(',')[0]}, we pride ourselves on delivering exactly what you envision.
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
            <section className="mb-10 pb-10 border-b border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 mb-6">{schema.featuresTitle || 'Amenities & Policies'}</h2>
              
              {vendor.deepFeatures && (() => {
                const feats = vendor.deepFeatures;
                const eventsCovered = feats.eventsCovered;
                const serviceTypes = feats.serviceTypes;
                const specializations = feats.specializations;
                const cuisineTypes = feats.cuisineTypes;
                const dietaryRestrictions = feats.dietaryRestrictions;
                const scalarFeats = Object.entries(feats).filter(([k]) => !['eventsCovered','serviceTypes','specializations','cuisineTypes','dietaryRestrictions'].includes(k));
                
                return (
                  <div className="space-y-8">
                    {/* Event Types Covered */}
                    {eventsCovered && Array.isArray(eventsCovered) && eventsCovered.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Events Covered</h3>
                        <div className="flex flex-wrap gap-2">
                          {eventsCovered.map((ev, i) => (
                            <span key={i} className="px-4 py-2 bg-brand-primary/5 border border-brand-primary/20 text-brand-primary text-sm font-bold rounded-full">{ev}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Services / Specializations */}
                    {(serviceTypes || specializations) && (
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                          {specializations ? 'Decor Specializations' : 'Services Offered'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(serviceTypes || specializations || []).map((s, i) => (
                            <span key={i} className="px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 text-sm font-bold rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cuisine Types */}
                    {cuisineTypes && Array.isArray(cuisineTypes) && cuisineTypes.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Cuisines Served</h3>
                        <div className="flex flex-wrap gap-2">
                          {cuisineTypes.map((c, i) => (
                            <span key={i} className="px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-bold rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dietary Restrictions */}
                    {dietaryRestrictions && Array.isArray(dietaryRestrictions) && dietaryRestrictions.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Dietary Options</h3>
                        <div className="flex flex-wrap gap-2">
                          {dietaryRestrictions.map((d, i) => (
                            <span key={i} className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-full">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scalar deep features (text/select) */}
                    {scalarFeats.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4">
                        {scalarFeats.map(([key, value], i) => {
                          if (!value) return null;
                          const formattedKey = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .replace('In House', 'In-House ');
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle2 size={18} className="text-brand-primary shrink-0 mt-0.5" />
                              <span className="text-sm font-semibold text-gray-700">
                                <span className="font-bold text-gray-900">{formattedKey}:</span> {value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>

            {/* Verified Reviews Section */}
            <section className="mb-10 pb-10 border-b border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  Verified Reviews <Icons.ShieldCheck className="text-green-500" size={24} />
                </h2>
                <button className="text-sm font-bold text-brand-primary hover:underline">Read all {vendor.reviewsCount || 12} reviews</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(idx => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                          {idx === 1 ? 'S' : 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{idx === 1 ? 'Shruti P.' : 'Aditya M.'}</p>
                          <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                            <Icons.CheckCircle2 size={12} className="text-green-500" /> Verified Client
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                        <Star size={14} className="text-brand-gold fill-brand-gold" />
                        <span className="text-xs font-bold text-gray-900">5.0</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      "Absolutely fantastic service! The team was extremely professional and the quality of their work exceeded our expectations. Highly recommend to anyone planning their big day."
                    </p>
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
          <aside className="hidden md:block w-full lg:w-[380px] shrink-0 sticky top-28 z-40 pb-10">
            {/* Booking Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-gray-200"
            >
              <div className="flex flex-col items-start mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{vendor.pricePerPlate}</span>
                  <span className="text-base text-gray-500 font-normal">{schema.pricingUnit.replace('/', ' / ')}</span>
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
              
              <div className="flex flex-col gap-3">
                {userRole === 'client' ? (
                  <button 
                    onClick={handleInstantBook}
                    className="w-full bg-[#E51D53] hover:bg-[#D41B4D] text-white py-3.5 rounded-xl font-bold text-base transition-colors active:scale-95 shadow-md shadow-[#E51D53]/20"
                  >
                    Book Now (D2C)
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-3.5 rounded-xl font-bold text-base transition-colors active:scale-95"
                  >
                    Request B2B Quote
                  </button>
                )}
                <div className="flex gap-3">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-white border border-gray-900 text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[13px] text-gray-500 mt-4 text-center">
                You won't be charged yet
              </div>
            </motion.div>
          </aside>
          
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-3 z-50 flex justify-between items-center pb-safe gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col shrink-0 min-w-[70px]">
              <span className="text-lg font-black text-gray-900 leading-none mb-0.5">{vendor.pricePerPlate}</span>
              <span className="text-[10px] text-gray-500 font-bold leading-none uppercase tracking-wider">{schema.pricingUnit}</span>
            </div>
            
            <div className="flex flex-1 gap-2 h-11">
              <button 
                onClick={handleAddToCart}
                className="w-12 flex-shrink-0 bg-white border-2 border-gray-100 text-gray-900 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95 shadow-sm"
                aria-label="Add to Cart"
              >
                <ShoppingCart size={20} />
              </button>

              {userRole === 'client' ? (
                <button 
                  onClick={handleInstantBook}
                  className="flex-1 bg-[#E51D53] text-white rounded-xl font-black text-sm active:scale-95 transition-transform text-center shadow-md flex items-center justify-center gap-1.5"
                >
                  Book Now
                </button>
              ) : (
                <button 
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="flex-1 bg-brand-primary text-white rounded-xl font-black text-sm active:scale-95 transition-transform text-center shadow-md flex items-center justify-center"
                >
                  Get Quote
                </button>
              )}
            </div>
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
