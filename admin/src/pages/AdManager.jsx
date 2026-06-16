import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Save, CheckCircle2, AlertCircle, DollarSign, Image as ImageIcon, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../config/api';

const AdManager = () => {
  const [adSettings, setAdSettings] = useState({
    monthlyPrice: 2000,
    isActive: true,
    features: [
      'Top placement in search results',
      'Distinct shimmering gold animated card',
      'Verified "Sponsored" badge',
      'Priority customer support'
    ]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ads/package`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.data.success && res.data.data) {
        setAdSettings(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load Ad Package settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.patch(`${API_URL}/api/ads/package`, adSettings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      toast.success('Ad package pricing updated successfully!');
    } catch (error) {
      toast.error('Failed to save Ad Package settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...adSettings.features];
    newFeatures[index] = value;
    setAdSettings({ ...adSettings, features: newFeatures });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Advertisement Packages</h1>
          <p className="text-sm font-bold text-gray-500 mt-1">Configure the premium subscription offering for vendors.</p>
        </div>
        <Crown size={40} className="text-brand-gold opacity-20 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Settings */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign size={22} className="text-brand-primary" /> Pricing & Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Monthly Subscription Price (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-black">₹</span>
                  </div>
                  <input 
                    type="number"
                    value={adSettings.monthlyPrice}
                    onChange={(e) => setAdSettings({...adSettings, monthlyPrice: parseInt(e.target.value) || 0})}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-black text-2xl text-gray-900 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                  />
                </div>
                <p className="text-xs font-medium text-gray-500 mt-2">Vendors will be billed this amount monthly to keep their sponsored status.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Package Features Displayed to Vendors</label>
                <div className="space-y-3">
                  {adSettings.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="mt-3 w-1.5 h-1.5 bg-brand-gold rounded-full shrink-0"></div>
                      <input 
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-sm text-gray-700 focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${adSettings.isActive ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => setAdSettings({...adSettings, isActive: !adSettings.isActive})}>
                    <motion.div 
                      layout
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: adSettings.isActive ? 24 : 0 }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{adSettings.isActive ? 'Package is Active' : 'Package is Paused'}</span>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Save size={18} /> Save Settings</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Col: Preview */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-brand-gold/5 border border-brand-gold/20 p-6 rounded-3xl sticky top-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="text-brand-gold" size={20} />
              <h3 className="text-sm font-black text-brand-gold uppercase tracking-widest">Vendor Preview</h3>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-brand-gold/10 border border-brand-gold/20">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center mb-4">
                <Crown size={24} className="text-brand-gold" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-1">Premium Partner</h4>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-brand-gold">₹{adSettings.monthlyPrice}</span>
                <span className="text-sm font-bold text-gray-400">/ month</span>
              </div>

              <ul className="space-y-3 mb-6">
                {adSettings.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm font-semibold text-gray-600">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-black rounded-xl cursor-not-allowed">
                Subscribe Preview
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

// We need Eye from lucide-react, I'll add it
import { Eye } from 'lucide-react';

export default AdManager;
