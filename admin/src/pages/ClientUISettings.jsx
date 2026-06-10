import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Settings, Save, Image as ImageIcon, Layout, Box, RefreshCw, SlidersHorizontal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gomandap-api.onrender.com';

const ClientUISettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [use3DCarousel, setUse3DCarousel] = useState(true);
  const [carouselImages, setCarouselImages] = useState('');
  const [marqueeWidth, setMarqueeWidth] = useState('100vw');
  const [marqueeHeight, setMarqueeHeight] = useState('100%');
  const [marqueePositionY, setMarqueePositionY] = useState('0px');
  const [marqueeSpeed, setMarqueeSpeed] = useState(3);


  async function fetchSettings() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data?.clientUI) {
        setUse3DCarousel(res.data.data.clientUI.use3DCarousel ?? true);
        setCarouselImages((res.data.data.clientUI.carouselImages || []).join('\n'));
        setMarqueeWidth(res.data.data.clientUI.marqueeWidth || '100vw');
        setMarqueeHeight(res.data.data.clientUI.marqueeHeight || '100%');
        setMarqueePositionY(res.data.data.clientUI.marqueePositionY || '0px');
        setMarqueeSpeed(res.data.data.clientUI.marqueeSpeed || 3);
      }
    } catch (error) {
      toast.error('Failed to load Client UI settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const urls = carouselImages.split('\n').map(u => u.trim()).filter(Boolean);
      
      const payload = {
        use3DCarousel,
        carouselImages: urls,
        marqueeWidth,
        marqueeHeight,
        marqueePositionY,
        marqueeSpeed: Number(marqueeSpeed)
      };

      await axios.patch(`${API_URL}/api/settings/client-ui`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Client UI settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update Client UI settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Layout className="text-brand-primary" size={28} />
            Client UI Settings
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Configure the frontend layout and Hero section components.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-brand-primary/30 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Marquee Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Box size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Dynamic Background Slideshow</h2>
              <p className="text-xs text-gray-500 font-medium">Control the fading mandap slideshow behind the couple.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <div className="font-bold text-gray-900 text-sm">Enable Slideshow</div>
                <div className="text-xs text-gray-500">Shows the fading backgrounds on the homepage.</div>
              </div>
              <button
                onClick={() => setUse3DCarousel(!use3DCarousel)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${use3DCarousel ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${use3DCarousel ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Cloudinary URLs */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ImageIcon size={16} /> Cloudinary Image URLs
              </label>
              <p className="text-xs text-gray-500 mb-2">Paste URLs one per line. If left empty, it uses the local default `copy` images.</p>
              <textarea
                value={carouselImages}
                onChange={(e) => setCarouselImages(e.target.value)}
                rows={4}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary font-mono text-gray-600"
              />
            </div>
          </div>
        </motion.div>

        {/* Marquee Dimensions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Slideshow Layout</h2>
              <p className="text-xs text-gray-500 font-medium">Adjust the size and position of the background images.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Width</label>
              <input
                type="text"
                value={marqueeWidth}
                onChange={(e) => setMarqueeWidth(e.target.value)}
                placeholder="e.g. 100vw or 800px"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Height</label>
              <input
                type="text"
                value={marqueeHeight}
                onChange={(e) => setMarqueeHeight(e.target.value)}
                placeholder="e.g. 100% or 400px"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Vertical Position (Y Offset)</label>
              <input
                type="text"
                value={marqueePositionY}
                onChange={(e) => setMarqueePositionY(e.target.value)}
                placeholder="e.g. 0px or -50px"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slideshow Duration (Seconds per image)</label>
              <input
                type="number"
                value={marqueeSpeed}
                onChange={(e) => setMarqueeSpeed(e.target.value)}
                min="1"
                step="0.5"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientUISettings;
