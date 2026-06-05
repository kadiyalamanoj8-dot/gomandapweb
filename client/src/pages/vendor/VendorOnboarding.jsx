import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import { CATEGORIES } from '../../data/mockData';
import { getCategorySchema } from '../../config/categorySchemas';
import { Camera, Store, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomDropdown from '../../components/ui/CustomDropdown';

const VendorOnboarding = () => {
  const { submitOnboarding } = useVendor();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    category: '',
    location: '',
    email: '',
    phone: ''
  });

  const [schemaFields, setSchemaFields] = useState({
    pricingPackages: [],
    featuresList: [],
    cuisineTags: [],
    policies: []
  });

  const [images, setImages] = useState([]);

  // When category changes, load the schema structure to pre-fill the form requirements
  useEffect(() => {
    if (basicInfo.category) {
      const schema = getCategorySchema(basicInfo.category);
      
      // Seed the form with empty arrays/objects based on what the schema EXPECTS for this category.
      // E.g., if the schema renders pricingPackages for Photographers, we require the vendor to fill them.
      setSchemaFields({
        pricingPackages: schema.customBlocks?.pricingPackages?.map(p => ({ ...p, price: '' })) || [],
        featuresList: schema.featuresList || [],
        cuisineTags: schema.customBlocks?.cuisineTags?.map(tag => ({ name: tag, checked: false })) || [],
        policies: schema.customBlocks?.policies?.map(p => ({ ...p, value: '' })) || []
      });
    }
  }, [basicInfo.category]);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Format the payload to perfectly match what VendorDetailsPage expects
    const finalProfile = {
      id: `vendor-${Date.now()}`,
      name: basicInfo.name,
      category: basicInfo.category,
      location: basicInfo.location,
      pricePerPlate: schemaFields.pricingPackages[0]?.price || 'Contact for Price', // Fallback
      rating: 5.0, // New vendors start with 5.0 base
      reviewsCount: 0,
      imageUrl: images[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
      customBlocks: {
        pricingPackages: schemaFields.pricingPackages.filter(p => p.price),
        cuisineTags: schemaFields.cuisineTags.filter(t => t.checked).map(t => t.name),
        policies: schemaFields.policies.filter(p => p.value)
      }
    };

    submitOnboarding(finalProfile);
    navigate('/vendor-portal/pending');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        
        {/* Progress Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Partner Onboarding</h1>
          <div className="flex justify-center items-center gap-4 text-sm font-bold text-gray-400">
            <span className={step >= 1 ? 'text-brand-primary' : ''}>1. Basics</span>
            <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-brand-primary' : 'bg-gray-200'}`}></div>
            <span className={step >= 2 ? 'text-brand-primary' : ''}>2. Details</span>
            <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-brand-primary' : 'bg-gray-200'}`}></div>
            <span className={step >= 3 ? 'text-brand-primary' : ''}>3. Review</span>
          </div>
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
        >
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                <Store size={20} className="text-brand-primary" /> Basic Business Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business Name</label>
                  <input 
                    type="text" 
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                    placeholder="e.g. Capture Infinity Studio"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Category</label>
                  <CustomDropdown
                    options={CATEGORIES.map(cat => ({label: cat.label, value: cat.label}))}
                    value={basicInfo.category}
                    onChange={(val) => setBasicInfo({...basicInfo, category: val})}
                    placeholder="Select your industry"
                    variant="light"
                    className="bg-gray-50 border border-gray-200 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">City / Location</label>
                  <input 
                    type="text" 
                    value={basicInfo.location}
                    onChange={(e) => setBasicInfo({...basicInfo, location: e.target.value})}
                    placeholder="e.g. Bandra West, Mumbai"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleNext} 
                  disabled={!basicInfo.name || !basicInfo.category || !basicInfo.location}
                  className="bg-brand-primary text-white px-8 py-3 rounded-xl font-black shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Deep Schema Details (Changes based on Category) */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                <DollarSign size={20} className="text-brand-primary" /> Setup {basicInfo.category} Services
              </h2>

              {/* Dynamic Pricing Packages */}
              {schemaFields.pricingPackages.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-gray-900 mb-3">Your Pricing Packages</h3>
                  <div className="space-y-4">
                    {schemaFields.pricingPackages.map((pkg, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{pkg.title} ({pkg.desc})</label>
                        <input 
                          type="text" 
                          placeholder="e.g. ₹50,000 / day"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = [...schemaFields.pricingPackages];
                            updated[idx].price = e.target.value;
                            setSchemaFields({...schemaFields, pricingPackages: updated});
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Policies */}
              {schemaFields.policies.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-gray-900 mb-3">Business Policies</h3>
                  <div className="space-y-4">
                    {schemaFields.policies.map((pol, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{pol.label}</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Yes / No / 50% Advance"
                          value={pol.value}
                          onChange={(e) => {
                            const updated = [...schemaFields.policies];
                            updated[idx].value = e.target.value;
                            setSchemaFields({...schemaFields, policies: updated});
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button onClick={handlePrev} className="text-gray-500 font-bold hover:text-gray-900">Back</button>
                <button onClick={handleNext} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-black shadow-md hover:-translate-y-0.5 transition-all">
                  Continue to Gallery
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Submission */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                <Camera size={20} className="text-brand-primary" /> Review & Submit
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-black text-gray-900 mb-2">Profile Ready for Review</h3>
                <p className="text-sm text-gray-600 font-medium">
                  Your profile for <strong>{basicInfo.name}</strong> will perfectly match the Gomandap Client layout for <strong>{basicInfo.category}</strong>. Once submitted, our Admin team will review and approve your account.
                </p>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={handlePrev} className="text-gray-500 font-bold hover:text-gray-900">Back</button>
                <button onClick={handleSubmit} className="bg-brand-primary text-white px-8 py-3 rounded-xl font-black shadow-md hover:-translate-y-0.5 transition-all">
                  Submit Profile
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
