import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, Check, Trash2, Send, MapPin, Database, Search, CheckCircle2, Download, Globe, Users, LogOut, Filter, RefreshCw, Phone, Mail, Link2, Star, Clock, ExternalLink, ChevronDown, ChevronRight, Building2, Camera, Music, Utensils, Flower2, Zap, FolderOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#000', height: '100vh', overflow: 'auto' }}>
          <h2>Something went wrong in ScraperDashboard.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}

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
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm leading-tight truncate">{vendor.name}</h3>
                  {vendor.tier === 'Premium' && (
                    <span className="text-[10px] uppercase font-black bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: meta.bg, color: meta.color }}>
                    {vendor.category}
                  </span>
                  <span className="text-xs text-white/40 truncate">{vendor.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {vendor.qualityScore > 0 && (
                <div className="flex flex-col items-end mr-1">
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest leading-none mb-0.5">Score</span>
                  <span className={`text-xs font-black leading-none ${vendor.qualityScore >= 80 ? 'text-yellow-400' : vendor.qualityScore >= 50 ? 'text-blue-400' : 'text-gray-400'}`}>
                    {vendor.qualityScore}
                  </span>
                </div>
              )}
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
                className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/20">
                <Phone size={10} /> {vendor.phone}
              </a>
            )}
            {vendor.website && (
              <a href={vendor.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                <Link2 size={10} /> Website
              </a>
            )}
            {vendor.email && (
              <a href={`mailto:${vendor.email}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                <Mail size={10} /> {vendor.email}
              </a>
            )}
            {vendor.instagram && (
              <a href={vendor.instagram} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs bg-pink-500/10 text-pink-400 px-2 py-1 rounded-lg hover:bg-pink-500/20 transition-colors border border-pink-500/20">
                <Link2 size={10} /> Insta
              </a>
            )}
            {vendor.facebook && (
              <a href={vendor.facebook} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs bg-blue-600/10 text-blue-500 px-2 py-1 rounded-lg hover:bg-blue-600/20 transition-colors border border-blue-600/20">
                <Link2 size={10} /> FB
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

// Hacker Cyber Background Component
function CyberBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[#020205]" />
      
      {/* Cyber Grid SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cyber-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ff" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1.5" fill="#0ff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-grid)" />
      </svg>

      {/* Moving Data Paths (stroke-dasharray animation) */}
      <svg className="absolute inset-0 w-full h-full opacity-50" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 120 L 240 120 L 300 180 L 800 180 L 860 240 L 1200 240" fill="none" stroke="#0ff" strokeWidth="1" strokeDasharray="100 1000" style={{ animation: 'dash 8s linear infinite' }} />
        <path d="M 100 600 L 300 600 L 400 500 L 900 500 L 1000 400 L 1400 400" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="150 1200" style={{ animation: 'dash 12s linear infinite reverse' }} />
        <path d="M 1200 800 L 1000 800 L 900 700 L 400 700 L 300 600 L 0 600" fill="none" stroke="#0ff" strokeWidth="1" strokeDasharray="80 800" style={{ animation: 'dash 10s linear infinite' }} />
        <path d="M 0 300 L 150 300 L 200 250 L 500 250 L 550 200" fill="none" stroke="#0ff" strokeWidth="1" strokeDasharray="40 500" style={{ animation: 'dash 6s linear infinite' }} />
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, #020205 100%)', opacity: 0.8 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020205]" />
    </div>
  );
}

// Animated SVG Logo Component
function AnimatedLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 100" className="group-hover:scale-110 transition-transform duration-500">
      {/* Central Core */}
      <circle cx="50" cy="50" r="15" fill="none" stroke="#0ff" strokeWidth="4" className="animate-pulse" />
      <circle cx="50" cy="50" r="6" fill="#0ff" />
      
      {/* Orbit 1 */}
      <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="#0ff" strokeWidth="2" strokeDasharray="40 10" style={{ animation: 'spin-slow 8s linear infinite', transformOrigin: 'center' }} />
      
      {/* Orbit 2 */}
      <ellipse cx="50" cy="50" rx="15" ry="40" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="20 20" style={{ animation: 'spin-slow 6s linear infinite reverse', transformOrigin: 'center' }} />
    </svg>
  );
}

// Folder Card Component (Animated)
function FolderCard({ category, vendors, onClick, onExport, isActive, onSettingsClick }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  const count = vendors.length;

  const prevCountRef = useRef(count);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setJustAdded(true);
      const timer = setTimeout(() => setJustAdded(false), 1000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.96 }}
      animate={justAdded ? { scale: [1, 1.05, 1], rotate: [0, -1, 1, 0] } : isActive ? { y: [-2, 2, -2] } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25, duration: isActive ? 2 : 0.5, repeat: isActive ? Infinity : 0 }}
      className="relative cursor-pointer group"
    >
      {/* Gear Icon for Cron settings */}
      <div 
        onClick={(e) => { e.stopPropagation(); onSettingsClick(category); }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-white/20 text-white/50 hover:text-white z-20 transition-all opacity-0 group-hover:opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      </div>

      {/* Folder Back SVG/Shape */}
      <div className="absolute inset-0 rounded-2xl transition-all duration-300 overflow-hidden" 
        onClick={() => onClick(category)}
        style={{ background: meta.bg, border: `1px solid ${meta.color}40`, boxShadow: justAdded || isActive ? `0 0 30px ${meta.color}80` : `0 4px 20px -10px ${meta.color}` }}>
        
        {/* Active Extraction Scanner Line */}
        {isActive && (
          <motion.div 
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] blur-[1px] w-full pointer-events-none"
            style={{ background: meta.color, boxShadow: `0 0 10px 2px ${meta.color}` }}
          />
        )}
      </div>
      
      <div className="relative p-4 h-32 flex flex-col justify-between overflow-hidden" onClick={() => onClick(category)}>
        <div className="flex justify-between items-start">
          <div className="p-2.5 rounded-xl" style={{ background: `${meta.color}25` }}>
            <FolderOpen size={22} style={{ color: meta.color }} />
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onExport(category, vendors); }}
            className="p-2 rounded-xl bg-black/40 hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            title={`Download ${category} CSV`}
          >
            <Download size={14} style={{ color: meta.color }} />
          </button>
        </div>
        
        <div>
          <h3 className="font-bold text-white text-sm truncate">{category}</h3>
          <p className="text-xs mt-0.5 font-bold tracking-wide" style={{ color: meta.color }}>
            {count} LEADS
          </p>
        </div>

        {/* Removed internal packets in favor of global DataSwarm */}
      </div>
    </motion.div>
  );
}

function ScraperDashboard({ onLogout }) {
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [omniQuery, setOmniQuery] = useState('');
  const [correctedSearch, setCorrectedSearch] = useState(null);
  const [activeTab, setActiveTab] = useState('staging-phones');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [knowledge, setKnowledge] = useState({ categories: [], locations: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Cyber Terminal Logs
  const [logs, setLogs] = useState([
    `[SYSTEM] Data Intelligence Core Initialized`,
    `[SYSTEM] Background Scheduler Ready`,
    `[SYSTEM] Awaiting Scrape Commands...`
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [radius, setRadius] = useState(0);
  const [searchRadius, setSearchRadius] = useState(0);
  
  // Job Manager state
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedJobCategory, setSelectedJobCategory] = useState(null);

  const folderRefs = useRef({});
  const prevVendorsCount = useRef(0);
  const terminalRef = useRef(null);
  
  // Ref for Fuse.js instance
  const fuseRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Terminal Logging Logic
  useEffect(() => {
    if (vendors.length > prevVendorsCount.current) {
      const newVendors = vendors.slice(0, vendors.length - prevVendorsCount.current);
      const newLogs = newVendors.map(v => `> [DATA] Extracted: ${v.name} | ${v.category} | ${v.city}`);
      setLogs(prev => [...prev, ...newLogs].slice(-100)); // Keep last 100 logs
    }
    prevVendorsCount.current = vendors.length;
  }, [vendors]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    fetchVendors();
    fetchEmployees();
    fetchKnowledge();
    // Live vendor feed - poll every 3 seconds
    const poll = setInterval(() => fetchVendors(), 3000);
    return () => clearInterval(poll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchKnowledge = async () => {
    try {
      const res = await axios.get(`${API_URL}/knowledge`);
      setKnowledge(res.data);
      
      const docs = [];
      let idCounter = 0;
      res.data.categories.forEach(c => docs.push({ id: idCounter++, text: c, type: 'category' }));
      res.data.locations.forEach(l => docs.push({ id: idCounter++, text: l.name, type: 'location' }));
      
      const fuse = new Fuse(docs, {
        keys: ['text'],
        includeScore: true,
        threshold: 0.4, // Allow heavy typos
        distance: 100
      });
      fuseRef.current = fuse;
    } catch (e) { console.error('Failed to fetch knowledge base', e); }
  };



  const handleSearchChange = (val) => {
    setOmniQuery(val);
    if (val.trim().length < 2 || !fuseRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Split at " in " to autocomplete location vs category
    let searchVal = val;
    let isLocationSearch = false;
    let prefix = '';
    
    if (val.toLowerCase().includes(' in ')) {
      isLocationSearch = true;
      const parts = val.split(/ in /i);
      searchVal = parts[1].trim();
      prefix = val.substring(0, val.toLowerCase().indexOf(' in ') + 4);
    }

    if (!searchVal) { setSuggestions([]); return; }

    const results = fuseRef.current.search(searchVal);
    const items = results.map(r => r.item);
    
    // Filter results based on context
    let filtered = items;
    if (isLocationSearch) {
      filtered = items.filter(r => r.type === 'location');
    }

    // Take top 5
    const topSuggestions = filtered.slice(0, 5).map(r => isLocationSearch ? prefix + r.text : r.text);
    
    // If we're not in location search, also suggest adding " in " for top category matches
    if (!isLocationSearch && filtered.length > 0 && filtered[0].type === 'category') {
       topSuggestions.push(`${filtered[0].text} in `);
    }

    setSuggestions([...new Set(topSuggestions)]);
    setShowSuggestions(topSuggestions.length > 0);
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/employees`);
      setEmployees(res.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/scrape/jobs`);
      setActiveJobs(res.data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${API_URL}/vendors`);
      setVendors(res.data);
    } catch (error) {
      console.error('Failed to fetch vendors', error);
    }
  };

  // Poll jobs
  useEffect(() => {
    const intv = setInterval(fetchJobs, 5000);
    return () => clearInterval(intv);
  }, []);

  const handleMasterStop = async () => {
    try {
      await axios.post(`${API_URL}/scrape/jobs/stop-all`);
      toast.success('Master Stop Executed. All automated tasks terminated.');
      fetchJobs();
      setLogs(prev => [...prev, `> [SYSTEM] MASTER STOP: All background extractions terminated.`]);
    } catch (error) {
      toast.error('Failed to stop all tasks');
    }
  };

  const handleUpdateJob = async (category, action, intervalMs) => {
    try {
      await axios.post(`${API_URL}/scrape/jobs/update`, { category, action, intervalMs });
      toast.success(`Job for ${category} updated successfully.`);
      fetchJobs();
      setSelectedJobCategory(null);
      setLogs(prev => [...prev, `> [SYSTEM] JOB UPDATE: ${category} -> ${action} (${intervalMs ? intervalMs/60000 + ' min' : ''})`]);
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target.result;
      const rows = csv.split('\n').map(r => r.split(','));
      // Assume Header: Category, Location
      const tasks = [];
      for (let i = 1; i < rows.length; i++) {
        const cat = rows[i][0]?.trim();
        const loc = rows[i][1]?.trim();
        if (cat && loc) tasks.push({ category: cat, location: loc });
      }
      
      if (tasks.length > 0) {
        try {
          await axios.post(`${API_URL}/scrape/upload`, { tasks });
          toast.success(`Uploaded ${tasks.length} bulk tasks to queue!`);
          setLogs(prev => [...prev, `> [SYSTEM] BULK CSV: Ingested ${tasks.length} tasks into deep execution queue.`]);
        } catch (e) {
          toast.error('Upload failed');
        }
      }
    };
    reader.readAsText(file);
  };

  const startScrape = async (e) => {
    e?.preventDefault();
    if (!omniQuery.trim()) return;
    
    // Parse target category to pre-emptively render the folder
    let parsedCat = omniQuery;
    if (omniQuery.toLowerCase().includes(' in ')) parsedCat = omniQuery.split(/ in /i)[0].trim();
    setActiveCategory(parsedCat);

    setLogs(prev => [...prev, `> [CRON] Registering active 10-minute automated scrape for: ${omniQuery} (Radius: ${radius}km)`]);

    setLoading(true);
    setCorrectedSearch(null);
    try {
      const res = await axios.post(`${API_URL}/scrape/omni`, { query: omniQuery, engine: 'google', radius });
      if (res.data.parsed.correctedQuery) setCorrectedSearch(res.data.parsed.correctedQuery);

      const interval = setInterval(fetchVendors, 2000);
      setTimeout(() => { clearInterval(interval); setLoading(false); }, 60000);
    } catch (error) {
      console.error(error);
      setLoading(false);
      if (error.response?.data?.error) toast.error(error.response.data.error);
    }
  };



  const handleVerify = async (id, currentData) => {
    try {
      await axios.put(`${API_URL}/vendors/${id}`, currentData);
      fetchVendors();
      toast.success('Vendor verified!');
    } catch (error) { 
      console.error(error); 
      toast.error('Verification failed');
    }
  };

  const handleAssign = async (id, employeeId) => {
    if (!employeeId) return;
    try {
      await axios.post(`${API_URL}/vendors/assign`, { vendorIds: [id], employeeId });
      fetchVendors();
      toast.success('Assigned to telecaller!');
    } catch (error) { 
      console.error(error); 
      toast.error('Assignment failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/vendors/${id}`);
      fetchVendors();
      toast.success('Vendor deleted');
    } catch (error) { 
      console.error(error); 
      toast.error('Delete failed');
    }
  };

  const pushToProd = async () => {
    try {
      const res = await axios.post(`${API_URL}/vendors/push`);
      toast.success(`Pushed ${res.data.pushed} vendors to Production!`);
      fetchVendors();
    } catch (_) { toast.error('Error pushing to production.'); }
  };

  const clearQueue = async () => {
    if (window.confirm('Clear all unverified vendors?')) {
      try {
        await axios.post(`${API_URL}/vendors/clear-unverified`);
        fetchVendors();
        toast.success('Queue cleared');
      } catch (_) {
        toast.error('Failed to clear queue');
      }
    }
  };

  const exportToCSV = async () => {
    const dataToExport = activeTab === 'staging-phones' ? stagingVendorsWithPhones : (activeTab === 'staging-nophones' ? stagingVendorsNoPhones : liveVendors);
    if (dataToExport.length === 0) return toast.error('No data to export');
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
    toast.success('Export downloaded!');
  };

  const exportCategoryCSV = (categoryName, catVendors) => {
    if (!catVendors || catVendors.length === 0) return toast.error('No data in this folder');
    const csvData = Papa.unparse(catVendors.map(v => ({
      ID: v.id, Name: v.name, Category: v.category, City: v.city,
      Address: v.address, Phone: v.phone && v.phone.startsWith('+91') ? `'${v.phone}` : v.phone,
      Rating: v.rating, Email: v.email || '', Instagram: v.instagram || '',
      GoogleMapsLink: v.mapsLink || '', AssignedTo: v.assignedTo || 'Unassigned', CRMStatus: v.crmStatus || 'New'
    })));
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `gomandap_${categoryName.replace(/[^a-zA-Z0-9]/g, '_')}_leads.csv`);
    toast.success(`${categoryName} CSV downloaded!`);
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

  // Pre-emptive Target Folder creation
  if (activeCategory && !grouped[activeCategory]) {
    grouped[activeCategory] = [];
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden relative flex flex-col bg-[#020205]">
      <CyberBackground />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,255,255,0.1)', background: 'rgba(2,2,5,0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3 group cursor-pointer">
          <AnimatedLogo />
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0ff] to-[#a855f7] tracking-wider">
              GOMANDAP SEARCH
            </h1>
            <p className="text-[10px] text-[#0ff]/50 font-mono tracking-[0.2em] uppercase">Data Intelligence Core</p>
          </div>
        </div>

          {/* Search Bar – full width center */}
          <form onSubmit={startScrape} className="flex-1 max-w-2xl relative group" ref={searchContainerRef}>
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={16} className={loading ? 'text-blue-500 animate-spin' : 'text-white/30 group-focus-within:text-blue-400 transition-colors'} />
            </div>
            <input
              type="text"
              value={omniQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              disabled={loading}
              placeholder="Search any vendor, city, category... (e.g. 'Photographers in Guntur')"
              className="w-full py-2.5 pl-10 pr-28 text-sm text-white placeholder-white/25 focus:outline-none rounded-xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderBottomLeftRadius: showSuggestions ? '0px' : '12px',
                borderBottomRightRadius: showSuggestions ? '0px' : '12px',
                borderColor: showSuggestions ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'
              }}
            />
            <button
              type="submit"
              disabled={loading || !omniQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-4 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              {loading ? 'Scraping...' : 'Search'}
            </button>
            
            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 top-full mt-0 overflow-hidden shadow-2xl z-50 rounded-b-xl"
                  style={{ background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(59,130,246,0.5)', borderTop: 'none', backdropFilter: 'blur(20px)' }}
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setOmniQuery(s);
                        setShowSuggestions(false);
                        if (s.endsWith(' in ')) document.querySelector('input[placeholder*="Search any vendor"]').focus();
                      }}
                      className="w-full text-left px-10 py-2.5 text-sm text-white/80 hover:text-white hover:bg-blue-500/10 transition-colors flex items-center gap-2"
                    >
                      <Search size={12} className="text-white/20" />
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Advanced Animated Loading Tech Strip */}
            {loading && (
              <div className="absolute -bottom-1 left-0 w-full h-1 overflow-hidden bg-white/5 rounded-b-xl">
                <div className="h-full w-full opacity-80"
                  style={{ 
                    backgroundImage: 'repeating-linear-gradient(-45deg, rgba(59,130,246,1), rgba(59,130,246,1) 8px, rgba(6,182,212,1) 8px, rgba(6,182,212,1) 16px)',
                    backgroundSize: '22.6px 22.6px',
                    animation: 'tech-strip 1s linear infinite' 
                  }} 
                />
              </div>
            )}
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={handleMasterStop}
              className="bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-1.5 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              <X size={14} /> MASTER STOP
            </button>

            {correctedSearch && (
              <div className="bg-[#a855f7]/20 border border-[#a855f7]/50 text-[#a855f7] px-4 py-1.5 rounded-lg text-sm font-bold animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-2">
                <Check size={14} /> Corrected to: {correctedSearch}
              </div>
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
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-100px) translateX(50px); } }
        @keyframes tech-strip { 100% { background-position: 22.6px 0; } }
        @keyframes pin-bounce { from { transform: translateY(0px); } to { transform: translateY(-8px); } }
        @keyframes dash { to { stroke-dashoffset: -2000; } }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* MAIN CONTENT: Split Panel */}
      <div className="flex flex-1 pt-16 h-screen overflow-hidden">

        {/* === MAIN PANEL: Full Screen Vendors === */}
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

          {/* Cyberpunk Data Terminal Overlay (Background) */}
          <div className="absolute inset-0 pointer-events-none z-0 p-8 flex flex-col justify-end overflow-hidden" style={{ opacity: 0.15 }}>
            <div ref={terminalRef} className="w-full h-3/4 overflow-y-hidden flex flex-col justify-end font-mono text-sm leading-tight" style={{ maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)' }}>
              {logs.map((log, i) => (
                <div key={i} className="text-[#0f0]">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Vendor List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <h3 className="text-lg font-bold mb-5">Admin Credentials</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await axios.put(`${API_URL}/auth/admin`, { username: e.target.username.value, password: e.target.password.value });
                        toast.success('Credentials updated. Please log back in.');
                        onLogout();
                      } catch (_) { toast.error('Failed to update credentials'); }
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
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-5">Advanced Parameters</h3>
                    <label className="block text-xs font-bold text-white/40 mb-1.5">Scraping Radius (km) - Setting to 0 uses literal search</label>
                    <input type="range" min="0" max="100" value={searchRadius} onChange={(e) => setSearchRadius(e.target.value)} className="w-full accent-blue-500" />
                    <p className="text-right text-xs text-white/40 mt-1">{searchRadius} km</p>
                    
                    <div className="mt-6 border-t border-white/10 pt-6">
                      <h3 className="text-md font-bold mb-3 text-blue-400">Bulk Target Injection (CSV)</h3>
                      <p className="text-xs text-white/50 mb-4">Upload a CSV with 2 columns: Category, Location (e.g., Mechanics, 522001). We will safely queue all tasks.</p>
                      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all block text-center">
                        Select CSV File
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
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
                        toast.success('Telecaller added successfully!'); 
                        e.target.reset(); 
                        fetchEmployees();
                      } catch (_) { toast.error('Failed to create telecaller'); }
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
                      {/* Magic Folders Grid */}
                      <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5 pb-10">
                        <AnimatePresence>
                          {Object.entries(grouped).sort((a, b) => {
                            // Keep active category first
                            if (a[0] === activeCategory) return -1;
                            if (b[0] === activeCategory) return 1;
                            return b[1].length - a[1].length;
                          }).map(([cat, vends]) => {
                            const isJobRunning = activeJobs.some(j => j.category === cat && j.status === 'running');
                            
                            return (
                            <div key={cat} ref={el => folderRefs.current[cat] = el}>
                              <FolderCard
                                category={cat}
                                vendors={vends}
                                isActive={(loading && cat === activeCategory) || isJobRunning}
                                onClick={(c) => setSelectedFolder(c)}
                                onExport={exportCategoryCSV}
                                onSettingsClick={(c) => setSelectedJobCategory(c)}
                              />
                            </div>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Selected Folder Modal Overlay */}
      <AnimatePresence>
        {selectedFolder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8" style={{ background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(8px)' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#0a0a1a] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: getCategoryMeta(selectedFolder).bg }}>
                    <FolderOpen size={20} style={{ color: getCategoryMeta(selectedFolder).color }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedFolder} Folder</h2>
                    <p className="text-xs text-white/40">{grouped[selectedFolder]?.length || 0} leads ready for processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportCategoryCSV(selectedFolder, grouped[selectedFolder])} 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 transition-all">
                    <Download size={14} /> Export
                  </button>
                  <button onClick={() => setSelectedFolder(null)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* Inner List */}
              <div className="p-5 overflow-y-auto flex-1 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {grouped[selectedFolder]?.map((vendor, idx) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    index={idx}
                    employees={employees}
                    onVerify={handleVerify}
                    onDelete={handleDelete}
                    onAssign={handleAssign}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Job Manager Modal */}
      <AnimatePresence>
        {selectedJobCategory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedJobCategory(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0a0a0f] border border-[#0ff]/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(0,255,255,0.1)]"
            >
              <h2 className="text-xl font-bold mb-1 text-[#0ff]">Extraction Manager</h2>
              <p className="text-xs text-white/50 mb-6 uppercase tracking-wider font-mono">Target: {selectedJobCategory}</p>

              {(() => {
                const job = activeJobs.find(j => j.category === selectedJobCategory);
                if (!job) {
                  return <p className="text-white/60 mb-6">No background extraction is currently running for this target.</p>;
                }
                return (
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-sm">Status</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${job.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-sm">Current Interval</span>
                      <span className="text-sm font-mono text-blue-400">{job.interval / 60000} mins</span>
                    </div>

                    <div className="pt-4 grid grid-cols-2 gap-3">
                      <button onClick={() => handleUpdateJob(selectedJobCategory, 'update_interval', 10 * 60000)} className="py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors border border-blue-500/30">Set 10m</button>
                      <button onClick={() => handleUpdateJob(selectedJobCategory, 'update_interval', 30 * 60000)} className="py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors border border-blue-500/30">Set 30m</button>
                      <button onClick={() => handleUpdateJob(selectedJobCategory, 'update_interval', 60 * 60000)} className="py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors border border-blue-500/30">Set 1hr</button>
                      <button onClick={() => handleUpdateJob(selectedJobCategory, 'update_interval', 120 * 60000)} className="py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors border border-blue-500/30">Set 2hr</button>
                    </div>

                    <div className="pt-2">
                      {job.status === 'running' ? (
                        <button onClick={() => handleUpdateJob(selectedJobCategory, 'stop')} className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold border border-red-500/50 transition-colors">HALT EXTRACTION</button>
                      ) : (
                        <button onClick={() => handleUpdateJob(selectedJobCategory, 'start')} className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold border border-green-500/50 transition-colors">RESUME EXTRACTION</button>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              <button onClick={() => setSelectedJobCategory(null)} className="w-full py-3 text-white/50 hover:text-white transition-colors">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function ScraperDashboardWrapper(props) {
  return (
    <ErrorBoundary>
      <ScraperDashboard {...props} />
    </ErrorBoundary>
  );
}
