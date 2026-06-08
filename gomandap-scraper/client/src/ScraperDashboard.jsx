import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, Check, Trash2, Send, MapPin, Database, Search, CheckCircle2, Download, Globe, Users, LogOut, Filter, RefreshCw, Phone, Mail, Link2, Star, Clock, ExternalLink, ChevronDown, ChevronRight, Building2, Camera, Music, Utensils, Flower2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
const OLA_API_KEY = 'H0NKbjwH3YFcVwyDZBpxtIlGsdrZsxXPjoX0yutE';

// Category color & icon mapping
const CATEGORY_META = {
  'Banquet Hall': { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: Building2 },
  'Photographer': { color: '#ec4899', bg: 'rgba(236,72,153,0.15)', icon: Camera },
  'DJ': { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', icon: Music },
  'Caterer': { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: Utensils },
  'Florist': { color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: Flower2 },
  'Decorator': { color: '#f97316', bg: 'rgba(249,115,22,0.15)', icon: Zap },
};

function getCategoryMeta(cat) {
  const key = Object.keys(CATEGORY_META).find(k => cat?.toLowerCase().includes(k.toLowerCase()));
  return CATEGORY_META[key] || { color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: MapPin };
}

// Vendor Card Component
function VendorCard({ vendor, index, employees, onVerify, onDelete, onAssign }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(vendor.category);
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
      whileHover={{ y: -2, boxShadow: `0 16px 40px -8px ${meta.color}30` }}
      className="rounded-2xl border border-white/8 overflow-hidden cursor-pointer will-change-transform"
      style={{ background: 'rgba(10,10,20,0.7)', backdropFilter: 'blur(20px)' }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Colored left accent bar */}
      <div className="flex">
        <div className="w-1 shrink-0" style={{ background: vendor.verified ? meta.color : 'rgba(255,255,255,0.1)' }} />
        <div className="flex-1 p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
                <Icon size={16} style={{ color: meta.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm leading-tight truncate">{vendor.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: meta.bg, color: meta.color }}>
                    {vendor.category}
                  </span>
                  <span className="text-xs text-white/40 truncate">{vendor.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {vendor.rating && (
                <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> {vendor.rating}
                </span>
              )}
              {vendor.verified && !vendor.pushed && <CheckCircle2 size={14} className="text-blue-400" />}
              {vendor.pushed && <Database size={14} className="text-green-400" />}
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-white/30" />
              </motion.div>
            </div>
          </div>

          {/* Phone + Quick Info */}
          <div className="mt-3 flex flex-wrap gap-2">
            {vendor.phone && !vendor.phone.includes('Requires') && (
              <a href={`tel:${vendor.phone}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-lg hover:bg-green-500/20 transition-colors">
                <Phone size={10} /> {vendor.phone}
              </a>
            )}
            {vendor.email && (
              <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg">
                <Mail size={10} /> Email
              </span>
            )}
            {vendor.instagram && (
              <a href={vendor.instagram} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs bg-pink-500/10 text-pink-400 px-2 py-1 rounded-lg hover:bg-pink-500/20 transition-colors">
                <Link2 size={10} /> Instagram
              </a>
            )}
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  {vendor.address && (
                    <div className="flex items-start gap-2 text-xs text-white/50">
                      <MapPin size={12} className="mt-0.5 shrink-0 text-white/30" />
                      <span>{vendor.address}</span>
                    </div>
                  )}
                  {vendor.operatingHours && (
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Clock size={12} className="text-white/30" />
                      <span className="line-clamp-1">{vendor.operatingHours}</span>
                    </div>
                  )}
                  {vendor.mapsLink && (
                    <a href={vendor.mapsLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      <ExternalLink size={10} /> Open in Google Maps
                    </a>
                  )}
                  {vendor.topReviews?.length > 0 && (
                    <div className="bg-white/3 rounded-lg p-3">
                      <p className="text-xs font-bold text-white/40 mb-2">TOP REVIEW</p>
                      <p className="text-xs text-white/60 italic line-clamp-2">"{vendor.topReviews[0]}"</p>
                    </div>
                  )}

                  {/* Actions */}
                  {!vendor.pushed && (
                    <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
                      <select
                        onChange={(e) => onAssign(vendor.id, e.target.value)}
                        value={vendor.assignedTo || ''}
                        className="flex-1 px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Assign...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => onVerify(vendor.id, vendor)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${vendor.verified ? 'bg-blue-500/20 text-blue-400' : 'bg-white text-black hover:bg-blue-500 hover:text-white'}`}
                      >
                        {vendor.verified ? '✓ Done' : 'Verify'}
                      </button>
                      <button
                        onClick={() => onDelete(vendor.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Category Group Panel Component
function CategoryGroup({ category, vendors, employees, onVerify, onDelete, onAssign }) {
  const [open, setOpen] = useState(true);
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 hover:bg-white/5 transition-colors group"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
          <Icon size={13} style={{ color: meta.color }} />
        </div>
        <span className="flex-1 text-left text-sm font-bold text-white/70 group-hover:text-white transition-colors">{category}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: meta.bg, color: meta.color }}>{vendors.length}</span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronRight size={13} className="text-white/30" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-2 pl-1"
          >
            {vendors.map((vendor, idx) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                index={idx}
                employees={employees}
                onVerify={onVerify}
                onDelete={onDelete}
                onAssign={onAssign}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ScraperDashboard({ onLogout }) {
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [omniQuery, setOmniQuery] = useState('');
  const [correctedSearch, setCorrectedSearch] = useState(null);
  const [activeTab, setActiveTab] = useState('staging-phones');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [mapCenter, setMapCenter] = useState({ lat: 16.3067, lng: 80.4365 }); // Default: Guntur
  const [mapReady, setMapReady] = useState(false);
  const [mapQuery, setMapQuery] = useState('');
  const [mapSuggestions, setMapSuggestions] = useState([]);
  const [activeMapView, setActiveMapView] = useState('map'); // 'map' or 'list'

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const olaSdkRef = useRef(null); // Store OlaMaps SDK instance for creating markers

  useEffect(() => {
    fetchVendors();
    fetchEmployees();
    // Live vendor feed - poll every 3 seconds
    const poll = setInterval(() => fetchVendors(), 3000);
    return () => clearInterval(poll);
  }, []);

  // Initialize Ola Maps
  useEffect(() => {
    let isMounted = true;
    const initMap = async () => {
      // Wait for container to have dimensions
      await new Promise(r => setTimeout(r, 300));
      if (!mapRef.current || !isMounted) return;

      try {
        const { OlaMaps } = await import('olamaps-web-sdk');
        // Ensure container has explicit size before init
        mapRef.current.style.width = '100%';
        mapRef.current.style.height = '100%';
        mapRef.current.style.minHeight = '400px';

        const ola = new OlaMaps({ apiKey: OLA_API_KEY });
        olaSdkRef.current = ola;
        const map = ola.init({
          style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
          container: mapRef.current,
          center: [mapCenter.lng, mapCenter.lat],
          zoom: 12,
        });
        mapInstance.current = map;
        // Trigger resize after mount to fix blank map
        setTimeout(() => {
          try { map.resize(); } catch(_) {}
          setMapReady(true);
        }, 500);
      } catch (err) {
        console.error('Ola Maps init error:', err.message);
        setMapReady(false);
      }
    };
    initMap();
    return () => { isMounted = false; };
  }, []);

  // Place jumping vendor pins on map whenever vendors change
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !olaSdkRef.current) return;

    // Inject keyframe animation once
    if (!document.getElementById('pin-bounce-style')) {
      const style = document.createElement('style');
      style.id = 'pin-bounce-style';
      style.textContent = `@keyframes pin-bounce { from { transform: translateY(0px); } to { transform: translateY(-8px); } }`;
      document.head.appendChild(style);
    }

    // Clear existing markers
    markersRef.current.forEach(m => { try { m.remove(); } catch(_) {} });
    markersRef.current = [];

    const staged = vendors.filter(v => !v.pushed);
    staged.forEach((vendor, idx) => {
      const coordMatch = vendor.mapsLink?.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (!coordMatch) return;
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (isNaN(lat) || isNaN(lng)) return;

      const meta = getCategoryMeta(vendor.category);
      const delay = (idx % 5) * 0.15;

      // Create custom DOM element for the pin
      const el = document.createElement('div');
      el.style.cssText = `width:30px;height:36px;cursor:pointer;animation:pin-bounce 0.7s ${delay}s ease-in-out infinite alternate;`;
      el.innerHTML = `<svg viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="36">
        <path d="M15 0C6.72 0 0 6.72 0 15c0 10.27 15 21 15 21s15-10.73 15-21C30 6.72 23.28 0 15 0z" fill="${meta.color}"/>
        <circle cx="15" cy="15" r="7" fill="white" opacity="0.92"/>
      </svg>`;

      el.title = vendor.name;

      try {
        // Use the stored SDK instance (no require)
        const marker = olaSdkRef.current.addMarker({ element: el, offset: [0, -18] })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);
        markersRef.current.push(marker);
      } catch (_) {
        // Fallback: just track the element
        markersRef.current.push({ remove: () => el.remove() });
      }
    });
  }, [vendors, mapReady]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/employees`);
      setEmployees(res.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${API_URL}/vendors`);
      setVendors(res.data);
    } catch (error) {
      console.error('Failed to fetch', error);
    }
  };

  const startScrape = async (e) => {
    e?.preventDefault();
    if (!omniQuery.trim()) return;
    setLoading(true);
    setCorrectedSearch(null);
    try {
      const res = await axios.post(`${API_URL}/scrape/omni`, { query: omniQuery, engine: 'google' });
      if (res.data.parsed.correctedQuery) setCorrectedSearch(res.data.parsed.correctedQuery);

      const interval = setInterval(fetchVendors, 2000);
      setTimeout(() => { clearInterval(interval); setLoading(false); }, 60000);
    } catch (error) {
      console.error(error);
      setLoading(false);
      if (error.response?.data?.error) alert(error.response.data.error);
    }
  };

  // Ola Maps location autocomplete
  const handleMapQueryChange = async (val) => {
    setMapQuery(val);
    if (val.length < 2) { setMapSuggestions([]); return; }
    try {
      const res = await axios.get(`https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(val)}&api_key=${OLA_API_KEY}`);
      setMapSuggestions(res.data.predictions?.slice(0, 5) || []);
    } catch (_) {}
  };

  const selectMapLocation = async (prediction) => {
    setMapQuery(prediction.description);
    setMapSuggestions([]);
    // Geocode the location
    try {
      const geo = await axios.get(`https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(prediction.description)}&api_key=${OLA_API_KEY}`);
      const loc = geo.data.geocodingResults?.[0]?.geometry?.location;
      if (loc && mapInstance.current) {
        mapInstance.current.flyTo({ center: [loc.lng, loc.lat], zoom: 13 });
        setMapCenter({ lat: loc.lat, lng: loc.lng });
      }
      // Auto-fill search box with category + location
      const cityName = prediction.description.split(',')[0];
      setOmniQuery(prev => prev.includes(' in ') ? `${prev.split(' in ')[0]} in ${cityName}` : `${prev || 'Vendors'} in ${cityName}`);
    } catch (_) {}
  };

  const handleVerify = async (id, currentData) => {
    try {
      await axios.put(`${API_URL}/vendors/${id}`, currentData);
      fetchVendors();
    } catch (error) { console.error(error); }
  };

  const handleAssign = async (id, employeeId) => {
    if (!employeeId) return;
    try {
      await axios.post(`${API_URL}/vendors/assign`, { vendorIds: [id], employeeId });
      fetchVendors();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/vendors/${id}`);
      fetchVendors();
    } catch (error) { console.error(error); }
  };

  const pushToProd = async () => {
    try {
      const res = await axios.post(`${API_URL}/vendors/push`);
      alert(`Successfully pushed ${res.data.pushed} vendors to Production!`);
      fetchVendors();
    } catch (_) { alert('Error pushing to production.'); }
  };

  const clearQueue = async () => {
    if (window.confirm('Clear all unverified vendors?')) {
      try {
        await axios.post(`${API_URL}/vendors/clear-unverified`);
        fetchVendors();
      } catch (_) {}
    }
  };

  const exportToCSV = async () => {
    const dataToExport = activeTab === 'staging-phones' ? stagingVendorsWithPhones : (activeTab === 'staging-nophones' ? stagingVendorsNoPhones : liveVendors);
    if (dataToExport.length === 0) return alert('No data to export');
    const groups = {};
    dataToExport.forEach(v => {
      const key = `${v.category.replace(/[^a-zA-Z0-9]/g, '_')}_${v.city.replace(/[^a-zA-Z0-9]/g, '_')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    });
    const zip = new JSZip();
    Object.keys(groups).forEach(key => {
      const csvData = Papa.unparse(groups[key].map(v => ({
        ID: v.id, Name: v.name, Category: v.category, City: v.city,
        Address: v.address, Phone: v.phone && v.phone.startsWith('+91') ? `'${v.phone}` : v.phone,
        Rating: v.rating, Email: v.email || '', Instagram: v.instagram || '',
        GoogleMapsLink: v.mapsLink || '', AssignedTo: v.assignedTo || 'Unassigned', CRMStatus: v.crmStatus || 'New'
      })));
      zip.file(`Export/${key}_leads.csv`, csvData);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `gomandap_${activeTab}_leads_${Date.now()}.zip`);
  };

  // Derived state
  const stagingVendors = vendors.filter(v => !v.pushed).reverse();
  const stagingVendorsWithPhones = stagingVendors.filter(v => v.phone && v.phone.length > 5 && !v.phone.includes('Requires'));
  const stagingVendorsNoPhones = stagingVendors.filter(v => !v.phone || v.phone.length <= 5 || v.phone.includes('Requires'));
  const liveVendors = vendors.filter(v => v.pushed).reverse();
  const verifiedCount = stagingVendors.filter(v => v.verified).length;

  const displayedVendors = activeTab === 'staging-phones' ? stagingVendorsWithPhones
    : activeTab === 'staging-nophones' ? stagingVendorsNoPhones : liveVendors;

  // Filter by text search and city
  const cities = ['All', ...new Set(displayedVendors.map(v => v.city).filter(Boolean))];
  const filteredVendors = displayedVendors.filter(v =>
    (selectedCity === 'All' || v.city === selectedCity) &&
    (v.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
     v.category?.toLowerCase().includes(searchFilter.toLowerCase()) ||
     v.city?.toLowerCase().includes(searchFilter.toLowerCase()) ||
     v.phone?.includes(searchFilter))
  );

  // Group by category
  const grouped = filteredVendors.reduce((acc, v) => {
    const key = v.category || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden relative flex flex-col"
      style={{ background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 50%, #050510 100%)' }}>

      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              <Globe size={18} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider leading-none">
                GOMANDAP <span style={{ color: '#3b82f6' }}>SEARCH</span>
              </h1>
              <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase mt-0.5">Scraper Intelligence</p>
            </div>
          </div>

          {/* Search Bar – full width center */}
          <form onSubmit={startScrape} className="flex-1 max-w-2xl relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={16} className={loading ? 'text-blue-500 animate-spin' : 'text-white/30 group-focus-within:text-blue-400 transition-colors'} />
            </div>
            <input
              type="text"
              value={omniQuery}
              onChange={(e) => setOmniQuery(e.target.value)}
              disabled={loading}
              placeholder="Search any vendor, city, category... (e.g. 'Photographers Guntur')"
              className="w-full py-2.5 pl-10 pr-28 text-sm text-white placeholder-white/25 focus:outline-none rounded-xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button
              type="submit"
              disabled={loading || !omniQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-4 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              {loading ? 'Scraping...' : 'Search'}
            </button>
            {/* Loading bar */}
            {loading && (
              <div className="absolute -bottom-0.5 left-0 w-full h-0.5 rounded-full overflow-hidden bg-white/5">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ animation: 'scrape-progress 1.5s ease-in-out infinite', width: '40%' }} />
              </div>
            )}
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {correctedSearch && (
              <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="text-xs text-yellow-400/80 hidden lg:block">
                → {correctedSearch}
              </motion.span>
            )}
            <button
              onClick={pushToProd}
              disabled={verifiedCount === 0}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: verifiedCount > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.08)' }}
            >
              <Send size={13} /> Push {verifiedCount > 0 ? `(${verifiedCount})` : ''} Live
            </button>
            <img src="https://ui-avatars.com/api/?name=Admin&background=1a1a2e&color=6366f1&size=40" className="w-9 h-9 rounded-xl border border-white/10" alt="Admin" />
            <button onClick={onLogout} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes scrape-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
        @keyframes pin-bounce { from { transform: translateY(0px); } to { transform: translateY(-8px); } }
      `}</style>

      {/* MAIN CONTENT: Split Panel */}
      <div className="flex flex-1 pt-16 h-screen overflow-hidden">

        {/* === LEFT PANEL: Ola Maps === */}
        <div className="w-[420px] shrink-0 flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Map Location Search */}
          <div className="p-4 relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
              <input
                type="text"
                value={mapQuery}
                onChange={e => handleMapQueryChange(e.target.value)}
                placeholder="Fly to any location..."
                className="w-full py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/25 rounded-xl focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <AnimatePresence>
              {mapSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-4 right-4 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-2xl"
                  style={{ background: 'rgba(15,15,30,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {mapSuggestions.map((s, i) => (
                    <button key={i} onClick={() => selectMapLocation(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group">
                      <MapPin size={12} className="text-blue-400/60 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">{s.structured_formatting?.main_text || s.description}</p>
                        <p className="text-xs text-white/30">{s.structured_formatting?.secondary_text || ''}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ola Map Container */}
          <div className="flex-1 relative overflow-hidden" style={{ minHeight: '400px' }}>
            <div 
              ref={mapRef} 
              id="scraper-ola-map" 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} 
            />
            {!mapReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{ background: 'rgba(5,5,16,0.9)' }}>
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Loading Map...</p>
              </div>
            )}

            {/* Map overlay stats */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
              <div className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-center">
                  <p className="text-lg font-black text-white">{stagingVendors.length}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Total Staged</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-green-400">{stagingVendorsWithPhones.length}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">With Phone</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-blue-400">{verifiedCount}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Verified</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-purple-400">{liveVendors.length}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT PANEL: Auto-Categorized Vendors === */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Tab Bar + Filters */}
          <div className="px-5 pt-4 pb-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1 mb-4">
              {[
                { id: 'staging-phones', label: 'Ready Leads', count: stagingVendorsWithPhones.length, color: '#3b82f6' },
                { id: 'staging-nophones', label: 'No Phone', count: stagingVendorsNoPhones.length, color: '#f59e0b' },
                { id: 'pushed', label: 'Live DB', count: liveVendors.length, color: '#10b981' },
                { id: 'employees', label: 'Team', count: employees.length, color: '#a855f7' },
                { id: 'settings', label: 'Settings', count: null, color: '#6b7280' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  style={{
                    background: activeTab === tab.id ? tab.color + '20' : 'transparent',
                    color: activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.35)',
                    border: activeTab === tab.id ? `1px solid ${tab.color}40` : '1px solid transparent'
                  }}>
                  {tab.label}
                  {tab.count !== null && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px]"
                      style={{ background: activeTab === tab.id ? tab.color + '30' : 'rgba(255,255,255,0.08)', color: 'inherit' }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">
                  <Download size={13} /> Export CSV
                </button>
                <button onClick={clearQueue} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 size={13} /> Clear
                </button>
              </div>
            </div>

            {/* Sub-filters */}
            {(activeTab === 'staging-phones' || activeTab === 'staging-nophones' || activeTab === 'pushed') && (
              <div className="flex items-center gap-3 pb-4">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Filter by name, category, city..."
                    className="w-full py-2 pl-9 pr-4 text-xs text-white placeholder-white/25 rounded-xl focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="py-2 px-3 rounded-xl text-xs text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {cities.map(c => <option key={c} value={c} style={{ background: '#0a0a1a' }}>{c}</option>)}
                </select>
                <button onClick={fetchVendors} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                  <RefreshCw size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Vendor List */}
          <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 className="text-lg font-bold mb-5">Admin Credentials</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.put(`${API_URL}/auth/admin`, { username: e.target.username.value, password: e.target.password.value });
                      alert('Credentials updated. Please log back in.');
                      onLogout();
                    } catch (_) { alert('Failed to update credentials'); }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-1.5">New Username</label>
                      <input name="username" type="text" className="w-full py-2.5 px-4 text-sm text-white rounded-xl focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-1.5">New Password</label>
                      <input name="password" type="password" className="w-full py-2.5 px-4 text-sm text-white rounded-xl focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} required />
                    </div>
                    <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                      Update Credentials
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'employees' && (
                <motion.div key="employees" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  {/* Add Employee Form */}
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Users size={15} /> Add Telecaller</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData();
                      formData.append('image', e.target.avatar.files[0]);
                      try {
                        const uploadRes = await axios.post(`${API_URL}/upload`, formData);
                        await axios.post(`${API_URL}/employees`, {
                          name: e.target.name.value, username: e.target.username.value,
                          password: e.target.password.value, location: e.target.location.value,
                          phone: e.target.phone.value, email: e.target.email.value, avatar: uploadRes.data.url
                        });
                        alert('Employee added!'); e.target.reset(); fetchEmployees();
                      } catch (_) { alert('Failed to create employee'); }
                    }} className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input name="avatar" type="file" accept="image/*" className="w-full py-2 px-3 text-xs text-white rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} required />
                      </div>
                      {[['name', 'Full Name', 'text'], ['location', 'Territory (e.g. Guntur)', 'text'],
                        ['phone', 'Phone Number', 'text'], ['email', 'Email Address', 'email'],
                        ['username', 'Username', 'text'], ['password', 'Password', 'password']].map(([name, ph, type]) => (
                        <input key={name} name={name} placeholder={ph} type={type} required
                          className="w-full py-2 px-3 text-xs text-white rounded-xl focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      ))}
                      <button type="submit" className="col-span-2 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                        Create Telecaller
                      </button>
                    </form>
                  </div>

                  {/* Employees Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {employees.map(emp => (
                      <div key={emp.id} className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <img src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}&background=1a1a2e&color=a855f7`}
                          alt="Avatar" className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">{emp.name}</h4>
                          <p className="text-xs text-white/40 truncate">{emp.location} Territory</p>
                          <p className="text-xs text-white/20 font-mono mt-0.5 truncate">{emp.username}</p>
                        </div>
                        <button onClick={async () => {
                          if (window.confirm('Delete?')) { await axios.delete(`${API_URL}/employees/${emp.id}`); fetchEmployees(); }
                        }} className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {(activeTab === 'staging-phones' || activeTab === 'staging-nophones' || activeTab === 'pushed') && (
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {filteredVendors.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Search size={24} className="text-white/20" />
                      </div>
                      <h3 className="text-lg font-bold text-white/30">No vendors found</h3>
                      <p className="text-sm text-white/20 mt-1">Search for something using the bar above.</p>
                    </div>
                  ) : (
                    <div>
                      {/* Group header */}
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                          {Object.keys(grouped).length} categories · {filteredVendors.length} vendors
                        </p>
                      </div>
                      {/* Category Groups */}
                      {Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map(([cat, vends]) => (
                        <CategoryGroup
                          key={cat}
                          category={cat}
                          vendors={vends}
                          employees={employees}
                          onVerify={handleVerify}
                          onDelete={handleDelete}
                          onAssign={handleAssign}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
