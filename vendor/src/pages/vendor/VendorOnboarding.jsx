import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { useSettings } from '../../context/SettingsContext';
import { VENUE_CATEGORIES, VENDOR_CATEGORIES } from '../../data/mockData';
import { getCategorySchema } from '../../config/categorySchemas';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { 
  Camera, Store, MapPin, DollarSign, CheckCircle2, ChevronRight, ChevronLeft,
  Building2, UserCircle2, Briefcase, Landmark, Image as ImageIcon, UploadCloud,
  LogOut, Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import LocationPicker from '../../components/common/LocationPicker';
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
  const { submitOnboarding, saveDraft, vendorProfile, logoutVendor } = useVendor();
  const { isCategoryEnabled } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const googleData = location.state || {};
  const [step, setStep] = useState(vendorProfile?.currentStep || 1);

  const activeVenueCategories = VENUE_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));
  const activeVendorCategories = VENDOR_CATEGORIES.filter(cat => isCategoryEnabled(cat.label));

  // Form State initialized from Draft
  const [basicInfo, setBasicInfo] = useState({
    category: vendorProfile?.category || '',
    name: vendorProfile?.name || googleData.name || '',
    ownerName: vendorProfile?.ownerName || googleData.name || '',
    phone: vendorProfile?.contact?.phone || '',
    whatsapp: vendorProfile?.contact?.whatsapp || '',
    email: vendorProfile?.email || vendorProfile?.contact?.email || googleData.email || '',
    googleId: vendorProfile?.googleId || googleData.googleId || '',
    photoUrl: vendorProfile?.photoUrl || googleData.photoUrl || '',
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

  useEffect(() => {
    if (basicInfo.locationData?.parsedAddress) {
      const pa = basicInfo.locationData.parsedAddress;
      setBasicInfo(prev => ({
        ...prev,
        village: pa.village || prev.village,
        mandal: pa.mandal || prev.mandal,
        district: pa.district || prev.district,
        state: pa.state || prev.state,
        city: pa.district || pa.village || prev.city,
        streetAddress: pa.formattedAddress || prev.streetAddress,
        pincode: pa.pincode || prev.pincode
      }));
    }
  }, [basicInfo.locationData?.parsedAddress]);

  const performSaveDraft = async (nextStep, customCategory = null) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    formData.append('category', customCategory || basicInfo.category);
    formData.append('name', basicInfo.name);
    formData.append('ownerName', basicInfo.ownerName);
    formData.append('email', basicInfo.email);
    formData.append('googleId', basicInfo.googleId);
    formData.append('photoUrl', basicInfo.photoUrl);
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

  const handleNext = () => performSaveDraft(step + 1);
  const handlePrev = () => performSaveDraft(step - 1);

  const handleLogout = () => {
    logoutVendor();
    navigate('/');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleCategorySelect = (categoryLabel) => {
    setBasicInfo({...basicInfo, category: categoryLabel});
    performSaveDraft(2, categoryLabel);
  };

  const handlePortfolioUpload = (e) => {
    const files = Array.from(e.target.files);
    setPortfolio([...portfolio, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    
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

  const isStep2Valid = basicInfo.name && basicInfo.ownerName && basicInfo.phone && basicInfo.city && basicInfo.streetAddress;
  const isStep4Valid = bankingInfo.accountNumber && bankingInfo.ifscCode && bankingInfo.bankName && bankingInfo.accountName;

  // Dark Pro Theme Input Classes
  const inputClassName = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-medium text-white focus:outline-none focus:border-brand-gold focus:bg-white/10 focus:ring-1 focus:ring-brand-gold/50 transition-all placeholder:text-white/30";
  const labelClassName = "block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-black font-sans text-white relative">
      {/* Immersive Event Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="/images/temple_background.webp" 
          alt="Premium Event Background" 
          className="w-full h-full object-cover opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black"></div>
      </div>
      
      {/* Apple-style sticky transparent/blur header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-3xl border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto max-w-[1400px] px-6 h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-gold/20 border border-brand-gold/30 rounded-xl flex items-center justify-center">
              <Store className="text-brand-gold w-4 h-4" />
            </div>
            <div className="text-lg font-black text-white tracking-tight">
              Gomandap <span className="text-brand-gold font-medium">Business</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Step {step} of 6 : Onboarding</span>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                 <div className="text-sm font-bold text-white">{basicInfo.name || basicInfo.ownerName || 'Vendor'}</div>
                 <div className="text-[10px] text-brand-gold uppercase tracking-widest font-bold">Draft Profile</div>
               </div>
               {basicInfo.photoUrl ? (
                 <img src={basicInfo.photoUrl} alt="Profile" className="w-10 h-10 rounded-full border-2 border-brand-gold/50 shadow-md object-cover" />
               ) : (
                 <div className="w-10 h-10 rounded-full bg-brand-gold/10 border-2 border-brand-gold/30 flex items-center justify-center">
                   <UserCircle2 size={20} className="text-brand-gold" />
                 </div>
               )}
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/50 hover:text-red-400 transition-colors pl-4 border-l border-white/10"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Exit</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-32 pb-24 relative z-10">
        
        {/* Modern 5-Step Progress Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-8">Partner Onboarding</h1>
          
          <div className="flex justify-between items-center max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-brand-gold -translate-y-1/2 z-0 transition-all duration-500 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
            
            {[
              { num: 1, icon: Store, label: "Category" },
              { num: 2, icon: UserCircle2, label: "Identity" },
              { num: 3, icon: Briefcase, label: "Services" },
              { num: 4, icon: Landmark, label: "Banking" },
              { num: 5, icon: ImageIcon, label: "Portfolio" },
              { num: 6, icon: CheckCircle2, label: "Review" }
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 backdrop-blur-md ${step >= s.num ? 'bg-brand-gold border-brand-gold text-white shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-black/50 border-white/20 text-white/40'}`}>
                  <s.icon size={16} className="md:w-5 md:h-5" />
                </div>
                <span className={`text-[9px] md:text-[11px] font-bold absolute -bottom-6 whitespace-nowrap tracking-wide ${step >= s.num ? 'text-white' : 'text-white/40'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/10 mt-16"
        >
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-white mb-2">What is your business type?</h2>
                <p className="text-white/60 font-medium">Select your primary category to configure your custom dashboard.</p>
              </div>
              
              <div>
                <h4 className="text-[11px] font-bold text-brand-gold uppercase tracking-widest mb-6">1. Wedding Venues</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {activeVenueCategories.map((cat, idx) => {
                    const isSelected = basicInfo.category === cat.label;
                    const icon3d = ICON_MAP[cat.label];
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <button
                          onClick={() => handleCategorySelect(cat.label)}
                          className={`w-24 h-24 flex items-center justify-center rounded-3xl transition-all duration-300 relative overflow-hidden bg-black/40 backdrop-blur-md ${
                            isSelected 
                              ? 'scale-105 shadow-[0_0_30px_rgba(250,204,21,0.2)] border-2 border-brand-gold' 
                              : 'hover:scale-105 hover:bg-white/10 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="w-14 h-14 flex items-center justify-center relative z-10 pointer-events-none">
                            {icon3d ? (
                              <img
                                src={icon3d}
                                alt={cat.label}
                                className={`w-full h-full object-contain transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-[0_10px_20px_rgba(250,204,21,0.3)]' : 'drop-shadow-md group-hover:scale-110'}`}
                              />
                            ) : (
                              <IconComponent name={cat.iconName} size={28} className={isSelected ? 'text-brand-gold' : 'text-white/50 group-hover:text-white'} />
                            )}
                          </div>
                        </button>
                        <p className={`text-[11px] font-bold text-center leading-tight px-1 h-8 flex items-start justify-center transition-colors ${isSelected ? 'text-brand-gold' : 'text-white/50 group-hover:text-white/90'}`}>
                          {cat.label}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-12">
                <h4 className="text-[11px] font-bold text-brand-gold uppercase tracking-widest mb-6">2. Wedding Vendors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {activeVendorCategories.map((cat, idx) => {
                    const isSelected = basicInfo.category === cat.label;
                    const icon3d = ICON_MAP[cat.label];
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <button
                          onClick={() => handleCategorySelect(cat.label)}
                          className={`w-24 h-24 flex items-center justify-center rounded-3xl transition-all duration-300 relative overflow-hidden bg-black/40 backdrop-blur-md ${
                            isSelected 
                              ? 'scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)] border-2 border-brand-gold' 
                              : 'hover:scale-105 hover:bg-white/10 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="w-14 h-14 flex items-center justify-center relative z-10 pointer-events-none">
                            {icon3d ? (
                              <img
                                src={icon3d}
                                alt={cat.label}
                                className={`w-full h-full object-contain transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-[0_10px_20px_rgba(212,175,55,0.3)]' : 'drop-shadow-md group-hover:scale-110'}`}
                              />
                            ) : (
                              <IconComponent name={cat.iconName} size={28} className={isSelected ? 'text-brand-gold' : 'text-white/50 group-hover:text-white'} />
                            )}
                          </div>
                        </button>
                        <p className={`text-[11px] font-bold text-center leading-tight px-1 h-8 flex items-start justify-center transition-colors ${isSelected ? 'text-brand-gold' : 'text-white/50 group-hover:text-white/90'}`}>
                          {cat.label}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-12 flex justify-center pt-8 border-t border-white/10">
                <button onClick={handleHome} className="flex items-center gap-2 text-white/50 font-bold hover:text-white px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10">
                  <Home size={18} /> Return to Home
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS & PERSONAL IDENTITY */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white border-b border-white/10 pb-4">Business Identity & Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>Business/Brand Name <span className="text-brand-gold">*</span></label>
                  <LazyInput type="text" value={basicInfo.name} onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})} placeholder="e.g. Capture Infinity Studio" className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>Owner Full Name <span className="text-brand-gold">*</span></label>
                  <LazyInput type="text" value={basicInfo.ownerName} onChange={(e) => setBasicInfo({...basicInfo, ownerName: e.target.value})} placeholder="e.g. Rahul Sharma" className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>Phone Number <span className="text-brand-gold">*</span></label>
                  <LazyInput type="tel" value={basicInfo.phone} onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})} placeholder="+91 98765 43210" className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>WhatsApp Number</label>
                  <LazyInput type="tel" value={basicInfo.whatsapp} onChange={(e) => setBasicInfo({...basicInfo, whatsapp: e.target.value})} placeholder="Same as phone" className={inputClassName} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClassName}>Street Address</label>
                  <LazyInput type="text" value={basicInfo.streetAddress} onChange={(e) => setBasicInfo({...basicInfo, streetAddress: e.target.value})} placeholder="Shop number, building, street" className={inputClassName} />
                </div>
                
                {/* Ensure LocationPicker can handle dark mode classes implicitly or inherits */}
                <div className="md:col-span-2 pt-4 border-t border-white/10 mt-4 rounded-xl overflow-hidden shadow-lg border border-white/5">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mb-4 px-2"
                  >
                    <motion.p 
                      animate={{ boxShadow: ['0px 0px 0px rgba(212,175,55,0)', '0px 0px 20px rgba(212,175,55,0.3)', '0px 0px 0px rgba(212,175,55,0)'] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="text-[13px] text-brand-gold font-medium bg-brand-gold/10 p-4 rounded-xl border border-brand-gold/30 flex items-start gap-3"
                    >
                      <MapPin className="shrink-0 mt-0.5 animate-bounce" size={18} />
                      <span>
                        <strong className="font-black uppercase tracking-wider">Pro Tip:</strong> Auto-location might snap to the nearest major area. Please <strong>drag the map pin</strong> exactly to your venue, and manually correct the Village/Mandal boxes below if they are slightly off!
                      </span>
                    </motion.p>
                  </motion.div>
                  <LocationPicker 
                    locationData={basicInfo.locationData} 
                    onChange={(data) => setBasicInfo({...basicInfo, locationData: data})} 
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className={labelClassName}>Village / Suburb</label>
                    <LazyInput type="text" value={basicInfo.village} onChange={(e) => setBasicInfo({...basicInfo, village: e.target.value})} placeholder="e.g. Kondapur" className={inputClassName} />
                  </div>
                  <div>
                    <label className={labelClassName}>Mandal / Tehsil</label>
                    <LazyInput type="text" value={basicInfo.mandal} onChange={(e) => setBasicInfo({...basicInfo, mandal: e.target.value})} placeholder="e.g. Serilingampally" className={inputClassName} />
                  </div>
                  <div>
                    <label className={labelClassName}>District</label>
                    <LazyInput type="text" value={basicInfo.district} onChange={(e) => setBasicInfo({...basicInfo, district: e.target.value})} placeholder="e.g. Rangareddy" className={inputClassName} />
                  </div>
                  <div>
                    <label className={labelClassName}>State</label>
                    <LazyInput type="text" value={basicInfo.state} onChange={(e) => setBasicInfo({...basicInfo, state: e.target.value})} placeholder="e.g. Telangana" className={inputClassName} />
                  </div>
                </div>

                <div>
                  <label className={labelClassName}>City (Display)</label>
                  <LazyInput type="text" value={basicInfo.city} onChange={(e) => setBasicInfo({...basicInfo, city: e.target.value})} placeholder="e.g. Hyderabad" className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>Pincode</label>
                  <LazyInput type="text" value={basicInfo.pincode} onChange={(e) => setBasicInfo({...basicInfo, pincode: e.target.value})} placeholder="e.g. 400001" className={inputClassName} />
                </div>
                
                <div>
                  <label className={labelClassName}>Business Email</label>
                  <LazyInput type="email" value={basicInfo.email} onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})} placeholder="contact@business.com" className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>GSTIN (Optional)</label>
                  <LazyInput type="text" value={basicInfo.gstin} onChange={(e) => setBasicInfo({...basicInfo, gstin: e.target.value})} placeholder="22AAAAA0000A1Z5" className={`${inputClassName} uppercase`} />
                </div>
              </div>

              <div className="mt-10 flex justify-between pt-6 border-t border-white/10">
                <button onClick={handlePrev} className="flex items-center gap-2 text-white/50 font-bold hover:text-white px-4 py-2 transition-colors">
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep2Valid}
                  className="bg-brand-gold text-white px-8 py-3.5 rounded-xl font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                  Save & Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CATEGORY SERVICES (DEEP SCHEMA) */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white border-b border-white/10 pb-4 flex items-center gap-3">
                <Building2 size={24} className="text-brand-gold" /> Core Service Details
              </h2>
              <p className="text-sm font-semibold text-white/50 mb-6">These details help couples filter and discover your business exactly when they need it.</p>

              {/* Dynamic Deep Features */}
              {schemaFields.vendorFormFields.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8 backdrop-blur-sm">
                  <h3 className="text-base font-black text-brand-gold mb-6 tracking-wide">Key Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {schemaFields.vendorFormFields.map(field => (
                      <div key={field.id}>
                        <label className={labelClassName}>{field.label}</label>
                        {field.type === 'select' ? (
                          <div className="vendor-dark-dropdown">
                             <CustomDropdown
                              value={formResponses[field.id] || ''} 
                              onChange={(val) => setFormResponses({...formResponses, [field.id]: val})}
                              options={field.options}
                              placeholder="Select option"
                              variant="dark"
                            />
                          </div>
                        ) : (
                          <LazyInput 
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formResponses[field.id] || ''} 
                            onChange={(e) => setFormResponses({...formResponses, [field.id]: e.target.value})}
                            className={inputClassName}
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
                  <h3 className="text-base font-black text-white mb-6">Pricing Packages</h3>
                  <div className="space-y-4">
                    {schemaFields.pricingPackages.map((pkg, idx) => (
                      <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-black text-white">{pkg.title}</label>
                          <span className="text-xs font-bold text-white/50">{pkg.desc}</span>
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
                          className={`${inputClassName} md:w-48`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-between pt-6 border-t border-white/10">
                <button onClick={handlePrev} className="flex items-center gap-2 text-white/50 font-bold hover:text-white px-4 py-2 transition-colors">
                  <ChevronLeft size={18} /> Back
                </button>
                <button onClick={handleNext} className="bg-brand-gold text-white px-8 py-3.5 rounded-xl font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2">
                  Save & Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BANKING & UPI */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white border-b border-white/10 pb-4 flex items-center gap-3">
                <Landmark size={24} className="text-brand-gold" /> Banking & Payout Details
              </h2>
              <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-4 flex gap-3 text-brand-gold text-sm font-medium mb-6 backdrop-blur-md">
                <CheckCircle2 size={20} className="shrink-0 text-brand-gold" />
                <p>Gomandap uses secure bank transfers to remit funds for verified bookings. Your details are encrypted.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClassName}>Account Holder Name <span className="text-brand-gold">*</span></label>
                  <LazyInput type="text" value={bankingInfo.accountName} onChange={(e) => setBankingInfo({...bankingInfo, accountName: e.target.value})} placeholder="As per bank records" className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>Bank Name <span className="text-brand-gold">*</span></label>
                  <LazyInput type="text" value={bankingInfo.bankName} onChange={(e) => setBankingInfo({...bankingInfo, bankName: e.target.value})} placeholder="e.g. HDFC Bank" className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>Account Number <span className="text-brand-gold">*</span></label>
                  <LazyInput type="password" value={bankingInfo.accountNumber} onChange={(e) => setBankingInfo({...bankingInfo, accountNumber: e.target.value})} placeholder="Enter Account Number" className={`${inputClassName} font-mono`} />
                </div>
                <div>
                  <label className={labelClassName}>IFSC Code <span className="text-brand-gold">*</span></label>
                  <LazyInput type="text" value={bankingInfo.ifscCode} onChange={(e) => setBankingInfo({...bankingInfo, ifscCode: e.target.value})} placeholder="e.g. HDFC0001234" className={`${inputClassName} uppercase font-mono`} />
                </div>
                <div>
                  <label className={labelClassName}>Business UPI ID</label>
                  <LazyInput type="text" value={bankingInfo.upiId} onChange={(e) => setBankingInfo({...bankingInfo, upiId: e.target.value})} placeholder="business@upi" className={inputClassName} />
                </div>
              </div>

              <div className="mt-10 flex justify-between pt-6 border-t border-white/10">
                <button onClick={handlePrev} className="flex items-center gap-2 text-white/50 font-bold hover:text-white px-4 py-2 transition-colors">
                  <ChevronLeft size={18} /> Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep4Valid}
                  className="bg-brand-gold text-white px-8 py-3.5 rounded-xl font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                  Save & Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PORTFOLIO UPLOAD */}
          {step === 5 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white border-b border-white/10 pb-4 flex items-center gap-3">
                <ImageIcon size={24} className="text-brand-gold" /> Upload Portfolio
              </h2>
              <p className="text-sm font-semibold text-white/50 mb-6">High-quality photos increase booking rates by over 300%. Add photos of your venue, past work, or setup.</p>

              {/* Upload Zone UI Simulation */}
              <div className="border-2 border-dashed border-white/20 rounded-3xl p-10 text-center bg-black/40 hover:bg-white/5 hover:border-white/40 transition-colors relative backdrop-blur-md">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handlePortfolioUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-gold border border-white/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                  <UploadCloud size={32} />
                </div>
                <h4 className="text-lg font-black text-white mb-1">Click to Upload Images</h4>
                <p className="text-sm font-semibold text-white/40 mb-6">or drag and drop JPG, PNG (Max 5MB each)</p>
                <div className="inline-block bg-white/10 border border-white/20 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/20 transition-colors shadow-sm">
                  Select Files
                </div>
              </div>

              {/* Uploaded Files Preview */}
              {portfolio.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-[11px] font-bold text-white/60 mb-3 uppercase tracking-widest">Selected Files ({portfolio.length})</h4>
                  <div className="space-y-3">
                    {portfolio.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center">
                            <ImageIcon size={18} className="text-white/40" />
                          </div>
                          <span className="text-sm font-semibold text-white/80 truncate max-w-[200px] md:max-w-[400px]">{file.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-md uppercase tracking-wider">Ready</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-between pt-6 border-t border-white/10">
                <button onClick={handlePrev} className="flex items-center gap-2 text-white/50 font-bold hover:text-white px-4 py-2 transition-colors">
                  <ChevronLeft size={18} /> Back
                </button>
                <button onClick={handleNext} className="bg-brand-gold text-white px-8 py-3.5 rounded-xl font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all flex items-center gap-2">
                  Review Application <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: SUBMIT (REVIEW) */}
          {step === 6 && (
            <div className="space-y-6 text-center py-12">
              <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Ready for Verification</h2>
              <p className="text-base text-white/60 font-medium max-w-md mx-auto mb-10 leading-relaxed">
                Your <strong className="text-brand-gold">{basicInfo.category}</strong> profile for <strong className="text-white">{basicInfo.name}</strong> is fully configured. Our partner team will review your banking and portfolio details to activate your dashboard.
              </p>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <button onClick={handlePrev} className="text-white/60 font-bold hover:text-white hover:bg-white/5 px-6 py-3.5 border border-white/20 rounded-xl transition-all">Back to Edit</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-brand-gold text-white px-10 py-3.5 rounded-xl font-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
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
