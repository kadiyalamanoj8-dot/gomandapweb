import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Check, Trash2, Send, Server, MapPin, Database, Activity, Search, AlertCircle, CheckCircle2, ChevronRight, LayoutDashboard, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import ApplePicker from './components/ApplePicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const CATEGORY_OPTIONS = [
  { value: "All Categories", label: "All Categories (Auto-Pilot)" },
  { value: "Banquet Halls", label: "Banquet Halls" },
  { value: "Kalyana Mandapams", label: "Kalyana Mandapams" },
  { value: "Open Lawns & Farmhouses", label: "Open Lawns & Farmhouses" },
  { value: "Resorts & Destination Venues", label: "Resorts & Destination Venues" },
  { value: "5-Star Hotels", label: "5-Star Hotels" },
  { value: "Party & Mini Halls", label: "Party & Mini Halls" },
  { value: "Temples & Ashrams", label: "Temples & Ashrams" },
  { value: "Wedding Photographers", label: "Wedding Photographers" },
  { value: "Candid Photographers", label: "Candid Photographers" },
  { value: "Pre-Wedding Shoots", label: "Pre-Wedding Shoots" },
  { value: "Cinematographers", label: "Cinematographers" },
  { value: "Drone Specialists", label: "Drone Specialists" },
  { value: "Instant Photo Booths", label: "Instant Photo Booths" },
  { value: "Decorators", label: "Decorators" },
  { value: "Caterers", label: "Caterers" },
  { value: "Makeup Artists", label: "Makeup Artists" },
  { value: "Mehndi Designers", label: "Mehndi Designers" },
  { value: "Wedding Clothes / Boutiques", label: "Wedding Clothes / Boutiques" },
  { value: "Jewelry Shops", label: "Jewelry Shops" },
  { value: "Wedding Cards & Invites", label: "Wedding Cards & Invites" },
  { value: "Cars & Buses (Travel)", label: "Cars & Buses (Travel)" },
  { value: "Astrologers / Pundits", label: "Astrologers / Pundits" },
  { value: "Honeymoon Packages", label: "Honeymoon Packages" },
  { value: "Event Planners", label: "Event Planners" }
];

const VIEW_FILTER_OPTIONS = [
  { value: "All Categories", label: "All Categories" },
  ...CATEGORY_OPTIONS.slice(1)
];

const ENGINE_OPTIONS = [
  { value: "google", label: "Google Maps (Free Scraper, No Key)" },
  { value: "weddingbazaar", label: "Wedding Bazaar (Bot)" },
  { value: "weddingwire", label: "WeddingWire India (Bot)" },
  { value: "mandap", label: "Mandap.com (Bot)" },
  { value: "justdial", label: "JustDial (Bot)" }
];

import { LogOut } from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Region Data State
  const [regionsData, setRegionsData] = useState({});
  const [districtsList, setDistrictsList] = useState([]);
  
  const [district, setDistrict] = useState('Guntur');
  const [mandal, setMandal] = useState('');
  const [category, setCategory] = useState('Banquet Halls');
  const [engine, setEngine] = useState('google');
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);
  
  // Omni Search State
  const [omniQuery, setOmniQuery] = useState('');
  
  // UI Filter State
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [activeTab, setActiveTab] = useState('staging-phones'); // staging-phones, staging-nophones, pushed

  useEffect(() => {
    fetchVendors();
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await axios.get(`${API_URL}/regions`);
      setRegionsData(res.data);
      setDistrictsList(Object.keys(res.data).sort());
    } catch (error) {
      console.error("Failed to fetch regions", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${API_URL}/vendors`);
      setVendors(res.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    }
  };

  const startScrape = async () => {
    setLoading(true);
    try {
      if (isAutoPilot) {
        if(!district) return setLoading(false);
        await axios.post(`${API_URL}/scrape/batch`, { district, category, mandal, engine });
      } else {
        if(!omniQuery) return setLoading(false);
        await axios.post(`${API_URL}/scrape/omni`, { query: omniQuery, engine });
      }
      
      const interval = setInterval(async () => {
        await fetchVendors();
        if (isAutoPilot) {
          const statusRes = await axios.get(`${API_URL}/scrape/batch/status`);
          setBatchProgress(statusRes.data);
          if (!statusRes.data.isActive) {
            clearInterval(interval);
            setLoading(false);
          }
        }
      }, 3000);
      
      if (!isAutoPilot) {
        setTimeout(() => {
          clearInterval(interval);
          setLoading(false);
        }, 15000);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    }
  };

  const stopAutoPilot = async () => {
    try {
      await axios.post(`${API_URL}/scrape/batch/stop`);
      setLoading(false);
      if (batchProgress) {
        setBatchProgress({ ...batchProgress, isActive: false, currentTask: 'Stopped by User' });
      }
    } catch (error) {
      console.error("Failed to stop auto-pilot", error);
    }
  };

  const handleVerify = async (id, currentData) => {
    try {
      await axios.put(`${API_URL}/vendors/${id}`, currentData);
      fetchVendors();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/vendors/${id}`);
      fetchVendors();
    } catch (error) {
      console.error(error);
    }
  };

  const pushToProd = async () => {
    try {
      const res = await axios.post(`${API_URL}/vendors/push`);
      alert(`Successfully pushed ${res.data.pushed} vendors to Gomandap Production!`);
      fetchVendors();
    } catch (error) {
      alert('Error pushing to production.');
    }
  };

  const clearQueue = async () => {
    if (window.confirm('Are you sure you want to clear all unverified vendors from the queue?')) {
      try {
        await axios.post(`${API_URL}/vendors/clear-unverified`);
        fetchVendors();
      } catch (e) {
        console.error('Failed to clear queue', e);
      }
    }
  };

  const exportToCSV = () => {
    let dataToExport = [];
    if (activeTab === 'staging-phones') dataToExport = stagingVendorsWithPhones;
    else if (activeTab === 'staging-nophones') dataToExport = stagingVendorsNoPhones;
    else dataToExport = liveVendors;

    if (dataToExport.length === 0) return alert("No data to export");
    
    const csv = Papa.unparse(dataToExport.map(v => ({
      ID: v.id,
      Name: v.name,
      Category: v.category,
      City: v.city,
      Pincode: v.pincode || '',
      Address: v.address,
      Phone: v.phone,
      Rating: v.rating,
      GoogleMapsLink: v.mapsLink || '',
      Source: v.source,
      Verified: v.verified ? 'Yes' : 'No',
      PushedToLive: v.pushed ? 'Yes' : 'No'
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gomandap_${activeTab}_leads_${Date.now()}.csv`;
    link.click();
  };

  const stagingVendors = vendors.filter(v => !v.pushed).reverse();
  const stagingVendorsWithPhones = stagingVendors.filter(v => v.phone && v.phone.length > 5 && !v.phone.includes('Requires'));
  const stagingVendorsNoPhones = stagingVendors.filter(v => !v.phone || v.phone.length <= 5 || v.phone.includes('Requires'));
  const liveVendors = vendors.filter(v => v.pushed).reverse();
  const verifiedCount = stagingVendors.filter(v => v.verified).length;

  let activeList = [];
  if (activeTab === 'staging-phones') activeList = stagingVendorsWithPhones;
  else if (activeTab === 'staging-nophones') activeList = stagingVendorsNoPhones;
  else activeList = liveVendors;

  const displayedVendors = activeList.filter(v => 
    (filterCategory === 'All Categories' || v.category === filterCategory)
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37]/30">
      
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8C7323] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Server className="text-black" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide">GOMANDAP <span className="text-[#D4AF37] font-normal tracking-wider">ENGINE</span></h1>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Data Pipeline & Scraper</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-bold text-white/50">
              <div className="flex items-center gap-2"><Database size={16}/> {vendors.length} Total Leads</div>
              <div className="flex items-center gap-2 text-green-400"><CheckCircle2 size={16}/> {liveVendors.length} Live</div>
            </div>
            <button 
              onClick={pushToProd}
              disabled={verifiedCount === 0}
              className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm flex items-center gap-2 hover:bg-[#D4AF37] transition-all disabled:opacity-50 disabled:hover:bg-white shadow-lg shadow-white/10"
            >
              <Send size={16} /> Push ({verifiedCount}) to Live
            </button>
            <button onClick={onLogout} className="text-white/50 hover:text-red-400 p-2">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Engine Controls */}
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[50px]"></div>
            
            <h2 className="text-lg font-black mb-6 flex items-center gap-2"><Search className="text-[#D4AF37]" size={20}/> Target Locator</h2>
            
            <div className="space-y-5 relative z-10 overflow-visible">
              {/* Mode Toggle */}
              <div className="flex bg-black/50 border border-white/10 rounded-xl p-1 mb-2">
                <button 
                  onClick={() => setIsAutoPilot(false)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isAutoPilot ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/50 hover:text-white'}`}
                >
                  Omni Search (Smart)
                </button>
                <button 
                  onClick={() => setIsAutoPilot(true)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isAutoPilot ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/50 hover:text-white'}`}
                >
                  Auto-Pilot 🚀
                </button>
              </div>

              {!isAutoPilot ? (
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Natural Language Search</label>
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      type="text"
                      value={omniQuery}
                      onChange={(e) => setOmniQuery(e.target.value)}
                      placeholder="e.g. Banquet Halls in Hyderabad"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="text-[10px] text-white/40 mt-2">✨ Powered by NLP Spell Correction</div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Category</label>
                    <ApplePicker
                      value={category}
                      onChange={setCategory}
                      options={CATEGORY_OPTIONS}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* District Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">District</label>
                      <ApplePicker
                        value={district}
                        onChange={val => {
                          setDistrict(val);
                          setMandal('All Mandals');
                        }}
                        options={districtsList.map(d => ({ value: d, label: d }))}
                        icon={MapPin}
                        className="w-full"
                      />
                    </div>

                    {/* Mandal Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Mandal / Area</label>
                      <ApplePicker
                        value={mandal}
                        onChange={setMandal}
                        options={[
                          { value: "All Mandals", label: "All Mandals (Auto-Pilot)" },
                          ...(regionsData[district]?.sort().map(m => ({ value: m, label: m })) || [])
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="mt-4">
              
              <div className="grid grid-cols-2 gap-4">
                {/* District Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Scraper Engine</label>
                  <ApplePicker
                    value={engine}
                    onChange={setEngine}
                    options={ENGINE_OPTIONS}
                    className="w-full mb-4"
                  />
                  {engine !== 'google' && (
                    <div className="text-[10px] text-yellow-500/80 font-bold bg-yellow-500/10 p-2 rounded-lg flex items-start gap-1 mb-4">
                      <AlertCircle size={12} className="shrink-0 mt-0.5"/>
                      Warning: Competitor bots run extremely slow to evade security. Phone numbers are rarely extracted.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startScrape}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#8C7323] text-black font-black p-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 shadow-[0_10px_20px_rgba(212,175,55,0.2)] transition-all"
                >
                  {loading ? (
                    <><Activity size={20} className="animate-spin" /> {isAutoPilot ? 'Auto-Pilot Running...' : 'Scraping Web...'}</>
                  ) : (
                    <><Play size={20} /> {isAutoPilot ? 'Initialize Auto-Pilot' : 'Initialize Scraper'}</>
                  )}
                </motion.button>

                {loading && (batchProgress?.isActive || isAutoPilot) && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopAutoPilot}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 font-bold p-4 rounded-xl flex justify-center items-center px-6 transition-all"
                    title="Stop Auto-Pilot"
                  >
                    Stop
                  </motion.button>
                )}
              </div>

              {/* Progress Bar for AutoPilot */}
              {(batchProgress?.isActive || (isAutoPilot && loading)) && batchProgress && (
                <div className="mt-4 p-4 bg-black/40 border border-[#D4AF37]/20 rounded-xl">
                  <div className="flex justify-between text-xs font-bold text-white/70 mb-2">
                    <span>Progress: {batchProgress.completed} / {batchProgress.total}</span>
                    <span>{Math.round((batchProgress.completed / Math.max(batchProgress.total, 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-[#D4AF37] h-2 rounded-full transition-all duration-500" style={{ width: `${(batchProgress.completed / Math.max(batchProgress.total, 1)) * 100}%` }}></div>
                  </div>
                  <div className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold truncate">
                    {batchProgress.currentTask}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6">Pipeline Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/50 border border-white/5 p-4 rounded-2xl">
                <div className="text-3xl font-black text-white mb-1">{stagingVendors.length}</div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider">In Staging</div>
              </div>
              <div className="bg-black/50 border border-white/5 p-4 rounded-2xl">
                <div className="text-3xl font-black text-[#D4AF37] mb-1">{verifiedCount}</div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Verified</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Pipeline */}
        <div className="lg:col-span-8 space-y-6">
            
            <div className="flex justify-between items-center bg-[#111] p-6 rounded-3xl border border-white/5">
              <div>
                <h2 className="text-2xl font-black text-white">Staging Queue</h2>
                <p className="text-white/50 text-sm mt-1">Review, verify, and clean extracted data.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={clearQueue}
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  <Trash2 size={18} /> Clear Queue
                </button>
                <button 
                  onClick={exportToCSV}
                  className="px-6 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-500 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  <Download size={18} /> Export to Excel (.csv)
                </button>
              </div>
            </div>

            {/* Tabs & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <button 
                  onClick={() => setActiveTab('staging-phones')}
                  className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'staging-phones' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-white/50 hover:text-white'}`}
                >
                  <LayoutDashboard size={18}/> Ready (Has Phone)
                  <span className={`${activeTab === 'staging-phones' ? 'bg-green-500/30 text-green-400' : 'bg-white/10 text-white'} text-[10px] px-2 py-0.5 rounded-full ml-1`}>{stagingVendorsWithPhones.length}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('staging-nophones')}
                  className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'staging-nophones' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-white/50 hover:text-white'}`}
                >
                  <AlertCircle size={18}/> Requires Lookup
                  <span className={`${activeTab === 'staging-nophones' ? 'bg-yellow-500/30 text-yellow-400' : 'bg-white/10 text-white'} text-[10px] px-2 py-0.5 rounded-full ml-1`}>{stagingVendorsNoPhones.length}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('pushed')}
                  className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'pushed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-white/50 hover:text-white'}`}
                >
                  <Database size={18}/> Live Database
                  <span className={`${activeTab === 'pushed' ? 'bg-blue-500/30 text-blue-400' : 'bg-white/10 text-white'} text-[10px] px-2 py-0.5 rounded-full ml-1`}>{liveVendors.length}</span>
                </button>
              </div>

              {/* View Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white/50">View:</span>
                <ApplePicker
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={VIEW_FILTER_OPTIONS}
                  className="w-64"
                  buttonClassName="px-3 py-1.5 text-sm rounded-lg"
                />
              </div>
            </div>
            {/* List */}
            <div className="space-y-4">
              <AnimatePresence>
                {displayedVendors.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]"
                  >
                    <AlertCircle size={48} className="text-white/20 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Queue is Empty</h3>
                    <p className="text-white/50 font-medium">Run a new scraping job to populate this list.</p>
                  </motion.div>
                ) : (
                  displayedVendors.map(vendor => (
                  <motion.div 
                    key={vendor.id} 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-5 rounded-2xl border transition-all ${vendor.verified ? 'bg-[#D4AF37]/5 border-[#D4AF37]/30' : 'bg-[#111] border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black text-white">{vendor.name}</h3>
                          {vendor.verified && !vendor.pushed && <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-sm border border-green-500/30 font-black uppercase tracking-widest">Verified</span>}
                          {vendor.pushed && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-sm border border-blue-500/30 font-black uppercase tracking-widest">Live</span>}
                        </div>
                        
                        <div className="flex items-center gap-2 text-white/50 text-sm font-medium mb-3">
                          <MapPin size={14}/> {vendor.address}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs font-bold">
                          <span className="bg-white/5 px-2.5 py-1 rounded-md text-white/70">{vendor.category}</span>
                          <span className="bg-white/5 px-2.5 py-1 rounded-md text-white/70">Ph: {vendor.phone}</span>
                          {vendor.pincode && <span className="bg-white/5 px-2.5 py-1 rounded-md text-[#D4AF37]">PIN: {vendor.pincode}</span>}
                          {vendor.mapsLink && (
                            <a href={vendor.mapsLink} target="_blank" rel="noopener noreferrer" className="bg-[#1a4a2b] hover:bg-[#206138] transition-colors text-green-400 px-2.5 py-1 rounded-md border border-green-500/30 flex items-center gap-1">
                              📍 Maps
                            </a>
                          )}
                          <span className="bg-white/5 px-2.5 py-1 rounded-md text-white/40">ID: {vendor.id.slice(-6)}</span>
                        </div>
                      </div>
                      
                      {!vendor.pushed && (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <button 
                            onClick={() => handleVerify(vendor.id, vendor)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${vendor.verified ? 'bg-green-500/20 text-green-500 cursor-default' : 'bg-white/5 text-white hover:bg-green-500 hover:text-black'}`}
                          >
                            <Check size={18} /> {vendor.verified ? 'Verified' : 'Verify'}
                          </button>
                          <button 
                            onClick={() => handleDelete(vendor.id)}
                            className="p-3 rounded-xl bg-white/5 hover:bg-red-500 hover:text-white text-white/50 transition-all"
                            title="Discard Lead"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}

                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}

