import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, Play, Square, Download, RefreshCw, ChevronDown, ChevronUp, Star, Phone, 
  MapPin, Link2, Mail, CheckCircle2, XCircle, Filter, Activity, 
  Trash2, Database, Upload, Users, ShieldAlert, FileOutput, ArrowRight, BrainCircuit,
  Building2, Camera, Music, Utensils, Flower2, Zap, FolderOpen, X, Settings, 
  Share, Menu, ServerCrash, Check, Send, LogOut, Image, MessageCircle, Briefcase,
  Clock, ExternalLink, Smartphone, Cloud, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';
import debounce from 'lodash.debounce';
import SemanticWorker from './semanticWorker?worker';
import { API_URL } from './apiConfig';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-500 bg-[#0a0a0a] min-h-screen">
          <h2 className="text-xl font-medium mb-4">Dashboard encountered an error.</h2>
          <details className="whitespace-pre-wrap text-sm text-red-400/80 bg-red-500/10 p-6 rounded-lg border border-red-500/20">
            {this.state.error && this.state.error.toString()}
            <br /><br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}

const CATEGORY_META = {
  'Banquet Hall': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', icon: Building2 },
  'Photographer': { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', icon: Camera },
  'DJ': { color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)', icon: Music },
  'Caterer': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Utensils },
  'Florist': { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: Flower2 },
  'Decorator': { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', icon: Zap },
};

function getCategoryMeta(cat) {
  const key = Object.keys(CATEGORY_META).find(k => cat?.toLowerCase().includes(k.toLowerCase()));
  return CATEGORY_META[key] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', icon: MapPin };
}

// Clean Vendor Card
function VendorCard({ vendor, index, employees, onVerify, onDelete, onAssign }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(vendor.category);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15, delay: index * 0.02 }}
      className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer overflow-hidden group"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex">
        {/* Verification Status Indicator */}
        <div className="w-1 shrink-0" style={{ background: vendor.verified ? meta.color : 'transparent' }} />
        
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border" style={{ background: meta.bg, borderColor: meta.border }}>
                <Icon size={18} style={{ color: meta.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white text-sm leading-tight truncate">{vendor.name}</h3>
                  {vendor.tier === 'Premium' && (
                    <span className="text-[10px] uppercase font-bold bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/50">{vendor.category}</span>
                  <span className="text-xs text-white/20">•</span>
                  <span className="text-xs text-white/50 truncate">{vendor.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {vendor.qualityScore > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Score</span>
                  <span className={`text-xs font-medium leading-none ${vendor.qualityScore >= 80 ? 'text-yellow-500' : vendor.qualityScore >= 50 ? 'text-blue-500' : 'text-gray-400'}`}>
                    {vendor.qualityScore}
                  </span>
                </div>
              )}
              {vendor.rating && (
                <span className="text-xs text-white/50 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                  <Star size={12} className="text-yellow-500" fill="currentColor" /> {vendor.rating}
                </span>
              )}
              {vendor.aiVerified && (
                <span className="text-xs text-purple-400 flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20" title={`AI Semantic Verification Passed. Matched: ${vendor.matchedKeywords?.join(', ')}`}>
                  <BrainCircuit size={12} /> AI Verified
                </span>
              )}
              {vendor.verified && !vendor.pushed && <CheckCircle2 size={16} className="text-blue-500" />}
              {vendor.pushed && <Database size={16} className="text-green-500" />}
              <ChevronDown size={16} className={`text-white/30 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Quick Info Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {vendor.phone && !vendor.phone.includes('Requires') && (
              <span className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                <Phone size={12} className="text-white/40" /> {vendor.phone}
              </span>
            )}
            {vendor.website && (
              <a href={vendor.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-md border border-blue-500/20 transition-colors">
                <Link2 size={12} /> Website
              </a>
            )}
            {vendor.email && (
              <span className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                <Mail size={12} className="text-white/40" /> {vendor.email}
              </span>
            )}
            {vendor.instagram && (
              <a href={vendor.instagram} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 px-2 py-1 rounded-md border border-pink-500/20 transition-colors">
                <Link2 size={12} /> {vendor.instagramFollowers ? `${vendor.instagramFollowers}` : 'Instagram'}
              </a>
            )}
            {vendor.facebook && (
              <a href={vendor.facebook} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-md border border-blue-500/20 transition-colors">
                <Link2 size={12} /> {vendor.facebookFollowers ? `${vendor.facebookFollowers} (FB)` : 'Facebook'}
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
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  {vendor.address && (
                    <div className="flex items-start gap-2 text-sm text-white/60">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-white/40" />
                      <span>{vendor.address}</span>
                    </div>
                  )}
                  {vendor.operatingHours && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Clock size={14} className="text-white/40" />
                      <span>{vendor.operatingHours}</span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  {!vendor.pushed && (
                    <div className="flex gap-2 pt-2" onClick={e => e.stopPropagation()}>
                      <select
                        onChange={(e) => onAssign(vendor.id, e.target.value)}
                        value={vendor.assignedTo || ''}
                        className="flex-1 px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                      >
                        <option value="">Assign to team member...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => onVerify(vendor.id, vendor)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border ${vendor.verified ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white text-black border-white hover:bg-white/90'}`}
                      >
                        {vendor.verified ? 'Verified ✓' : 'Mark Verified'}
                      </button>
                      <button
                        onClick={() => onDelete(vendor.id)}
                        className="px-3 py-2 rounded-lg text-sm bg-red-500/5 text-red-400 border border-red-500/10 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
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

// Clean Minimal Folder
function FolderCard({ category, vendors, onClick, onExport, isActive, onSettingsClick }) {
  const meta = getCategoryMeta(category);
  const count = vendors.length;

  return (
    <div
      className="relative cursor-pointer group bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all hover:border-white/10 overflow-hidden"
      onClick={() => onClick(category)}
    >
      <div 
        onClick={(e) => { e.stopPropagation(); onSettingsClick(category); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 text-white/30 hover:text-white hover:bg-white/10 z-20 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
      >
        <Settings size={14} />
      </div>

      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse" />
      )}
      
      <div className="p-5 h-32 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2.5 rounded-xl border" style={{ background: meta.bg, borderColor: meta.border }}>
            <FolderOpen size={20} style={{ color: meta.color }} />
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onExport(category, vendors); }}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
            title={`Download ${category} CSV`}
          >
            <Download size={16} />
          </button>
        </div>
        
        <div>
          <h3 className="font-medium text-white text-sm truncate">{category}</h3>
          <p className="text-xs mt-1 text-white/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
            {count} Leads
          </p>
        </div>
      </div>
    </div>
  );
}

function ScraperDashboard({ onLogout }) {
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [omniQuery, setOmniQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gomandap_search_history') || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState('staging-phones');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [knowledge, setKnowledge] = useState({ categories: [], locations: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [logs, setLogs] = useState([
    `[INFO] Scraper service initialized.`,
    `[INFO] Awaiting tasks...`
  ]);
  const [sseStatus, setSseStatus] = useState('disconnected'); // disconnected | connecting | open | error
  const [logLevel, setLogLevel] = useState('ALL'); // ALL | INFO | WARN | ERROR | DEBUG
  const eventSourceRef = useRef(null);
  const [searchRadius, setSearchRadius] = useState(0);
  const [enabledEngines, setEnabledEngines] = useState(['maps', 'instagram', 'facebook', 'youtube', 'pinterest', 'linkedin']);
  
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedJobCategory, setSelectedJobCategory] = useState(null);
  const [backendConnected, setBackendConnected] = useState(true);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [showDirectory, setShowDirectory] = useState(false);
  const [modelLoadingStatus, setModelLoadingStatus] = useState({ status: 'idle', progress: 0 });
  const [fuseInstances, setFuseInstances] = useState({ categories: null, locations: null });
  const prevVendorsCount = useRef(0);
  const terminalRef = useRef(null);
  const workerRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Live Backend Logs via Server-Sent Events (SSE)
  useEffect(() => {
    setSseStatus('connecting');
    let es;
    try {
      es = new EventSource(`${API_URL}/logs/stream`);
      eventSourceRef.current = es;
      es.addEventListener('open', () => setSseStatus('open'));
      es.addEventListener('error', () => setSseStatus('error'));
      es.addEventListener('init', (e) => {
        try { const arr = JSON.parse(e.data); if (Array.isArray(arr)) setLogs(arr); } catch {}
      });
      es.addEventListener('vendor', (e) => {
        try {
          // Vendor event received; refresh vendor list
          fetchVendors();
        } catch (err) { /* ignore */ }
      });
      es.onmessage = (e) => {
        try {
          setLogs(prev => {
            const next = [...prev, e.data];
            return next.slice(-200);
          });
          // auto-scroll
          setTimeout(() => {
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
          }, 50);
        } catch (err) {}
      };
      es.onerror = () => {
        setSseStatus('error');
        // EventSource will attempt automatic reconnects; keep the instance
      };
    } catch (err) {
      setSseStatus('error');
      // If EventSource isn't available, fallback to polling
      let interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/logs`);
          if (res.data && Array.isArray(res.data)) setLogs(res.data);
        } catch (e) {}
      }, 2000);
      return () => clearInterval(interval);
    }
    return () => { try { es && es.close(); eventSourceRef.current = null; } catch (e) {} };
  }, []);

  // Proactive AI Guidance Toast (Idle for 60s)
  useEffect(() => {
    let timeout;
    const resetIdle = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (knowledge.categories && knowledge.categories.length > 0 && knowledge.locations && knowledge.locations.length > 0) {
           const randCat = knowledge.categories[Math.floor(Math.random() * knowledge.categories.length)];
           const locs = knowledge.locations.filter(l => l.type === 'district');
           if (locs.length > 0) {
             const randLoc = locs[Math.floor(Math.random() * locs.length)].name;
             toast(`AI Suggestion: Try searching for "${randCat} in ${randLoc}"`, { 
               icon: '💡', 
               duration: 6000,
               style: { background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
             });
           }
        }
      }, 60000);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle();
    
    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      clearTimeout(timeout);
    };
  }, [knowledge]);

  useEffect(() => {
    // Initialize Web Worker for Semantic Search
    workerRef.current = new SemanticWorker();
    
    workerRef.current.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.status === 'progress') {
        setModelLoadingStatus({ status: 'loading', progress: msg.progress });
      } else if (msg.status === 'ready') {
        setModelLoadingStatus({ status: 'ready', progress: 100 });
      } else if (msg.status === 'index_ready') {
        console.log('Semantic Index Ready with', msg.count, 'items');
      } else if (msg.status === 'search_results') {
        const topMatches = msg.results.filter(r => r.score > 0.4);
        
        let topSuggestions = topMatches.map(r => (msg.prefix || '') + r.text);
        
        if (!msg.prefix && topMatches.length > 0 && topMatches[0].type === 'category') {
          topSuggestions.push(`${topMatches[0].text} in `);
        }

        const currentQueryLower = ((msg.prefix || '') + (msg.text || '')).toLowerCase();
        let historyData = [];
        try {
          historyData = JSON.parse(localStorage.getItem('gomandap_search_history') || '[]');
        } catch(e) {
          // Search history suggestions are optional.
        }
        
        const matchingHistory = historyData.filter(h => h.toLowerCase().includes(currentQueryLower) && currentQueryLower.length > 0);

        setSuggestions([...new Set([...matchingHistory, ...topSuggestions])]);
        setShowSuggestions(true);
      }
    });

    fetchVendors();
    fetchEmployees();
    fetchKnowledge();
    const poll = setInterval(() => {
      fetchVendors().catch(() => setBackendConnected(false));
    }, 3000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchKnowledge() {
    try {
      const res = await axios.get(`${API_URL}/knowledge`);
      setKnowledge(res.data);
      
      const docs = [];
      res.data.categories.forEach(c => docs.push({ text: c, type: 'category' }));
      res.data.locations.forEach(l => docs.push({ text: l.name, type: 'location' }));
      
      const catFuse = new Fuse(res.data.categories, { includeScore: true, threshold: 0.4 });
      const locFuse = new Fuse(res.data.locations.map(l => l.name), { includeScore: true, threshold: 0.4 });
      setFuseInstances({ categories: catFuse, locations: locFuse });
      
      if (workerRef.current) {
        workerRef.current.postMessage({ action: 'build_index', knowledgeBase: docs });
      }
    } catch (e) { console.error('Failed to fetch knowledge base', e); }
  }

  const handleSearchChange = (val) => {
    setOmniQuery(val);
    if (val.trim().length === 0) {
      if (searchHistory.length > 0) {
        setSuggestions(searchHistory);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      return;
    }
    
    if (val.trim().length < 2 || !workerRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let searchVal = val;
    let isLocationSearch = false;
    let prefix = '';
    
    if (val.toLowerCase().includes(' in ')) {
      isLocationSearch = true;
      const parts = val.split(/ in /i);
      const rawCategory = parts[0].trim();
      searchVal = parts[1].trim();
      
      let correctedCategory = rawCategory;
      if (fuseInstances.categories && rawCategory) {
        const catResult = fuseInstances.categories.search(rawCategory);
        if (catResult.length > 0) correctedCategory = catResult[0].item;
      }
      prefix = correctedCategory + ' in ';
    }

    if (!searchVal) { setSuggestions([]); setSuggestionIndex(-1); return; }

    // Execute Local Semantic Search immediately
    workerRef.current.postMessage({
      action: 'search',
      text: searchVal,
      prefix: prefix,
      id: Date.now()
    });
    setSuggestionIndex(-1);

    // Debounced OpenStreetMap Search for obscure villages
    if (isLocationSearch) {
      debouncedOSMSearch(searchVal, prefix);
    }
  };

  // Debounced OSM Fetcher
  const debouncedOSMSearch = useRef(debounce(async (searchVal, prefix) => {
    try {
      const res = await axios.get(`${API_URL}/location/search`, { params: { q: searchVal } });
      if (res.data && res.data.length > 0) {
        setSuggestions(prev => {
          const newSugs = res.data.map(loc => prefix + loc.name);
          const combined = [...new Set([...prev, ...newSugs])];
          return combined;
        });
      }
    } catch (e) {
      console.error('OSM Search failed', e);
    }
  }, 1000)).current;

  const handleKeyDown = (e) => {
    // Tab / Right Arrow autocomplete
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && omniQuery.length > 0 && suggestions.length > 0) {
      const best = suggestions[0];
      if (best.toLowerCase().startsWith(omniQuery.toLowerCase())) {
        e.preventDefault();
        setOmniQuery(best);
        if (best.endsWith(' in ')) {
          setShowSuggestions(false);
        }
        return;
      }
    }

    if (!showSuggestions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
        setOmniQuery(suggestions[suggestionIndex]);
        setShowSuggestions(false);
      } else if (suggestions.length > 0) {
        // Auto-correct to best suggestion if they just hit Enter
        const bestMatch = suggestions[0];
        setOmniQuery(bestMatch);
        setShowSuggestions(false);
        
        if (bestMatch.endsWith(' in ')) {
          toast.success(`Corrected category. Now add a location!`, { icon: '✨' });
          // Keep focus so they can type location
        } else {
          toast.success(`Auto-corrected to: ${bestMatch}`, { icon: '✨' });
          setTimeout(() => startScrape(null, bestMatch), 50);
        }
      } else {
        startScrape(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  async function fetchEmployees() {
    try {
      const res = await axios.get(`${API_URL}/employees`);
      setEmployees(res.data);
    } catch (error) { console.error('Failed to fetch employees', error); }
  }

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/scrape/jobs`);
      setActiveJobs(res.data);
    } catch (error) { console.error('Failed to fetch jobs', error); }
  };

  async function fetchVendors() {
    try {
      const res = await axios.get(`${API_URL}/vendors`);
      setVendors(res.data);
      setBackendConnected(true);
    } catch (error) { 
      console.error('Failed to fetch vendors', error);
      setBackendConnected(false);
    }
  }

  useEffect(() => {
    const intv = setInterval(fetchJobs, 5000);
    return () => clearInterval(intv);
  }, []);

  const handleMasterStop = async () => {
    try {
      await axios.post(`${API_URL}/scrape/jobs/stop-all`);
      toast.success('All tasks terminated.');
      fetchJobs();
      setLoading(false);
      setLogs(prev => [...prev, `[INFO] Master stop executed.`]);
    } catch (error) {
      toast.error('Failed to stop all tasks');
    }
  };

  const handleUpdateJob = async (category, action, intervalMs) => {
    try {
      await axios.post(`${API_URL}/scrape/jobs/update`, { category, action, intervalMs });
      toast.success(`Job updated successfully.`);
      fetchJobs();
      setSelectedJobCategory(null);
      setLogs(prev => [...prev, `[INFO] Job ${category} -> ${action}`]);
    } catch (error) { toast.error('Failed to update job'); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target.result;
      const rows = csv.split('\n').map(r => r.split(','));
      const tasks = [];
      for (let i = 1; i < rows.length; i++) {
        const cat = rows[i][0]?.trim();
        const loc = rows[i][1]?.trim();
        if (cat && loc) tasks.push({ category: cat, location: loc });
      }
      if (tasks.length > 0) {
        try {
          await axios.post(`${API_URL}/scrape/upload`, { tasks });
          toast.success(`Uploaded ${tasks.length} bulk tasks.`);
          setLogs(prev => [...prev, `[INFO] Bulk queued ${tasks.length} tasks.`]);
        } catch (e) { toast.error('Upload failed'); }
      }
    };
    reader.readAsText(file);
  };

  const startScrape = async (e, overrideQuery = null) => {
    if (e) e.preventDefault();
    const queryToUse = overrideQuery || omniQuery;
    
    if (!queryToUse.trim()) return toast.error("Please enter a category and location.");
    
    const parts = queryToUse.toLowerCase().split(/ in /i);
    if (parts.length < 2 || parts[1].trim().length === 0) {
      searchContainerRef.current?.querySelector('input')?.focus();
      return toast.error("Please specify a location! (e.g., 'Photographers in Hyderabad')", { icon: '📍' });
    }
    
    let parsedCat = parts[0].trim();
    let locationPart = parts[1] ? parts[1].trim() : '';
    
    // Intelligently auto-correct the folder name using Fuse to match what the backend will generate
    if (fuseInstances.categories) {
      const catResult = fuseInstances.categories.search(parsedCat);
      if (catResult.length > 0) {
        parsedCat = catResult[0].item;
      }
    }
    
    if (fuseInstances.locations && locationPart) {
      const locResult = fuseInstances.locations.search(locationPart);
      if (locResult.length > 0) {
        locationPart = locResult[0].item;
      }
    }
    
    const folderName = locationPart ? `${parsedCat} in ${locationPart}` : parsedCat;
    setActiveCategory(folderName);

    // Save to history
    const newHistory = [queryToUse, ...searchHistory.filter(q => q !== queryToUse)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('gomandap_search_history', JSON.stringify(newHistory));

    setLogs(prev => [...prev, `[PROCESS] Starting task: ${queryToUse}`]);
    
    try {
      setLoading(true);
      await axios.post(`${API_URL}/scrape/omni`, {
        query: queryToUse,
        radius: searchRadius,
        enabledEngines
      });
      toast.success('Omni-scrape started! Stream processing engaged.', { icon: '🚀' });
      
      // Trigger Firebase scrape if enabled
      if (enabledEngines.includes('firebase')) {
        axios.post(`${API_URL}/scrape/firebase`, {
          query: queryToUse,
          category: parsedCat,
          location: locationPart
        }).catch(err => console.error('[Firebase]', err.message));
      }
      
      setShowSuggestions(false);
      // Removed setOmniQuery(''); so you can search again easily!
    } catch (error) {
      toast.error('Scraper failed to start');
      setLogs(prev => [...prev, `[ERROR] Failed to start task`]);
      setLoading(false);
      if (error.response?.data?.error) toast.error(error.response.data.error);
    }
  };

  const handleVerify = async (id, currentData) => {
    try {
      await axios.put(`${API_URL}/vendors/${id}`, currentData);
      fetchVendors();
      toast.success('Vendor verified!');
    } catch (error) { toast.error('Verification failed'); }
  };

  const handleAssign = async (id, employeeId) => {
    if (!employeeId) return;
    try {
      await axios.post(`${API_URL}/vendors/assign`, { vendorIds: [id], employeeId });
      fetchVendors();
      toast.success('Assigned!');
    } catch (error) { toast.error('Assignment failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/vendors/${id}`);
      fetchVendors();
      toast.success('Deleted');
    } catch (error) { toast.error('Delete failed'); }
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
      } catch (_) { toast.error('Failed to clear queue'); }
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
    saveAs(content, `gomandap_${activeTab}_leads.zip`);
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

  const stagingVendors = vendors.filter(v => !v.pushed).reverse();
  const stagingVendorsWithPhones = stagingVendors.filter(v => v.phone && v.phone.length > 5 && !v.phone.includes('Requires'));
  const stagingVendorsNoPhones = stagingVendors.filter(v => !v.phone || v.phone.length <= 5 || v.phone.includes('Requires'));
  const liveVendors = vendors.filter(v => v.pushed).reverse();
  const verifiedCount = stagingVendors.filter(v => v.verified).length;

  const displayedVendors = activeTab === 'staging-phones' ? stagingVendorsWithPhones
    : activeTab === 'staging-nophones' ? stagingVendorsNoPhones : liveVendors;

  // Auto-switch to no-phones tab if there are results there but none in the phones tab
  useEffect(() => {
    if (activeTab === 'staging-phones' && stagingVendorsWithPhones.length === 0 && stagingVendorsNoPhones.length > 0) {
      const timer = setTimeout(() => setActiveTab('staging-nophones'), 0);
      return () => clearTimeout(timer);
    }
  }, [stagingVendorsWithPhones.length, stagingVendorsNoPhones.length, activeTab]);

  const cities = ['All', ...new Set(displayedVendors.map(v => v.city).filter(Boolean))];
  const filteredVendors = displayedVendors.filter(v =>
    (selectedCity === 'All' || v.city === selectedCity) &&
    (v.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
     v.category?.toLowerCase().includes(searchFilter.toLowerCase()) ||
     v.city?.toLowerCase().includes(searchFilter.toLowerCase()) ||
     v.phone?.includes(searchFilter))
  );

  const grouped = filteredVendors.reduce((acc, v) => {
    const key = (v.city && v.city !== 'Global') ? `${v.category || 'Uncategorized'} in ${v.city}` : (v.category || 'Uncategorized');
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  if (activeCategory && !grouped[activeCategory]) {
    grouped[activeCategory] = [];
  }

  if (!backendConnected) {
    return (
      <div className="min-h-screen text-white font-sans bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
          <ServerCrash size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-medium mb-3">Backend Not Connected</h2>
        <p className="text-white/50 max-w-md mb-8">
          The Gomandap Scraper API could not be reached at <code className="bg-white/10 px-1.5 py-0.5 rounded mx-1">{API_URL}</code>.<br/><br/>
          Please make sure you have started the dedicated scraper server by running <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-400">npm start</code> inside the <code className="bg-white/10 px-1.5 py-0.5 rounded">gomandap-scraper/server</code> directory.
        </p>
        <button onClick={() => fetchVendors()} className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 flex items-center gap-2">
          <RefreshCw size={16} /> Try Reconnecting
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans bg-[#0a0a0a] flex flex-col">
      {/* HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Search className="text-black" size={16} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-sm font-medium tracking-wide">GOMANDAP <span className="text-white/40">Scraper API</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleMasterStop} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors border border-red-400/20">
            <XCircle size={14} /> Stop All
          </button>
          
          <button
            onClick={pushToProd}
            disabled={verifiedCount === 0}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-colors border ${verifiedCount > 0 ? 'bg-white text-black border-white hover:bg-white/90' : 'bg-white/5 text-white/30 border-white/5'}`}
          >
            <Send size={14} /> Push Live {verifiedCount > 0 && `(${verifiedCount})`}
          </button>
          
          <div className="w-px h-6 bg-white/10" />
          
          <button onClick={onLogout} className="text-white/40 hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* HERO SEARCH AREA */}
      <div className="px-6 py-12 flex flex-col items-center justify-center border-b border-white/5 relative z-40 bg-[#0a0a0a]">
        <h2 className="text-3xl font-medium mb-2 tracking-tight">Extract structured data from anywhere.</h2>
        <p className="text-sm text-white/50 mb-8 flex items-center gap-2">
          Search intelligently. AI Semantic Search is active.
          {modelLoadingStatus.status === 'loading' && (
             <span className="text-blue-400 flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Loading AI Model ({Math.round(modelLoadingStatus.progress)}%)...</span>
          )}
          {modelLoadingStatus.status === 'ready' && (
             <span className="text-green-400 flex items-center gap-1"><Check size={12} /> Model Ready</span>
          )}
        </p>
        
        <form onSubmit={startScrape} className="w-full max-w-2xl relative" ref={searchContainerRef}>
          <div className="relative group flex items-center bg-[#111] rounded-xl border border-white/10 focus-within:border-white/30 focus-within:ring-4 focus-within:ring-white/5 transition-all shadow-lg shadow-black/50">
            <Search className="absolute left-4 text-white/40 group-focus-within:text-white transition-colors z-20" size={20} />
            
            {/* Ghost text container */}
            <div className="absolute inset-y-0 left-12 right-32 flex items-center pointer-events-none z-0 overflow-hidden">
              <span className="text-transparent whitespace-pre px-0 text-lg font-sans tracking-normal">{omniQuery}</span>
              {omniQuery.length > 0 && suggestions.length > 0 && suggestions[0].toLowerCase().startsWith(omniQuery.toLowerCase()) && (
                <span className="text-white/20 whitespace-pre text-lg font-sans tracking-normal">{suggestions[0].slice(omniQuery.length)}</span>
              )}
            </div>

            <input 
              type="text" 
              placeholder="e.g. 'Photographers in Hyderabad' or 'Banquet Halls'"
              className="w-full bg-transparent text-white placeholder-white/30 pl-12 pr-[20rem] py-4 rounded-xl outline-none text-lg relative z-10 font-sans tracking-normal"
              value={omniQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => { 
                if (omniQuery.trim().length === 0 && searchHistory.length > 0) {
                  setSuggestions(searchHistory);
                  setShowSuggestions(true);
                } else if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={handleKeyDown}
            />
            {!loading && omniQuery && (
              <button 
                type="button"
                onClick={() => { setOmniQuery(''); setSuggestions([]); setSuggestionIndex(-1); }}
                className="absolute right-[17rem] text-white/30 hover:text-white transition-colors z-20"
                title="Clear Search"
              >
                <X size={18} />
              </button>
            )}
            {loading && (
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); handleMasterStop(); }}
                className="absolute right-[17rem] text-red-400 hover:text-red-500 transition-colors z-20 flex items-center gap-1 text-xs font-bold bg-red-500/10 px-2 py-1 rounded"
                title="Stop Scraping"
              >
                <XCircle size={14} /> STOP
              </button>
            )}
            <div className="absolute right-2 flex items-center gap-2 z-20">
              <select 
                value={searchRadius} 
                onChange={e => setSearchRadius(Number(e.target.value))}
                className="bg-white/5 text-white/70 text-sm py-1.5 px-2 rounded-md border border-white/10 focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
              >
                <option value={0}>Exact City</option>
                <option value={20}>+20km Radius</option>
                <option value={50}>+50km Radius</option>
                <option value={100}>+100km Radius</option>
              </select>
              <button type="submit" className={`p-2.5 rounded-lg transition-colors shadow-sm ${loading ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-black hover:bg-white/90'}`}>
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
          
          {/* Progress Animation Bar */}
          {loading && (
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: "0%", x: "0%" }}
                animate={{ width: ["0%", "30%", "100%", "30%"], x: ["0%", "50%", "100%", "200%"] }}
                transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
              />
            </div>
          )}
          
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                className="absolute w-full mt-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 backdrop-blur-xl"
              >
                {suggestions.map((s, idx) => {
                  const isHistory = omniQuery.trim().length === 0;
                  return (
                    <div 
                      key={idx} 
                      className={`px-4 py-3 text-sm cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3 transition-colors ${
                        suggestionIndex === idx ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/70 hover:text-white'
                      }`}
                      onClick={() => {
                        setOmniQuery(s);
                        setShowSuggestions(false);
                        if (isHistory || (!s.endsWith(' in '))) {
                          setTimeout(() => startScrape(null, s), 50);
                        } else {
                          searchContainerRef.current?.querySelector('input')?.focus();
                        }
                      }}
                    >
                      {isHistory ? <Clock size={14} className="text-white/30" /> : <Search size={14} className={suggestionIndex === idx ? 'text-white' : 'text-white/30'} />}
                      {s}
                    </div>
                  );
                })}
                {omniQuery.trim().length === 0 && searchHistory.length > 0 && (
                  <div 
                    className="px-4 py-2 text-xs text-red-400/70 hover:text-red-400 cursor-pointer bg-[#1a1a1a] flex items-center justify-center gap-1 border-t border-white/5"
                    onClick={() => { setSearchHistory([]); localStorage.removeItem('gomandap_search_history'); setShowSuggestions(false); }}
                  >
                    <Trash2 size={12} /> Clear History
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* PLATFORM SELECTOR */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 w-full max-w-3xl">
          {[
            { id: 'maps', label: 'Maps', icon: <MapPin size={14} /> },
            { id: 'instagram', label: 'Instagram', icon: <Camera size={14} /> },
            { id: 'facebook', label: 'Facebook', icon: <MessageCircle size={14} /> },
            { id: 'youtube', label: 'YouTube', icon: <Play size={14} /> },
            { id: 'pinterest', label: 'Pinterest', icon: <Image size={14} /> },
            { id: 'linkedin', label: 'LinkedIn', icon: <Briefcase size={14} /> },
            { id: 'justdial', label: 'Justdial', icon: <Globe size={14} /> },
            { id: 'firebase', label: 'Firebase Sync', icon: <Database size={14} /> }
          ].map(platform => {
            const isEnabled = enabledEngines.includes(platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setEnabledEngines(prev => prev.includes(platform.id) ? prev.filter(e => e !== platform.id) : [...prev, platform.id])}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isEnabled ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'}`}
              >
                {platform.icon} {platform.label}
              </button>
            );
          })}
        </div>

        {/* BROWSE ALL DIRECTORY */}
        <div className="mt-8 w-full max-w-2xl flex flex-col items-center">
          <button 
            type="button"
            onClick={() => setShowDirectory(!showDirectory)}
            className="text-xs font-medium text-white/50 hover:text-white flex items-center gap-1 transition-colors"
          >
            {showDirectory ? 'Hide Directory' : 'Browse All Categories & Locations'} <ChevronDown size={14} className={`transform transition-transform ${showDirectory ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showDirectory && knowledge && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="w-full mt-4 bg-[#111] border border-white/10 rounded-xl p-6 grid grid-cols-2 gap-8 text-left overflow-hidden z-40"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2"><Database size={14} /> Categories</h3>
                  <div className="h-48 overflow-y-auto pr-2 custom-scrollbar flex flex-wrap gap-2">
                    {knowledge.categories.map((c, i) => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => { setOmniQuery(c + " in "); setShowDirectory(false); searchContainerRef.current?.querySelector('input')?.focus(); }}
                        className="text-xs bg-white/5 hover:bg-white/15 border border-white/5 px-2.5 py-1.5 rounded-md text-white/70 transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2"><MapPin size={14} /> Top Locations</h3>
                  <div className="h-48 overflow-y-auto pr-2 custom-scrollbar flex flex-wrap gap-2">
                    {knowledge.locations.filter(l => l.type === 'district').map((l, i) => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => { setOmniQuery(omniQuery.includes('in') ? omniQuery.split('in')[0] + 'in ' + l.name : `Photographers in ${l.name}`); setShowDirectory(false); }}
                        className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/10 px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar - Activity Log (Clean Terminal) */}
        <div className="w-80 border-r border-white/5 bg-[#0a0a0a] flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-white/5 flex items-center justify-between gap-2 text-sm font-medium text-white/70">
            <div className="flex items-center gap-2">
              <Activity size={16} /> Activity Log
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${sseStatus === 'open' ? 'bg-green-400' : sseStatus === 'connecting' ? 'bg-yellow-400' : sseStatus === 'error' ? 'bg-red-400' : 'bg-gray-500'}`} />
                <span className="text-white/60">{sseStatus.toUpperCase()}</span>
              </div>
              <select value={logLevel} onChange={(e) => setLogLevel(e.target.value)} className="bg-transparent text-white/70 text-xs border border-white/5 px-2 py-1 rounded-md">
                <option value="ALL">All</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warn</option>
                <option value="ERROR">Error</option>
                <option value="DEBUG">Debug</option>
              </select>
            </div>
          </div>
          <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] leading-relaxed text-white/50" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {(() => {
              const filtered = logs.filter(l => {
                if (!logLevel || logLevel === 'ALL') return true;
                try { return l.includes(`[${logLevel}]`); } catch { return true; }
              }).slice(-200);
              return [...filtered].reverse().map((log, i) => (
                <div key={i} className="break-words border-b border-white/5 pb-2">
                  <span className="text-white/30">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" })}</span>
                  <span className="ml-2 text-white/70">{log}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
          
          {/* Tabs */}
          <div className="px-6 pt-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex gap-6 relative top-[1px]">
              {[
                { id: 'staging-phones', label: 'Staging (Ready)' },
                { id: 'staging-nophones', label: 'Staging (No Phone)' },
                { id: 'pushed', label: 'Live DB' },
                { id: 'employees', label: 'Team' },
                { id: 'settings', label: 'Settings' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'text-white border-white' : 'text-white/40 border-transparent hover:text-white/70'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {(activeTab === 'staging-phones' || activeTab === 'staging-nophones' || activeTab === 'pushed') && (
              <div className="flex items-center gap-3 pb-2">
                <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <Download size={14} /> Export CSV
                </button>
                <button onClick={clearQueue} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-red-400/80 hover:text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors border border-red-400/10">
                  <Trash2 size={14} /> Clear Queue
                </button>
              </div>
            )}
          </div>

          {/* Filters Bar */}
          {(activeTab === 'staging-phones' || activeTab === 'staging-nophones' || activeTab === 'pushed') && (
            <div className="px-6 py-4 flex items-center gap-3 border-b border-white/5">
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Filter by name, category..."
                  className="w-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-white/30 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="py-1.5 px-3 rounded-md text-xs text-white bg-white/5 border border-white/10 focus:outline-none focus:border-white/20 transition-colors"
              >
                {cities.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
              </select>
              <button onClick={fetchVendors} className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors border border-transparent">
                <RefreshCw size={14} />
              </button>
              
              <div className="ml-auto text-xs text-white/40 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                {filteredVendors.length} items
              </div>
            </div>
          )}

          {/* Scrolling Content Area */}
          <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            
            <AnimatePresence mode="wait">
              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl space-y-8">
                  <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                    <h3 className="text-base font-medium mb-4 flex items-center gap-2"><Settings size={18} className="text-white/50" /> Admin Credentials</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await axios.put(`${API_URL}/auth/admin`, { username: e.target.username.value, password: e.target.password.value });
                        toast.success('Credentials updated.');
                        onLogout();
                      } catch (_) { toast.error('Update failed'); }
                    }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5">New Username</label>
                        <input name="username" type="text" className="w-full py-2 px-3 text-sm text-white bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-white/30" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5">New Password</label>
                        <input name="password" type="password" className="w-full py-2 px-3 text-sm text-white bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-white/30" required />
                      </div>
                      <button type="submit" className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-white/90 transition-colors">
                        Update Credentials
                      </button>
                    </form>
                  </div>

                  <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                    <h3 className="text-base font-medium mb-4">Advanced Settings</h3>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white/70 mb-2">Scraping Radius: <span className="text-white">{searchRadius} km</span></label>
                      <p className="text-xs text-white/40 mb-3">Setting to 0 uses strict literal search. Higher radius expands Google Maps boundaries.</p>
                      <input type="range" min="0" max="100" value={searchRadius} onChange={(e) => setSearchRadius(e.target.value)} className="w-full accent-white" />
                    </div>
                    
                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2"><Share size={16} /> Bulk Target Injection</h3>
                      <p className="text-xs text-white/50 mb-4">Upload a CSV (Category, Location) to safely queue deep execution tasks in the background.</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm font-medium cursor-pointer transition-colors">
                        Select CSV File
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* EMPLOYEES TAB */}
              {activeTab === 'employees' && (
                <motion.div key="employees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  <div className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-2xl">
                    <h3 className="text-base font-medium mb-4 flex items-center gap-2"><Users size={18} className="text-white/50" /> Add Team Member</h3>
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
                        toast.success('Team member added!'); 
                        e.target.reset(); 
                        fetchEmployees();
                      } catch (_) { toast.error('Creation failed'); }
                    }} className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-white/50 mb-1.5">Avatar / Photo</label>
                        <input name="avatar" type="file" accept="image/*" className="w-full py-1.5 px-3 text-xs text-white bg-white/5 border border-white/10 rounded-md" required />
                      </div>
                      {[['name', 'Full Name', 'text'], ['location', 'Territory', 'text'],
                        ['phone', 'Phone Number', 'text'], ['email', 'Email Address', 'email'],
                        ['username', 'Login Username', 'text'], ['password', 'Login Password', 'password']].map(([name, ph, type]) => (
                        <div key={name}>
                           <label className="block text-xs font-medium text-white/50 mb-1.5">{ph}</label>
                           <input name={name} placeholder={ph} type={type} required
                             className="w-full py-2 px-3 text-sm text-white bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-white/30" />
                        </div>
                      ))}
                      <div className="col-span-2 pt-2">
                        <button type="submit" className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-white/90 transition-colors">
                          Create Team Member
                        </button>
                      </div>
                    </form>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-4">Active Team Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {employees.map(emp => (
                        <div key={emp.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                          <img src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}&background=111&color=fff`}
                            alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{emp.name}</h4>
                            <p className="text-xs text-white/50 truncate">{emp.location} Territory</p>
                            <p className="text-[10px] text-white/30 font-mono mt-0.5 truncate">@{emp.username}</p>
                          </div>
                          <button onClick={async () => {
                            if (window.confirm('Delete member?')) { await axios.delete(`${API_URL}/employees/${emp.id}`); fetchEmployees(); }
                          }} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors border border-transparent hover:border-red-400/20">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VENDORS TAB */}
              {(activeTab === 'staging-phones' || activeTab === 'staging-nophones' || activeTab === 'pushed') && (
                <motion.div key="vendors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {filteredVendors.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/20">
                        <Menu size={24} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-base font-medium text-white/70">No results found</h3>
                      <p className="text-sm text-white/40 mt-1">Adjust filters or start a new extraction from the top bar.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      <AnimatePresence>
                        {Object.entries(grouped).sort((a, b) => {
                          if (a[0] === activeCategory) return -1;
                          if (b[0] === activeCategory) return 1;
                          return b[1].length - a[1].length;
                        }).map(([cat, vends]) => {
                          const isJobRunning = activeJobs.some(j => j.category === cat && j.status === 'running');
                          return (
                            <FolderCard
                              key={cat}
                              category={cat}
                              vendors={vends}
                              isActive={(loading && cat === activeCategory) || isJobRunning}
                              onClick={(c) => setSelectedFolder(c)}
                              onExport={exportCategoryCSV}
                              onSettingsClick={(c) => setSelectedJobCategory(c)}
                            />
                          );
                        })}
                      </AnimatePresence>
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
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#0a0a0a] border-l border-white/10 w-full max-w-3xl h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg border" style={{ background: getCategoryMeta(selectedFolder).bg, borderColor: getCategoryMeta(selectedFolder).border }}>
                    <FolderOpen size={20} style={{ color: getCategoryMeta(selectedFolder).color }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">{selectedFolder}</h2>
                    <p className="text-xs text-white/50">{grouped[selectedFolder]?.length || 0} items extracted</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportCategoryCSV(selectedFolder, grouped[selectedFolder])} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                    <Download size={14} /> Export
                  </button>
                  <button onClick={() => setSelectedFolder(null)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
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
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedJobCategory(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-base font-medium text-white">Extraction Settings</h2>
                  <p className="text-xs text-white/50 mt-1">Target: <span className="text-white">{selectedJobCategory}</span></p>
                </div>
                <button onClick={() => setSelectedJobCategory(null)} className="text-white/30 hover:text-white"><X size={18} /></button>
              </div>

              {(() => {
                const job = activeJobs.find(j => j.category === selectedJobCategory);
                if (!job) {
                  return <p className="text-sm text-white/50 mb-6 bg-white/5 p-4 rounded-md border border-white/5">No background extraction is currently running for this target.</p>;
                }
                return (
                  <div className="space-y-4 mb-2">
                    <div className="flex justify-between items-center bg-[#0a0a0a] p-3 rounded-md border border-white/5">
                      <span className="text-xs font-medium text-white/60">Status</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${job.status === 'running' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-[#0a0a0a] p-3 rounded-md border border-white/5">
                      <span className="text-xs font-medium text-white/60">Recurrence</span>
                      <span className="text-sm text-white">{job.interval / 60000} min</span>
                    </div>

                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <button onClick={() => handleUpdateJob(selectedJobCategory, 'update_interval', 10 * 60000)} className="py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 rounded-md text-xs font-medium transition-colors">Set 10m</button>
                      <button onClick={() => handleUpdateJob(selectedJobCategory, 'update_interval', 30 * 60000)} className="py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 rounded-md text-xs font-medium transition-colors">Set 30m</button>
                      <button onClick={() => handleUpdateJob(selectedJobCategory, 'update_interval', 60 * 60000)} className="py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 rounded-md text-xs font-medium transition-colors">Set 1hr</button>
                      <button onClick={() => handleUpdateJob(selectedJobCategory, 'update_interval', 120 * 60000)} className="py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 rounded-md text-xs font-medium transition-colors">Set 2hr</button>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-4">
                      {job.status === 'running' ? (
                        <button onClick={() => handleUpdateJob(selectedJobCategory, 'stop')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md font-medium text-sm border border-red-500/20 transition-colors"><XCircle size={16} /> Halt Process</button>
                      ) : (
                        <button onClick={() => handleUpdateJob(selectedJobCategory, 'start')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md font-medium text-sm border border-blue-500/20 transition-colors"><Play size={16} /> Resume Process</button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
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
