import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { useSettings } from '../../context/SettingsContext';
import { VENUE_CATEGORIES, VENDOR_CATEGORIES } from '../../data/mockData';
import { getCategorySchema } from '../../config/categorySchemas';
import { 
  Camera, Store, MapPin, DollarSign, CheckCircle2, ChevronRight, ChevronLeft,
  Building2, UserCircle2, Briefcase, Landmark, Image as ImageIcon, UploadCloud
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import LocationPicker from '../../../../client/src/components/vendor/LocationPicker';
import LazyInput from '../../components/common/LazyInput';

const IconComponent = ({ name, ...props }) => {
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon {...props} />;
};

const ICON_MAP = {
  'Banquet Halls':               '/images/3d_venue copy.webp',
  'Kalyana Mandapams':           '/images/temple_mandap copy.webp',
  'Open Lawns & Farmhouses':     '/images/3d_lawn_farmhouse_1780657291134 copy.webp',
  'Resorts & Destination Venues':'/images/modern_gazebo copy.webp',
  '5-Star Hotels':               '/images/3d_5star_hotel_1780657276128 copy.webp',
  'Party & Mini Halls':          '/images/neon_sangeet_stage copy.webp',
  'Temples & Ashrams':           '/images/temple_mandap copy.webp',
  'Catering Service':            '/images/3d_food copy.webp',
  'Stage & Venue Decor':         '/images/3d_decor copy.webp',
  'Photography & Videography':   '/images/3d_camera copy.webp',
  'DJs & Sound Systems':         '/images/3d_dj copy.webp',
  'Live Musicians / Band Baaja': '/images/3d_band copy.webp',
  'Makeup Artists (MUA)':        '/images/3d_makeup copy.webp',
  'Mehndi Designers':            '/images/3d_mehndi_1780657262687 copy.webp',
  'Wedding Clothes / Boutiques': '/images/3d_clothes copy.webp',
  'Jewelry Shops':               '/images/3d_jewelry copy.webp',
  'Wedding Cards & Invites':     '/images/3d_invitation copy.webp',
  'Cars & Buses (Travel)':       '/images/3d_car copy.webp',
  'Astrologers / Pundits':       '/images/3d_astrologer copy.webp',
  'Honeymoon Packages':          '/images/3d_honeymoon copy.webp',
  'Event Planners':              '/images/3d_planner copy.webp',
};

const VendorOnboarding = () => {
  const { submitOnboarding, saveDraft, vendorProfile } = useVendor();
  const { isCategoryEnabled } = useSettings();
  const navigate = useNavigate();
  const [step, setStep] = useState(vendorProfile?.currentStep || 1);

  const activeVenueCategories = VENUE_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));
  const activeVendorCategories = VENDOR_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));

  // Form State initialized from Draft
  const [basicInfo, setBasicInfo] = useState({
    category: vendorProfile?.category || '',
    name: vendorProfile?.name || '',
    ownerName: vendorProfile?.ownerName || '',
    phone: vendorProfile?.contact?.phone || '',
    whatsapp: vendorProfile?.contact?.whatsapp || '',
    email: vendorProfile?.contact?.email || '',
    streetAddress: vendorProfile?.address?.street || '',
    village: vendorProfile?.address?.village || '',
    mandal: vendorProfile?.address?.mandal || '',
    district: vendorProfile?.address?.district || '',
    state: vendorProfile?.address?.state || '',
    pincode: vendorProfile?.address?.pincode || '',
    city: vendorProfile?.address?.city || '',
    gstin: vendorProfile?.gstin || '',
    experience: vendorProfile?.experience || '',
    locationData: vendorProfile?.locationData || {
      type: 'Point',
      coordinates: [0, 0],
      googleMapsLink: '',
      isLocationLocked: false
    }
  });

  const [schemaFields, setSchemaFields] = useState({
    pricingPackages: [],
    vendorFormFields: []
  });
  const [formResponses, setFormResponses] = useState(vendorProfile?.deepFeatures || {});

  const [bankingInfo, setBankingInfo] = useState({
    accountName: vendorProfile?.banking?.accountName || '',
    accountNumber: vendorProfile?.banking?.accountNumber || '',
    ifscCode: vendorProfile?.banking?.ifscCode || '',
    bankName: vendorProfile?.banking?.bankName || '',
    upiId: vendorProfile?.banking?.upiId || ''
  });

  const [portfolio, setPortfolio] = useState([]); // Array of File objects
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (basicInfo.category) {
      const schema = getCategorySchema(basicInfo.category);
      setSchemaFields({
        pricingPackages: schema.customBlocks?.pricingPackages?.map(p => ({ ...p, price: '' })) || [],
        vendorFormFields: schema.vendorFormFields || []
      });
      
      const initialResponses = {};
      (schema.vendorFormFields || []).forEach(f => {
        initialResponses[f.id] = '';
      });
      setFormResponses(initialResponses);
    }
  }, [basicInfo.category]);

  // Auto-fill address from map pin reverse geocoding
  useEffect(() => {
    if (basicInfo.locationData?.parsedAddress) {
      const pa = basicInfo.locationData.parsedAddress;
      setBasicInfo(prev => ({
        ...prev,
        village: pa.village || prev.village,
        mandal: pa.mandal || prev.mandal,
        district: pa.district || prev.district,
        state: pa.state || prev.state,
        city: pa.district || pa.village || prev.city
      }));
    }
  }, [basicInfo.locationData?.parsedAddress]);

  const performSaveDraft = async (nextStep, customCategory = null) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Append standard fields
    formData.append('category', customCategory || basicInfo.category);
    formData.append('name', basicInfo.name);
    formData.append('ownerName', basicInfo.ownerName);
    formData.append('gstin', basicInfo.gstin);
    formData.append('experience', basicInfo.experience);
    formData.append('currentStep', nextStep);
    
    formData.append('contact', JSON.stringify({
      phone: basicInfo.phone,
      whatsapp: basicInfo.whatsapp,
      email: basicInfo.email
    }));
    
    formData.append('address', JSON.stringify({
      street: basicInfo.streetAddress,
      village: basicInfo.village,
      mandal: basicInfo.mandal,
      district: basicInfo.district,
      state: basicInfo.state,
      pincode: basicInfo.pincode,
      city: basicInfo.city
    }));

    formData.append('locationData', JSON.stringify(basicInfo.locationData));
    
    formData.append('deepFeatures', JSON.stringify(formResponses));
    
    formData.append('customBlocks', JSON.stringify({
      pricingPackages: schemaFields.pricingPackages.filter(p => p.price)
    }));
    
    formData.append('banking', JSON.stringify(bankingInfo));

    const result = await saveDraft(formData, vendorProfile?._id);
    setIsSubmitting(false);

    if (result.success) {
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert("Error saving draft: " + result.message);
    }
  };

  const handleNext = () => {
    performSaveDraft(step + 1);
  };
  
  const handlePrev = () => {
    performSaveDraft(step - 1);
  };

  const handleCategorySelect = (categoryLabel) => {
    setBasicInfo({...basicInfo, category: categoryLabel});
    performSaveDraft(2, categoryLabel);
  };

  const handlePortfolioUpload = (e) => {
    const files = Array.from(e.target.files);
    // Keep actual File objects instead of fake ones
    setPortfolio([...portfolio, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    
    // Append standard fields
    formData.append('name', basicInfo.name);
    formData.append('category', basicInfo.category);
    formData.append('ownerName', basicInfo.ownerName);
    formData.append('gstin', basicInfo.gstin);
    formData.append('experience', basicInfo.experience);
    formData.append('currentStep', 5);
    formData.append('isFinalStep', 'true');
    
    formData.append('contact', JSON.stringify({
      phone: basicInfo.phone,
      whatsapp: basicInfo.whatsapp,
      email: basicInfo.email
    }));
    
    formData.append('address', JSON.stringify({
      street: basicInfo.streetAddress,
      village: basicInfo.village,
      mandal: basicInfo.mandal,
      district: basicInfo.district,
      state: basicInfo.state,
      pincode: basicInfo.pincode,
      city: basicInfo.city
    }));

    formData.append('locationData', JSON.stringify(basicInfo.locationData));
    
    formData.append('deepFeatures', JSON.stringify(formResponses));
    
    formData.append('customBlocks', JSON.stringify({
      pricingPackages: schemaFields.pricingPackages.filter(p => p.price)
    }));
    
    formData.append('banking', JSON.stringify(bankingInfo));

    portfolio.forEach(file => {
      formData.append('portfolioImages', file);
    });

    const result = await saveDraft(formData, vendorProfile?._id);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/pending');
    } else {
      alert("Error submitting profile: " + result.message);
    }
  };

  const getFeedbackForField = (fieldName) => {
    if (!vendorProfile?.adminFeedback) return null;
    const fb = vendorProfile.adminFeedback.find(f => f.field === fieldName);
    return fb ? fb.message : null;
  };

  const FeedbackAlert = ({ field }) => {
    const msg = getFeedbackForField(field);
    if (!msg) return null;
    return <div className="text-xs font-bold text-red-500 mt-1 bg-red-50 p-2 rounded border border-red-100">{msg}</div>;
  };

  // Validation
  const isStep2Valid = basicInfo.name && basicInfo.ownerName && basicInfo.phone && basicInfo.city && basicInfo.streetAddress;
  const isStep4Valid = bankingInfo.accountNumber && bankingInfo.ifscCode && bankingInfo.bankName && bankingInfo.accountName;

  return (
    <div className="min-h-screen bg-[#FBFBFD] pt-24 pb-16 font-sans text-[#1D1D1F]">
      
      {/* Apple-style sticky transparent/blur header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFD]/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
        <div className="container mx-auto max-w-[1400px] px-6 h-[60px] flex items-center justify-between">
          <div className="text-xl font-black text-brand-primary tracking-tight">
            Gomandap <span className="text-gray-500 font-medium ml-1 text-lg">Business</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-12">
        
        {/* Modern 5-Step Progress Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">Partner Onboarding</h1>
          
          <div className="flex justify-between items-center max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-brand-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
            
            {[
              { num: 1, icon: Store, label: "Category" },
              { num: 2, icon: UserCircle2, label: "Identity" },
              { num: 3, icon: Briefcase, label: "Services" },
              { num: 4, icon: Landmark, label: "Banking" },
              { num: 5, icon: ImageIcon, label: "Portfolio" },
              { num: 6, icon: CheckCircle2, label: "Review" }
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.num ? 'bg-brand-primary border-brand-primary text-white shadow-md' : 'bg-white border-gray-300 text-gray-400'}`}>
                  <s.icon size={16} className="md:w-5 md:h-5" />
                </div>
                <span className={`text-[9px] md:text-xs font-bold absolute -bottom-6 whitespace-nowrap ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mt-12"
        >
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-2">What is your business type?</h2>
                <p className="text-gray-500 font-medium">Select your primary category to configure your custom dashboard.</p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-brand-primary uppercase tracking-widest mb-4">1. Wedding Venues</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activeVenueCategories.map((cat, idx) => {
                    const isSelected = basicInfo.category === cat.label;
                    const icon3d = ICON_MAP[cat.label];
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <button
                          onClick={() => handleCategorySelect(cat.label)}
                          className={`lg-card w-[84px] h-[84px] flex items-center justify-center rounded-[24px] transition-all relative overflow-hidden ${
                            isSelected 
                              ? 'selected scale-105 shadow-[0_8px_20px_rgba(239,68,68,0.3)] border-2 border-brand-primary' 
                              : 'hover:scale-105 border border-transparent'
                          }`}
                        >
                          <span
                            className="lg-glow"
                            style={{ background: isSelected ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.1)' }}
                          />
                          <div className="w-12 h-12 flex items-center justify-center relative z-10 pointer-events-none">
                            {icon3d ? (
                              <img
                                src={icon3d}
                                alt={cat.label}
                                className="icon-float w-12 h-12 object-contain drop-shadow-md"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                <IconComponent name={cat.iconName} size={22} className={isSelected ? 'text-brand-primary' : 'text-gray-500'} />
                              </div>
                            )}
                          </div>
                        </button>
                        <p className={`text-[11px] font-bold text-center leading-tight px-1 h-8 flex items-start justify-center transition-colors ${isSelected ? 'text-brand-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {cat.label}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-brand-secondary uppercase tracking-widest mb-4">2. Wedding Vendors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activeVendorCategories.map((cat, idx) => {
                    const isSelected = basicInfo.category === cat.label;
                    const icon3d = ICON_MAP[cat.label];
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <button
                          onClick={() => handleCategorySelect(cat.label)}
                          className={`lg-card w-[84px] h-[84px] flex items-center justify-center rounded-[24px] transition-all relative overflow-hidden ${
                            isSelected 
                              ? 'selected scale-105 shadow-[0_8px_20px_rgba(251,146,60,0.3)] border-2 border-brand-secondary' 
                              : 'hover:scale-105 border border-transparent'
                          }`}
                        >
                          <span
                            className="lg-glow"
                            style={{ background: isSelected ? 'rgba(251,146,60,0.35)' : 'rgba(251,146,60,0.1)' }}
                          />
                          <div className="w-12 h-12 flex items-center justify-center relative z-10 pointer-events-none">
                            {icon3d ? (
                              <img
                                src={icon3d}
                                alt={cat.label}
                                className="icon-float w-12 h-12 object-contain drop-shadow-md"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-brand-secondary/10 flex items-center justify-center">
                                <IconComponent name={cat.iconName} size={22} className={isSelected ? 'text-brand-secondary' : 'text-gray-500'} />
                              </div>
                            )}
                          </div>
                        </button>
                        <p className={`text-[11px] font-bold text-center leading-tight px-1 h-8 flex items-start justify-center transition-colors ${isSelected ? 'text-brand-secondary' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {cat.label}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS & PERSONAL IDENTITY */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-4">Business Identity & Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business/Brand Name <span className="text-red-500">*</span></label>
                  <LazyInput type="text" value={basicInfo.name} onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})} placeholder="e.g. Capture Infinity Studio" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Owner Full Name <span className="text-red-500">*</span></label>
                  <LazyInput type="text" value={basicInfo.ownerName} onChange={(e) => setBasicInfo({...basicInfo, ownerName: e.target.value})} placeholder="e.g. Rahul Sharma" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <LazyInput type="tel" value={basicInfo.phone} onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})} placeholder="+91 98765 43210" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">WhatsApp Number</label>
                  <LazyInput type="tel" value={basicInfo.whatsapp} onChange={(e) => setBasicInfo({...basicInfo, whatsapp: e.target.value})} placeholder="Same as phone" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Street Address</label>
                  <LazyInput type="text" value={basicInfo.streetAddress} onChange={(e) => setBasicInfo({...basicInfo, streetAddress: e.target.value})} placeholder="Shop number, building, street" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                </div>
                
                <div className="md:col-span-2 pt-4 border-t border-gray-100 mt-4">
                  <LocationPicker 
                    locationData={basicInfo.locationData} 
                    onChange={(data) => setBasicInfo({...basicInfo, locationData: data})} 
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Village / Suburb</label>
                    <LazyInput type="text" value={basicInfo.village} onChange={(e) => setBasicInfo({...basicInfo, village: e.target.value})} placeholder="e.g. Kondapur" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mandal / Tehsil</label>
                    <LazyInput type="text" value={basicInfo.mandal} onChange={(e) => setBasicInfo({...basicInfo, mandal: e.target.value})} placeholder="e.g. Serilingampally" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">District</label>
                    <LazyInput type="text" value={basicInfo.district} onChange={(e) => setBasicInfo({...basicInfo, district: e.target.value})} placeholder="e.g. Rangareddy" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">State</label>
                    <LazyInput type="text" value={basicInfo.state} onChange={(e) => setBasicInfo({...basicInfo, state: e.target.value})} placeholder="e.g. Telangana" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">City (Display)</label>
                  <LazyInput type="text" value={basicInfo.city} onChange={(e) => setBasicInfo({...basicInfo, city: e.target.value})} placeholder="e.g. Hyderabad" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pincode</label>
                  <LazyInput type="text" value={basicInfo.pincode} onChange={(e) => setBasicInfo({...basicInfo, pincode: e.target.value})} placeholder="e.g. 400001" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business Email</label>
                  <LazyInput type="email" value={basicInfo.email} onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})} placeholder="contact@business.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">GSTIN (Optional)</label>
                  <LazyInput type="text" value={basicInfo.gstin} onChange={(e) => setBasicInfo({...basicInfo, gstin: e.target.value})} placeholder="22AAAAA0000A1Z5" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary focus:bg-white uppercase" />
                </div>
              </div>

              <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                <button onClick={handlePrev} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 px-4 py-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep2Valid}
                  className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-black shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
                >
                  Save & Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CATEGORY SERVICES (DEEP SCHEMA) */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                <Building2 size={24} className="text-brand-primary" /> Core Service Details
              </h2>
              <p className="text-sm font-semibold text-gray-500 mb-6">These details help couples filter and discover your business exactly when they need it.</p>

              {/* Dynamic Deep Features */}
              {schemaFields.vendorFormFields.length > 0 && (
                <div className="bg-brand-primary/5 rounded-2xl p-6 border border-brand-primary/20 mb-8">
                  <h3 className="text-base font-black text-brand-primary mb-4">Key Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schemaFields.vendorFormFields.map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">{field.label}</label>
                        {field.type === 'select' ? (
                          <select 
                            value={formResponses[field.id] || ''} 
                            onChange={(e) => setFormResponses({...formResponses, [field.id]: e.target.value})}
                            className="w-full bg-white border border-brand-primary/20 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary"
                          >
                            <option value="" disabled>Select option</option>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <LazyInput 
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formResponses[field.id] || ''} 
                            onChange={(e) => setFormResponses({...formResponses, [field.id]: e.target.value})}
                            className="w-full bg-white border border-brand-primary/20 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Packages */}
              {schemaFields.pricingPackages.length > 0 && (
                <div>
                  <h3 className="text-base font-black text-gray-900 mb-4">Pricing Packages</h3>
                  <div className="space-y-4">
                    {schemaFields.pricingPackages.map((pkg, idx) => (
                      <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-black text-gray-900">{pkg.title}</label>
                          <span className="text-xs font-bold text-gray-500">{pkg.desc}</span>
                        </div>
                        <LazyInput 
                          type="text" 
                          placeholder="e.g. ₹50,000"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = [...schemaFields.pricingPackages];
                            updated[idx].price = e.target.value;
                            setSchemaFields({...schemaFields, pricingPackages: updated});
                          }}
                          className="w-full md:w-48 bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                <button onClick={handlePrev} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 px-4 py-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button onClick={handleNext} className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-black shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Save & Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BANKING & UPI */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                <Landmark size={24} className="text-blue-500" /> Banking & Payout Details
              </h2>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-800 text-sm font-medium mb-6">
                <CheckCircle2 size={20} className="shrink-0 text-blue-500" />
                <p>Gomandap uses secure bank transfers to remit funds for verified bookings. Your details are encrypted.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account Holder Name <span className="text-red-500">*</span></label>
                  <LazyInput type="text" value={bankingInfo.accountName} onChange={(e) => setBankingInfo({...bankingInfo, accountName: e.target.value})} placeholder="As per bank records" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bank Name <span className="text-red-500">*</span></label>
                  <LazyInput type="text" value={bankingInfo.bankName} onChange={(e) => setBankingInfo({...bankingInfo, bankName: e.target.value})} placeholder="e.g. HDFC Bank" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account Number <span className="text-red-500">*</span></label>
                  <LazyInput type="password" value={bankingInfo.accountNumber} onChange={(e) => setBankingInfo({...bankingInfo, accountNumber: e.target.value})} placeholder="Enter Account Number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">IFSC Code <span className="text-red-500">*</span></label>
                  <LazyInput type="text" value={bankingInfo.ifscCode} onChange={(e) => setBankingInfo({...bankingInfo, ifscCode: e.target.value})} placeholder="e.g. HDFC0001234" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white uppercase font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business UPI ID</label>
                  <LazyInput type="text" value={bankingInfo.upiId} onChange={(e) => setBankingInfo({...bankingInfo, upiId: e.target.value})} placeholder="business@upi" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white" />
                </div>
              </div>

              <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                <button onClick={handlePrev} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 px-4 py-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep4Valid}
                  className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-black shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  Save & Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PORTFOLIO UPLOAD */}
          {step === 5 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                <ImageIcon size={24} className="text-brand-gold" /> Upload Portfolio
              </h2>
              <p className="text-sm font-semibold text-gray-500 mb-6">High-quality photos increase booking rates by over 300%. Add photos of your venue, past work, or setup.</p>

              {/* Upload Zone UI Simulation */}
              <div className="border-2 border-dashed border-gray-300 rounded-3xl p-10 text-center bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handlePortfolioUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-brand-gold">
                  <UploadCloud size={32} />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-1">Click to Upload Images</h4>
                <p className="text-sm font-semibold text-gray-500 mb-4">or drag and drop JPG, PNG (Max 5MB each)</p>
                <div className="inline-block bg-white px-4 py-2 rounded-lg text-sm font-bold text-gray-700 shadow-sm border border-gray-200">
                  Select Files
                </div>
              </div>

              {/* Uploaded Files Preview */}
              {portfolio.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">Selected Files ({portfolio.length})</h4>
                  <div className="space-y-2">
                    {portfolio.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <ImageIcon size={20} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px] md:max-w-[400px]">{file.name}</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">Ready</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                <button onClick={handlePrev} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 px-4 py-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button onClick={handleNext} className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-black shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Review Application <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: SUBMIT (REVIEW) */}
          {step === 6 && (
            <div className="space-y-6 text-center py-10">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Ready for Verification</h2>
              <p className="text-base text-gray-500 font-medium max-w-md mx-auto mb-8">
                Your <strong>{basicInfo.category}</strong> profile for <strong>{basicInfo.name}</strong> is completely filled out. Our partner team will review your banking and portfolio details shortly.
              </p>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <button onClick={handlePrev} className="text-gray-500 font-bold hover:text-gray-900 px-6 py-3 border border-gray-200 rounded-xl">Back to Edit</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-brand-primary text-white px-10 py-4 rounded-xl font-black text-lg shadow-[0_10px_20px_-10px_rgba(239,68,68,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(239,68,68,0.7)] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? 'Uploading & Submitting...' : 'Submit Profile'}
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
