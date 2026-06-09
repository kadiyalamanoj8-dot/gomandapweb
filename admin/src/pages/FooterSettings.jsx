import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Save, RefreshCw, LayoutTemplate, Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Phone, Mail, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gomandap-api.onrender.com';

const defaultFooter = {
  aboutText: "",
  copyrightText: "",
  contactInfo: { phone: "", email: "" },
  socialLinks: []
};

const FooterSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'vendor'
  
  const [clientFooter, setClientFooter] = useState(JSON.parse(JSON.stringify(defaultFooter)));
  const [vendorFooter, setVendorFooter] = useState(JSON.parse(JSON.stringify(defaultFooter)));

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/content`);
      if (res.data.success) {
        if (res.data.clientFooter) setClientFooter({ ...defaultFooter, ...res.data.clientFooter });
        if (res.data.vendorFooter) setVendorFooter({ ...defaultFooter, ...res.data.vendorFooter });
      }
    } catch (error) {
      toast.error('Failed to load Footer settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`${API_URL}/api/content/footer`, {
        clientFooter,
        vendorFooter
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Footer settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save Footer settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentFooter = activeTab === 'client' ? clientFooter : vendorFooter;
  const setCurrentFooter = activeTab === 'client' ? setClientFooter : setVendorFooter;

  const handleChange = (field, value) => {
    setCurrentFooter(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field, value) => {
    setCurrentFooter(prev => ({
      ...prev,
      contactInfo: { ...(prev.contactInfo || {}), [field]: value }
    }));
  };

  const addSocialLink = () => {
    setCurrentFooter(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { platform: 'instagram', url: '', iconUrl: '' }]
    }));
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...(currentFooter.socialLinks || [])];
    updated[index][field] = value;
    handleChange('socialLinks', updated);
  };

  const removeSocialLink = (index) => {
    const updated = [...(currentFooter.socialLinks || [])];
    updated.splice(index, 1);
    handleChange('socialLinks', updated);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutTemplate className="text-brand-primary" size={28} />
            Dynamic Footer Settings
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage contact info, text, and 3D social icons.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-brand-primary/30 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('client')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'client' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Client App Footer
        </button>
        <button
          onClick={() => setActiveTab('vendor')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'vendor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Vendor App Footer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Text & Contact */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><FileText size={20} className="text-blue-500"/> General Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">About Us Text</label>
                <textarea
                  value={currentFooter.aboutText || ''}
                  onChange={(e) => handleChange('aboutText', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary"
                  placeholder="Your ultimate marketplace..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Copyright Text</label>
                <input
                  type="text"
                  value={currentFooter.copyrightText || ''}
                  onChange={(e) => handleChange('copyrightText', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary"
                  placeholder="© 2026 Gomandap. All rights reserved."
                />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Phone size={20} className="text-green-500"/> Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Support Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={currentFooter.contactInfo?.phone || ''}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-3 text-sm focus:outline-none focus:border-brand-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Support Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={currentFooter.contactInfo?.email || ''}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 p-3 text-sm focus:outline-none focus:border-brand-primary"
                    placeholder="support@gomandap.com"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Social Links */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><LinkIcon size={20} className="text-purple-500"/> Social Media & Icons</h2>
            <button onClick={addSocialLink} className="flex items-center gap-1 text-sm font-bold text-brand-primary hover:text-brand-primary-hover bg-brand-primary/10 px-3 py-1.5 rounded-lg">
              <Plus size={16} /> Add Link
            </button>
          </div>

          <div className="space-y-4">
            {(!currentFooter.socialLinks || currentFooter.socialLinks.length === 0) && (
              <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">No social links added yet.</p>
            )}
            
            {currentFooter.socialLinks?.map((social, index) => (
              <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative group">
                <button onClick={() => removeSocialLink(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
                
                <div className="space-y-3 pr-8">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Platform</label>
                    <select
                      value={social.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary font-bold text-gray-700"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="facebook">Facebook</option>
                      <option value="telegram">Telegram</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">URL (Destination link)</label>
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><ImageIcon size={12}/> 3D Custom Icon URL (Optional)</label>
                    <input
                      type="text"
                      value={social.iconUrl || ''}
                      onChange={(e) => updateSocialLink(index, 'iconUrl', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary font-mono text-xs"
                      placeholder="https://res.cloudinary.com/.../3d-instagram.png"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Paste a link to your 3D colorful PNG here to override default icons.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FooterSettings;
