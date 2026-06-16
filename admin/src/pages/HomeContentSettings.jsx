import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Save, RefreshCw, Type, List, Trash2, Plus } from 'lucide-react';
import { API_URL } from '../config/api';

const HomeContentSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [eventTypes, setEventTypes] = useState('');
  const [whyUsFeatures, setWhyUsFeatures] = useState([]);

  async function fetchSettings() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data) {
        setEventTypes((res.data.data.eventTypes || []).join('\n'));
        setWhyUsFeatures(res.data.data.whyUsFeatures || []);
      }
    } catch (error) {
      toast.error('Failed to load Home Content settings.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const eventTypesArray = eventTypes.split('\n').map(t => t.trim()).filter(Boolean);
      
      const payload = {
        eventTypes: eventTypesArray,
        whyUsFeatures
      };

      await axios.patch(`${API_URL}/api/settings/home-content`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Home content updated successfully!');
    } catch (error) {
      toast.error('Failed to update Home content.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFeature = () => {
    setWhyUsFeatures([...whyUsFeatures, { title: 'New Feature', description: 'Description', iconName: 'Star' }]);
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = [...whyUsFeatures];
    newFeatures.splice(index, 1);
    setWhyUsFeatures(newFeatures);
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...whyUsFeatures];
    newFeatures[index][field] = value;
    setWhyUsFeatures(newFeatures);
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
            <Type className="text-brand-primary" size={28} />
            Home Content Settings
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage event types and 'Why GoMandap' features.</p>
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
        {/* Event Types */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <List size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Search Dropdown Events</h2>
              <p className="text-xs text-gray-500 font-medium">Types of events users can search for in the hero banner.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Event Types</label>
            <p className="text-xs text-gray-500 mb-2">Paste one event type per line.</p>
            <textarea
              value={eventTypes}
              onChange={(e) => setEventTypes(e.target.value)}
              rows={12}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary font-mono text-gray-600"
            />
          </div>
        </motion.div>

        {/* Why GoMandap Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Type size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Why GoMandap Features</h2>
                <p className="text-xs text-gray-500 font-medium">The 4 cards shown below the category grid.</p>
              </div>
            </div>
            <button onClick={handleAddFeature} className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {whyUsFeatures.map((feature, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50 relative">
                <button 
                  onClick={() => handleRemoveFeature(index)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Lucide Icon Name</label>
                    <input
                      type="text"
                      value={feature.iconName}
                      onChange={(e) => handleFeatureChange(index, 'iconName', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-primary"
                    />
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

export default HomeContentSettings;
