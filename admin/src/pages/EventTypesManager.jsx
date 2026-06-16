import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Save, RefreshCw, List, Trash2, Plus, Edit2, X, CheckSquare, Square } from 'lucide-react';
import * as Icons from 'lucide-react';
import { API_URL } from '../config/api';

const VENDOR_CATEGORIES = [
  'Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses',
  'Resorts & Destination Venues', '5-Star Hotels', 'Party & Mini Halls',
  'Temples & Ashrams', 'Catering Service', 'Stage & Venue Decor',
  'Photography & Videography', 'DJs & Sound Systems', 'Live Musicians / Band Baaja',
  'Makeup Artists (MUA)', 'Mehndi Designers', 'Wedding Clothes / Boutiques',
  'Jewelry Shops', 'Wedding Cards & Invites', 'Cars & Buses (Travel)',
  'Astrologers / Pundits', 'Honeymoon Packages', 'Event Planners'
];

const DynamicIcon = ({ name, className }) => {
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon className={className} size={24} />;
};

const EventTypesManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingType, setEditingType] = useState(null);

  async function fetchSettings() {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data) {
        let types = res.data.data.eventTypes || [];
        // Legacy support: convert strings to objects
        if (types.length > 0 && typeof types[0] === 'string') {
          types = types.map(t => ({
            name: t,
            iconName: 'PartyPopper',
            mappedCategories: ['Banquet Halls']
          }));
        }
        setEventTypes(types);
      }
    } catch (error) {
      toast.error('Failed to load Event Types.');
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
      await axios.patch(`${API_URL}/api/settings/home-content`, { eventTypes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Event Types updated successfully!');
    } catch (error) {
      toast.error('Failed to update Event Types.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    if (index === -1) {
      setEditingType({ name: '', iconName: 'PartyPopper', mappedCategories: [] });
    } else {
      setEditingType({ ...eventTypes[index] });
    }
  };

  const saveEdit = () => {
    if (!editingType.name.trim()) {
      toast.error('Event Name is required.');
      return;
    }
    const newTypes = [...eventTypes];
    if (editingIndex === -1) {
      newTypes.push(editingType);
    } else {
      newTypes[editingIndex] = editingType;
    }
    setEventTypes(newTypes);
    setEditingIndex(-2);
    setEditingType(null);
  };

  const deleteType = (index) => {
    if (window.confirm('Are you sure you want to delete this Event Type?')) {
      const newTypes = [...eventTypes];
      newTypes.splice(index, 1);
      setEventTypes(newTypes);
    }
  };

  const toggleCategory = (cat) => {
    const categories = editingType.mappedCategories || [];
    if (categories.includes(cat)) {
      setEditingType({ ...editingType, mappedCategories: categories.filter(c => c !== cat) });
    } else {
      setEditingType({ ...editingType, mappedCategories: [...categories, cat] });
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
            <List className="text-brand-primary" size={28} />
            Event Types Manager
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage events and their mapped vendor categories.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => startEdit(-1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            <Plus size={18} /> Add New
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-brand-primary/30 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List of Events */}
        <div className="space-y-4">
          {eventTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border ${editingIndex === index ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/5' : 'border-gray-200 bg-white'} shadow-sm flex items-start justify-between group transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                  <DynamicIcon name={type.iconName} className="" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{type.name}</h3>
                  <p className="text-xs font-bold text-brand-primary mt-1">
                    {(type.mappedCategories || []).length} Categories Mapped
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(index)}
                  className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteType(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Editor Pane */}
        <div>
          <AnimatePresence mode="wait">
            {editingType && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sticky top-6"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-black text-gray-900">
                    {editingIndex === -1 ? 'Create Event Type' : 'Edit Event Type'}
                  </h2>
                  <button onClick={() => setEditingType(null)} className="p-1 text-gray-400 hover:text-gray-900">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Event Name</label>
                    <input
                      type="text"
                      value={editingType.name}
                      onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                      placeholder="e.g. Sangeet & Mehendi Night"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Lucide Icon Name</label>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                        <DynamicIcon name={editingType.iconName} className="" />
                      </div>
                      <input
                        type="text"
                        value={editingType.iconName}
                        onChange={(e) => setEditingType({ ...editingType, iconName: e.target.value })}
                        placeholder="e.g. Music, Heart, PartyPopper"
                        className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mapped Vendor Categories</label>
                    <p className="text-xs text-gray-500 mb-4">Select the categories to search when this event is selected.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                      {VENDOR_CATEGORIES.map(cat => {
                        const isSelected = (editingType.mappedCategories || []).includes(cat);
                        return (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-bold transition-colors ${isSelected ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                          >
                            {isSelected ? <CheckSquare size={16} className="shrink-0" /> : <Square size={16} className="shrink-0 text-gray-400" />}
                            <span className="truncate">{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={saveEdit}
                      className="w-full bg-gray-900 text-white rounded-xl py-3 font-bold hover:bg-black transition-colors"
                    >
                      {editingIndex === -1 ? 'Add Event Type' : 'Update Event Type'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EventTypesManager;
