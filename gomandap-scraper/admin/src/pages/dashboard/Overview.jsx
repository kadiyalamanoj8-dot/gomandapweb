import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Play, Square, RefreshCw, ArrowRight, MapPin, Camera,
  MessageCircle, Globe, Database, Briefcase, Image, Clock,
  Trash2, X, Activity, ChevronDown, Check, XCircle, Download,
  FolderOpen, Filter, Send, Settings, TrendingUp, Zap, Target, Map, Users,
  BrainCircuit, ShieldAlert, Cpu, CheckCircle2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useScraper } from '../../context/ScraperContext';
import OmniSearch from '../../components/OmniSearch';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Fix for default leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored markers for clear visual distinction
const validIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const oobIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PIPELINE_STEPS = [
  {
    id: 0,
    name: 'Spelling & Query Parse',
    description: 'Fuse.js Fuzzy Matching',
    icon: Search,
    tech: 'Fuse.js Levenshtein',
    metric: '10ms Execution',
    limit: 'Threshold 0.4',
    detail: 'Auto-corrects search queries and aligns location input against known states, districts, and municipalities.'
  },
  {
    id: 1,
    name: 'Hierarchy Resolution',
    description: 'Llama-3.3-70B AI Parser',
    icon: BrainCircuit,
    tech: 'Llama 3.3 70B Instruct',
    metric: '< 2.5s Latency',
    limit: 'Lazy-loaded',
    detail: 'Intelligently extracts new administrative districts and mandals of India for granular place-by-place coverage.'
  },
  {
    id: 2,
    name: 'Concurrency Dispatcher',
    description: 'BullMQ Priority Queue',
    icon: RefreshCw,
    tech: 'Redis & BullMQ',
    metric: 'Stateful Dispatch',
    limit: '4 / district cap',
    detail: 'Distributes regional targets into queue slots with strict throttling to prevent IP rate-limiting.'
  },
  {
    id: 3,
    name: 'Dual-Engine Crawler',
    description: 'Playwright & Cheerio Workers',
    icon: Cpu,
    tech: 'Playwright Clustered',
    metric: 'Parallel Browsers',
    limit: '4 Max Workers',
    detail: 'Launches concurrent browser instances to extract Google Maps listings, websites, and social handles.'
  },
  {
    id: 4,
    name: 'Quality & Boundary Filter',
    description: 'Ola Maps Boundary Check',
    icon: ShieldAlert,
    tech: 'Ola Boundaries API',
    metric: 'Geofencing Pass',
    limit: 'Strict Bounds',
    detail: 'Performs polygon boundary checks to filter out irrelevant leads and validates phone structure.'
  },
  {
    id: 5,
    name: 'Live Production Sync',
    description: 'MongoDB Dual-Persistence',
    icon: Database,
    tech: 'Mongoose ODM',
    metric: 'Real-time SSE Push',
    limit: 'Dual Sync Enforced',
    detail: 'Persists verified records in MongoDB and pushes them immediately to the live production server and dashboard feed.'
  }
];

const MapBounds = ({ vendors, gridPoints, activePoints, userLocation, autoCenter, setAutoCenter }) => {
  const map = useMap();

  useEffect(() => {
    const handleUserInteraction = () => {
      setAutoCenter(false);
    };

    map.on('dragstart', handleUserInteraction);
    map.on('zoomstart', handleUserInteraction);

    return () => {
      map.off('dragstart', handleUserInteraction);
      map.off('zoomstart', handleUserInteraction);
    };
  }, [map, setAutoCenter]);

  useEffect(() => {
    if (!autoCenter) return; // Allow manual override if user interacts

    let pts = [];
    if (gridPoints && gridPoints.length > 0) {
      pts.push(...gridPoints.filter(p => p && p.lat != null).map(p => [p.lat, p.lng]));
    }
    if (activePoints && activePoints.length > 0) {
      pts.push(...activePoints.filter(p => p && p.lat != null).map(p => [p.lat, p.lng]));
    }
    if (vendors && vendors.length > 0) {
      pts.push(...vendors.slice(0, 50).filter(v => v && v.safeLat != null).map(v => [v.safeLat, v.safeLng]));
    }
    
    if (pts.length === 0 && userLocation && userLocation.length === 2) {
      pts.push(userLocation);
    }

    if (pts.length > 0) {
      const bounds = L.latLngBounds(pts);
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.5 });
    }
  }, [vendors, gridPoints, activePoints, userLocation, autoCenter, map]);
  return null;
};

const DistrictTreeItem = ({ districtName, mandals, distIdx, isDistrictActive, isDistrictDone, completedCount, getMandalStatus }) => {
  const [isOpen, setIsOpen] = useState(isDistrictActive);

  // Auto-expand if district becomes active
  useEffect(() => {
    if (isDistrictActive) {
      setIsOpen(true);
    }
  }, [isDistrictActive]);

  return (
    <div className={`border rounded-xl transition-all duration-200 ${
      isDistrictActive 
        ? 'border-violet-500/35 bg-violet-950/10' 
        : isDistrictDone 
          ? 'border-emerald-500/20 bg-emerald-950/5' 
          : 'border-white/5 bg-white/[0.01]'
    }`}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left font-bold text-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full ${
            isDistrictActive 
              ? 'bg-violet-400 animate-pulse' 
              : isDistrictDone 
                ? 'bg-emerald-400' 
                : 'bg-slate-700'
          }`} />
          <span className={`truncate ${
            isDistrictActive 
              ? 'text-violet-300' 
              : isDistrictDone 
                ? 'text-emerald-300' 
                : 'text-gray-300'
          }`}>
            {districtName}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
            isDistrictActive 
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
              : isDistrictDone 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-slate-800 text-gray-400 border border-slate-700'
          }`}>
            {completedCount} / {mandals.length}
          </span>
          <ChevronDown 
            size={12} 
            className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-0 border-t border-white/5 space-y-1 mt-1 max-h-[150px] overflow-y-auto custom-scrollbar">
          {mandals.map((mandal, mIdx) => {
            const status = getMandalStatus(mandal, districtName, distIdx, mIdx);
            
            return (
              <div 
                key={mandal}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] transition-all text-[11px]"
              >
                <span className={`font-medium truncate ${
                  status === 'running' 
                    ? 'text-cyan-400 font-bold' 
                    : status === 'completed' 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                }`}>
                  {mandal}
                </span>
                
                <div className="flex items-center gap-1 shrink-0">
                  {status === 'running' ? (
                    <>
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                      </span>
                      <span className="text-[8px] uppercase tracking-wider text-cyan-400 font-bold">Active</span>
                    </>
                  ) : status === 'completed' ? (
                    <>
                      <Check size={10} className="text-emerald-400 font-bold" />
                      <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-bold">Done</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[8px] uppercase tracking-wider text-gray-600">Pending</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function OverviewPage() {
  const {
    loading, logs, sseStatus, logLevel, setLogLevel,
    searchRadius, setSearchRadius,
    enabledEngines, setEnabledEngines,
    startScrape, handleMasterStop,
    stagingVendorsWithPhones, stagingVendorsNoPhones, liveVendors, outOfBoundsVendors, verifiedCount,
    modelLoadingStatus, suggestions, showSuggestions, setShowSuggestions,
    suggestionIndex, searchHistory, setSearchHistory,
    showDirectory, setShowDirectory, knowledge,
    handleSearchChange, handleKeyDown,
    categoryQuery, setCategoryQuery,
    locationQuery, setLocationQuery,
    activeInput, setActiveInput,
    searchScope, setSearchScope,
    searchSessionStart,
    handleCategoryChange, handleLocationChange,
    triggerPython, triggerCheerio, triggerMaps,
    vendors, activeJobs, grouped, pushToProd,
    searchContainerRef, terminalRef, gridPoints, gridDensity, setGridDensity,
    activePoints,
    searchProgress
  } = useScraper();

  const [showLog, setShowLog] = useState(false);
  const [userLocation, setUserLocation] = useState([17.3850, 78.4867]); // Default to Hyderabad
  const [autoCenter, setAutoCenter] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hoveredStep, setHoveredStep] = useState(null);

  useEffect(() => {
    if (loading) {
      setAutoCenter(true);
    }
  }, [loading]);

  useEffect(() => {
    let interval;
    if (activeJobs.length > 0 && searchSessionStart) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - searchSessionStart) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [activeJobs, searchSessionStart]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Geolocation error or denied:", error);
        }
      );
    }
  }, []);

  // Dashboard Filtering: show only now extracted (current session) and new/unpushed leads
  const dashboardVendors = (vendors || []).filter(v => {
    if (searchSessionStart && searchSessionStart > 0) {
      return new Date(v.scrapedAt).getTime() >= searchSessionStart;
    }
    return !v.pushed;
  });

  const dashboardStaging = dashboardVendors.filter(v => !v.pushed);
  const dashboardStagingWithPhones = dashboardStaging.filter(v => v.phone && v.phone.length > 5 && !v.phone.includes('Requires'));
  const dashboardStagingNoPhones = dashboardStaging.filter(v => !v.phone || v.phone.length <= 5 || v.phone.includes('Requires'));
  const dashboardLive = dashboardVendors.filter(v => v.pushed);
  const dashboardOutOfBounds = (outOfBoundsVendors || []).filter(v => {
    if (searchSessionStart && searchSessionStart > 0) {
      return new Date(v.scrapedAt).getTime() >= searchSessionStart;
    }
    return true;
  });

  const totalLeads = dashboardVendors.length;
  const withPhone = dashboardStagingWithPhones.length;
  const noPhone = dashboardStagingNoPhones.length;
  const live = dashboardLive.length;

  const rawMapVendors = (!searchSessionStart || searchSessionStart === 0)
    ? []
    : [...dashboardStagingWithPhones, ...dashboardStagingNoPhones, ...dashboardOutOfBounds]
        .filter(v => (v.lat && v.lng) || (v.latitude && v.longitude))
        .map(v => ({...v, safeLat: v.lat || v.latitude, safeLng: v.lng || v.longitude}));

  // Defer map rendering arrays so Leaflet doesn't crash the browser
  const mapVendors = React.useDeferredValue(rawMapVendors);
  const deferredActivePoints = React.useDeferredValue(activePoints || []);

  const isSessionActive = loading || (searchProgress && searchProgress.sessionActive);
  let activeStep = -1;

  if (isSessionActive) {
    if (!searchProgress) {
      activeStep = 0;
    } else if (
      searchProgress.activeDistrict === 'Resolving...' ||
      (searchProgress.activeDistrict && searchProgress.activeDistrict.includes('Resolving')) ||
      searchProgress.activeMandal === 'Calculating...' ||
      (searchProgress.activeMandal && searchProgress.activeMandal.includes('Resolving'))
    ) {
      activeStep = 1;
    } else if (activeJobs.length === 0 && searchProgress.completedMandals === 0) {
      activeStep = 2;
    } else if (activeJobs.length > 0 && dashboardVendors.length === 0) {
      activeStep = 3;
    } else if (activeJobs.length > 0 && dashboardVendors.length > 0) {
      activeStep = 4;
    } else if (searchProgress.activeMandal === 'Complete' || !searchProgress.sessionActive) {
      activeStep = 5;
    } else {
      activeStep = 3;
    }
  }

  // Determine spec to show in HUD
  const activeStepObj = PIPELINE_STEPS[activeStep >= 0 ? activeStep : 0];
  const hoveredStepObj = hoveredStep !== null ? PIPELINE_STEPS[hoveredStep] : null;
  const currentHudSpec = hoveredStepObj || activeStepObj;

  const getMandalStatus = (mandalName, districtName, districtIdx, mandalIdx) => {
    if (!searchProgress) return 'pending';
    
    const activeDist = searchProgress.activeDistrict;
    const compDists = searchProgress.completedDistricts || 0;
    
    if (districtIdx < compDists) {
      return 'completed';
    }
    
    if (activeDist === districtName) {
      const compMandals = searchProgress.completedMandals || 0;
      if (mandalIdx < compMandals) {
        return 'completed';
      }
      if (mandalIdx === compMandals) {
        return 'running';
      }
    }
    
    const key = mandalName.toLowerCase().trim();
    if (searchProgress.targetsMap && searchProgress.targetsMap[key]) {
      return searchProgress.targetsMap[key];
    }
    
    return 'pending';
  };

  return (
    <div className="min-h-full bg-[#f7f8fa]">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Global Omni Search</h1>
            <p className="text-sm text-gray-500 mt-0.5">Search and extract verified business contacts from around the world</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleMasterStop}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all shadow-sm hover:shadow">
              <XCircle size={15} /> Stop All
            </button>
            <button onClick={pushToProd} disabled={verifiedCount === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                verifiedCount > 0
                  ? 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`}>
              <Send size={15} /> Push to Live {verifiedCount > 0 && `(${verifiedCount})`}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: totalLeads, icon: <Database size={18} />, color: 'violet', change: '+' + (activeJobs.length > 0 ? 'collecting' : '0') },
            { label: 'With Phone', value: withPhone, icon: <TrendingUp size={18} />, color: 'green', change: Math.round(totalLeads > 0 ? withPhone / totalLeads * 100 : 0) + '% rate' },
            { label: 'No Contact', value: noPhone, icon: <Target size={18} />, color: 'amber', change: 'recovery pending' },
            { label: 'Live in DB', value: live, icon: <Zap size={18} />, color: 'blue', change: verifiedCount + ' pending push' },
          ].map((stat, i) => {
            const bg = { violet: 'bg-violet-50 text-violet-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600' };
            const num = { violet: 'text-violet-700', green: 'text-green-700', amber: 'text-amber-700', blue: 'text-blue-700' };
            return (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <div className={`p-2 rounded-xl ${bg[stat.color]}`}>{stat.icon}</div>
                </div>
                <p className={`text-3xl font-black ${num[stat.color]}`}>{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* ── SEARCH BOX ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-3 duration-500">
          <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Search size={18} className="text-violet-500" /> Intelligent Search
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                ✨ Type a business type and city, or use natural language. AI semantic search is{' '}
                {modelLoadingStatus?.status === 'ready'
                  ? <span className="text-green-500 font-semibold">active ✓</span>
                  : modelLoadingStatus?.status === 'loading'
                    ? <span className="text-amber-500 font-semibold">loading ({Math.round(modelLoadingStatus.progress || 0)}%)...</span>
                    : <span className="text-gray-400">standby</span>
                }
              </p>
            </div>
            
            {/* Live Indicator */}
            {searchProgress && searchProgress.sessionActive && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-xs font-bold text-rose-600 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                SCRAPING ACTIVE
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Search Inputs & Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                
                <div className="space-y-6">
                  {/* Search Scope Toggle */}
                  <div className="flex justify-center">
                    <div className="inline-flex bg-gray-100 p-1.5 rounded-xl">
                      {[
                        { id: 'exact', label: 'City Only' },
                        { id: 'mandal', label: 'Mandals Level' },
                        { id: 'full', label: 'Full Data (Villages)' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSearchScope(s.id)}
                          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                            searchScope === s.id
                              ? 'bg-white text-violet-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Search Field */}
                  <div className="relative">
                    <OmniSearch 
                      onSearch={(cat, loc) => {
                        setTimeout(() => startScrape(null, cat, loc), 100);
                      }}
                      knowledge={knowledge}
                      history={searchHistory}
                    />
                    
                    {/* Dual-Section Animated Progress Tracker */}
                    <AnimatePresence>
                      {isSessionActive && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, margin: 0 }} 
                          animate={{ opacity: 1, height: 'auto', marginTop: 16, marginBottom: 16 }} 
                          exit={{ opacity: 0, height: 0, margin: 0 }}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl overflow-hidden relative text-left"
                        >
                          {/* Inner glowing effect */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Section: Active Target */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </span>
                                <span className="text-[10px] uppercase font-black tracking-widest text-violet-400">Target Resolution</span>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2.5">
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-0.5">District Scope</span>
                                    <AnimatePresence mode="popLayout">
                                      <motion.p 
                                        key={searchProgress?.activeDistrict}
                                        initial={{ opacity: 0, y: 5 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-xs font-black text-white truncate"
                                      >
                                        {searchProgress?.activeDistrict || 'Resolving...'}
                                      </motion.p>
                                    </AnimatePresence>
                                  </div>
                                  <span className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300">Active</span>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-0.5">Mandal / Local</span>
                                    <AnimatePresence mode="popLayout">
                                      <motion.p 
                                        key={searchProgress?.activeMandal}
                                        initial={{ opacity: 0, y: 5 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-xs font-black text-cyan-400 truncate"
                                      >
                                        {searchProgress?.activeMandal || 'Resolving...'}
                                      </motion.p>
                                    </AnimatePresence>
                                  </div>
                                  <span className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">Active</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Section: Progress Indicators & ETA */}
                            <div className="space-y-3 flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
                                  <Activity size={10} className="animate-pulse" /> Dispatch HUD
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-lg">
                                  <Clock size={10} className="animate-spin-slow" />
                                  <span>ETA: {searchProgress?.eta || 'Calculating...'}</span>
                                </div>
                              </div>

                              <div className="space-y-3.5">
                                {/* District Progress */}
                                <div>
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-gray-400 font-bold">Districts Completed</span>
                                    <span className="font-mono font-black text-white">
                                      {searchProgress?.completedDistricts || 0} / {searchProgress?.totalDistricts || 1}
                                    </span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, Math.round(((searchProgress?.completedDistricts || 0) / (searchProgress?.totalDistricts || 1)) * 100))}%` }}
                                      transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                  </div>
                                </div>

                                {/* Mandal Progress */}
                                <div>
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-gray-400 font-bold">Overall Mandals Checked</span>
                                    <span className="font-mono font-bold text-cyan-400">
                                      {searchProgress?.overallCompletedMandals || 0} / {searchProgress?.totalMandalsAcrossAll || 1}
                                    </span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                      className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min(100, Math.round(((searchProgress?.overallCompletedMandals || 0) / (searchProgress?.totalMandalsAcrossAll || 1)) * 100))}%` }}
                                      transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Velocity stats footer inside progress container */}
                          {activeJobs.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-gray-400 font-medium">
                              <div>
                                <span className="text-gray-500 uppercase tracking-wider block">Scraping Velocity</span>
                                <span className="text-white font-bold">{activeJobs.length} / 20 Instances</span>
                              </div>
                              <div>
                                <span className="text-gray-500 uppercase tracking-wider block">Time Elapsed</span>
                                <span className="text-yellow-400 font-bold font-mono">{Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s</span>
                              </div>
                              <div>
                                <span className="text-gray-500 uppercase tracking-wider block">Extraction Rate</span>
                                <span className="text-blue-400 font-bold">~{elapsedTime > 0 ? (vendors.length / elapsedTime).toFixed(1) : 0} leads/sec</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>


                  </div>



                  {/* Collapsible State Hierarchy Tree Panel */}
                  <AnimatePresence mode="wait">
                    {isSessionActive && searchProgress && searchProgress.fullHierarchy ? (
                      <motion.div 
                        key="active-map"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative text-left"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                          <span className="text-[10px] uppercase font-black tracking-widest text-violet-400 flex items-center gap-1.5 font-bold">
                            <Map size={11} /> Geographic Dispatch Map
                          </span>
                          <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded font-bold">
                            {searchProgress.fullHierarchy.length} Districts Resolved
                          </span>
                        </div>
                        
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {searchProgress.fullHierarchy.map((distObj, distIdx) => {
                            const districtName = distObj.districtName;
                            const mandalsList = distObj.mandals || [];
                            const isDistrictActive = searchProgress.activeDistrict === districtName;
                            
                            // Count completed mandals for this district
                            const completedCount = mandalsList.reduce((acc, m, mIdx) => {
                              const status = getMandalStatus(m, districtName, distIdx, mIdx);
                              return status === 'completed' ? acc + 1 : acc;
                            }, 0);
                            
                            const isDistrictDone = completedCount === mandalsList.length;
                            
                            return (
                              <DistrictTreeItem 
                                key={districtName}
                                districtName={districtName}
                                mandals={mandalsList}
                                distIdx={distIdx}
                                isDistrictActive={isDistrictActive}
                                isDistrictDone={isDistrictDone}
                                completedCount={completedCount}
                                getMandalStatus={getMandalStatus}
                              />
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="standby-map"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="bg-slate-950/80 border border-slate-900 border-dashed rounded-2xl p-5 text-center transition-all duration-300"
                      >
                        <Map className="mx-auto text-slate-700 animate-pulse mb-2" size={22} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geographic Dispatch Map Standby</p>
                        <p className="text-[10px] text-slate-600 mt-1 max-w-xs mx-auto">Select search scope (City, Mandal, or Villages), define location, and trigger omni-search to activate the real-time worker pipeline.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* MASTER CONTROL */}
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Master Engines Control</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Python Engine Search */}
                    <button type="button"
                      onClick={() => {
                        triggerPython(categoryQuery, locationQuery);
                      }}
                      className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-xs font-bold border bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 transition-all shadow-sm">
                      <span className="text-base">🐍</span> Python Engine
                    </button>
                    
                    {/* Google Maps Scraper Search */}
                    <button type="button"
                      onClick={() => {
                        triggerMaps(`${categoryQuery} in ${locationQuery}`, categoryQuery, locationQuery, searchRadius);
                      }}
                      className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-xs font-bold border bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 transition-all shadow-sm">
                      <MapPin size={14} className="text-blue-600" /> Google Maps
                    </button>

                    {/* Launch Master Omni-Search */}
                    <button type="button"
                      onClick={() => {
                        startScrape(null, categoryQuery, locationQuery);
                      }}
                      className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-xs font-bold shadow-lg shadow-violet-500/25 border bg-violet-600 text-white border-violet-600 hover:bg-violet-700 transition-all">
                      <span className="text-base">✨</span> Launch Omni-Search
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Scraper Pipeline Control Center (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="flex-1 flex flex-col justify-between bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden h-full min-h-[640px] animate-in fade-in duration-500">
                  {/* Decorative background glows */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div>
                    {/* HUD Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Scraper Control</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">Pipeline Control Center</h3>
                      </div>
                      
                      {isSessionActive ? (
                        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-rose-400 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          ACTIVE
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-800/60 border border-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          STANDBY
                        </div>
                      )}
                    </div>

                    {/* Live Extraction target (Shown when session is active) */}
                    {isSessionActive && (
                      <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                        <div className="border-l-2 border-indigo-500/40 pl-2.5 min-w-0">
                          <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block mb-0.5">District Scope</span>
                          <p className="text-xs font-bold text-white truncate" title={searchProgress?.activeDistrict}>
                            {searchProgress?.activeDistrict || 'Resolving...'}
                          </p>
                        </div>
                        <div className="border-l-2 border-cyan-500/40 pl-2.5 min-w-0">
                          <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block mb-0.5">Mandal / Local</span>
                          <p className="text-xs font-bold text-cyan-400 truncate" title={searchProgress?.activeMandal}>
                            {searchProgress?.activeMandal || 'Resolving...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* The 6-Stage Pipeline List */}
                    <div className="mt-4 space-y-2">
                      {PIPELINE_STEPS.map((step, idx) => {
                        const IconComponent = step.icon;
                        const isStepActive = activeStep === idx;
                        const isStepCompleted = activeStep > idx;
                        
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredStep(idx)}
                            onMouseLeave={() => setHoveredStep(null)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-help ${
                              isStepActive
                                ? 'bg-violet-950/35 border-violet-500/60 shadow-lg shadow-violet-500/10'
                                : isStepCompleted
                                  ? 'bg-emerald-950/15 border-emerald-500/30 opacity-90'
                                  : isSessionActive
                                    ? 'bg-white/[0.01] border-white/5 opacity-40'
                                    : 'bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                                isStepActive
                                  ? 'bg-violet-500/20 border-violet-400 text-violet-300 shadow shadow-violet-500/35 animate-pulse'
                                  : isStepCompleted
                                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                    : 'bg-white/5 border-white/5 text-gray-400'
                              }`}>
                                <IconComponent size={14} className={isStepActive ? 'animate-bounce' : ''} />
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate transition-colors ${
                                  isStepActive
                                    ? 'text-violet-300'
                                    : isStepCompleted
                                      ? 'text-emerald-300 font-semibold'
                                      : 'text-gray-300'
                                }`}>
                                  {step.name}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">{step.description}</p>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1.5">
                              {isStepActive ? (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </span>
                              ) : isStepCompleted ? (
                                <Check size={12} className="text-emerald-400 font-bold" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                              )}
                              <span className={`text-[9px] uppercase tracking-wider font-black ${
                                isStepActive
                                  ? 'text-violet-400'
                                  : isStepCompleted
                                    ? 'text-emerald-400'
                                    : 'text-gray-500'
                              }`}>
                                {isStepActive ? 'Active' : isStepCompleted ? 'Done' : 'Standby'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Section: Live Counters & Spec HUD */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-4">
                    {/* Live Progress Indicators (Shown when session is active) */}
                    {isSessionActive && searchProgress && (
                      <div className="space-y-3 bg-white/[0.01] border border-white/5 rounded-xl p-3 animate-in fade-in duration-300">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-gray-300">Districts Completed</span>
                            <span className="text-[11px] font-mono font-black text-white">
                              {searchProgress.completedDistricts} / {searchProgress.totalDistricts || 1}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((searchProgress.completedDistricts / (searchProgress.totalDistricts || 1)) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-gray-300">Mandals in Current District</span>
                            <span className="text-[11px] font-mono font-black text-cyan-400">
                              {searchProgress.completedMandals} / {searchProgress.totalMandals || 1}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((searchProgress.completedMandals / (searchProgress.totalMandals || 1)) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-indigo-200 bg-indigo-950/20 border border-indigo-500/10 p-2 rounded-lg mt-1">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock size={12} className="text-yellow-400 animate-pulse" /> Scraping Time (Approx):
                          </span>
                          <span className="font-mono font-black text-yellow-400 tracking-wider">
                            {searchProgress.eta || 'Calculating...'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Spec Intel HUD */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 text-xs relative overflow-hidden transition-all duration-200">
                      <div className="flex items-center justify-between mb-1 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                        <span>Spec Intel HUD</span>
                        <span className="text-indigo-400 font-mono">{currentHudSpec.tech}</span>
                      </div>
                      <p className="text-white font-bold text-xs">{currentHudSpec.name}</p>
                      <p className="text-gray-400 mt-1 leading-relaxed text-[11px] min-h-[32px]">{currentHudSpec.detail}</p>
                      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] text-gray-400 font-mono">
                        <span>Metric: <strong className="text-indigo-300 font-semibold">{currentHudSpec.metric}</strong></span>
                        <span>Limit: <strong className="text-yellow-400 font-semibold">{currentHudSpec.limit}</strong></span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── ACTIVITY LOG (Admin Only) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button onClick={() => setShowLog(!showLog)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${sseStatus === 'open' ? 'bg-green-400 animate-pulse' : sseStatus === 'connecting' ? 'bg-amber-400' : 'bg-red-400'}`} />
                <Activity size={16} className="text-gray-500" />
                <span className="font-bold text-gray-700">Service Activity Log</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider
                bg-gray-50 text-gray-400 border-gray-100">
                Admin Only
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                sseStatus === 'open' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
              }`}>
                {sseStatus?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select value={logLevel} onChange={e => setLogLevel(e.target.value)}
                onClick={e => e.stopPropagation()}
                className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-gray-500 font-medium outline-none">
                <option value="ALL">All Levels</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warn</option>
                <option value="ERROR">Error</option>
                <option value="DEBUG">Debug</option>
              </select>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showLog ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showLog && (
            <div className="overflow-hidden border-t border-gray-100">
              <div ref={terminalRef} className="h-80 overflow-y-auto p-5 font-mono text-[11px] leading-loose bg-gray-950 text-gray-300"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                {logs?.length === 0
                  ? <span className="text-gray-600">No logs yet. Start a scrape to see activity.</span>
                  : [...(logs || [])].filter(l => !logLevel || logLevel === 'ALL' || l.includes(`[${logLevel}]`)).slice(-50).reverse().map((log, i) => {
                      const isError = log.includes('[ERROR]');
                      const isWarn = log.includes('[WARN]');
                      const isInfo = log.includes('[INFO]');
                      return (
                        <div key={i} className={`break-words py-0.5 border-b border-gray-900 ${isError ? 'text-red-400' : isWarn ? 'text-amber-400' : isInfo ? 'text-green-400' : 'text-gray-400'}`}>
                          <span className="text-gray-600 mr-2">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                          {log}
                        </div>
                      );
                    })
                }
              </div>
            </div>
          )}
        </div>

        {/* ── LIVE VENDORS FEED ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Zap size={18} className="text-violet-500" /> Live Vendor Feed
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Updates</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {dashboardStagingWithPhones.length === 0 && dashboardStagingNoPhones.length === 0 ? (
              <p className="text-sm text-gray-500">No leads extracted yet. Start a scrape!</p>
            ) : (
              [...dashboardStagingWithPhones, ...dashboardStagingNoPhones]
                .sort((a, b) => new Date(b.scrapedAt || 0) - new Date(a.scrapedAt || 0))
                .slice(0, 5) // Show top 5 recent
                .map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                        {v.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{v.name}</p>
                        <p className="text-[10px] text-gray-500">{v.category} · {v.city}</p>
                      </div>
                    </div>
                    {v.phone && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md">
                        {v.phone}
                      </span>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* ── LIVE MAP FEED ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Map size={18} className="text-violet-500" /> Live Geographic Tracker
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{mapVendors.length} Pins {dashboardOutOfBounds?.length > 0 && `(${dashboardOutOfBounds.length} Out of Bounds)`}</span>
            </div>
          </div>
          
          {/* Live Active Scanners Overlay HUD - Moved completely OUTSIDE the map to prevent Leaflet Z-Index hiding */}
          <AnimatePresence>
            {activePoints?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mb-4 w-full bg-white rounded-xl border border-amber-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="animate-pulse" /> Live Scanners ({activePoints.length} Instances)
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                </div>
                <div className="max-h-24 overflow-y-auto flex flex-wrap gap-2 p-2 bg-amber-50/30" style={{ scrollbarWidth: 'thin' }}>
                  {deferredActivePoints.map((pt, i) => (
                    <div key={i} className="bg-white border border-amber-100 rounded shadow-sm px-2.5 py-1.5 flex-grow min-w-[200px] max-w-[250px] hover:border-amber-300 transition-colors">
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{pt.locationName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Worker {pt.instanceId}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{Number(pt.lat || 0).toFixed(4)}, {Number(pt.lng || 0).toFixed(4)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-100 group">
              {/* Custom Map Controls */}
              <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setAutoCenter(true)} className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 text-violet-600 hover:bg-violet-50 hover:scale-105 transition-all" title="Recenter to active search">
                  <MapPin size={20} />
                </button>
              </div>

              <MapContainer 
                center={userLocation} 
                zoom={5} 
                style={{ width: '100%', height: '100%' }} 
                zoomControl={true}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
                <MapBounds vendors={mapVendors} gridPoints={gridPoints} activePoints={deferredActivePoints} userLocation={userLocation} autoCenter={autoCenter} setAutoCenter={setAutoCenter} />
                
                {/* Render Grid Points */}
                {gridPoints?.length > 0 && gridPoints[0] && (gridPoints[0].activeRadius || gridPoints[0].maxRadiusKm) > 0 && gridPoints[0].lat != null && (
                  <Circle 
                    center={[gridPoints[0].lat, gridPoints[0].lng]} 
                    radius={(gridPoints[0].activeRadius || gridPoints[0].maxRadiusKm) * 1000} 
                    pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.1, dashArray: '5, 10' }} 
                  />
                )}

                {gridPoints?.filter(pt => pt && pt.lat != null).map((pt, i) => (
                  <CircleMarker key={`grid-${i}`} center={[pt.lat, pt.lng]} radius={i === 0 ? 8 : 4} color={i === 0 ? "#ef4444" : "#8b5cf6"} fillColor={i === 0 ? "#ef4444" : "#8b5cf6"} fillOpacity={0.6}>
                    <Popup>
                      <div className="text-xs p-1">
                        <p className="font-bold mb-1">{i === 0 ? 'Center Pin' : `Search Point ${i+1}`}</p>
                        <p className="text-gray-500">Radius Dist: {Number(pt.distanceFromCenter || 0).toFixed(2)}km</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Render Blinking Active Points */}
                {deferredActivePoints?.filter(pt => pt && pt.lat != null).map((pt, i) => (
                  <CircleMarker key={`active-${i}`} center={[pt.lat, pt.lng]} radius={10} 
                    className="animate-ping"
                    color="#eab308" fillColor="#eab308" fillOpacity={0.9} stroke={false}>
                  </CircleMarker>
                ))}
                {deferredActivePoints?.filter(pt => pt && pt.lat != null).map((pt, i) => (
                  <CircleMarker key={`active-solid-${i}`} center={[pt.lat, pt.lng]} radius={6} 
                    color="#ca8a04" fillColor="#fef08a" fillOpacity={1}>
                    <Popup>
                      <div className="text-xs p-1">
                        <p className="font-bold text-yellow-700 mb-1">🔥 Active Scanner (Worker {pt.instanceId})</p>
                        <p className="text-gray-600 mb-1">{pt.locationName}</p>
                        <p className="text-gray-500 text-[10px] font-mono">{Number(pt.lat || 0).toFixed(5)}, {Number(pt.lng || 0).toFixed(5)}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
                  {mapVendors.filter(v => v && v.safeLat != null).map((vendor, i) => (
                    <Marker 
                      key={`vendor-${i}`} 
                      position={[vendor.safeLat, vendor.safeLng]}
                      icon={vendor.source === 'Google Maps (Out of Bounds)' ? oobIcon : validIcon}
                    >
                      <Popup>
                        <div className="text-xs p-1">
                          <p className="font-bold text-gray-900 mb-1">{vendor.name}</p>
                          <p className="text-gray-600 mb-2">{vendor.category} &middot; {vendor.city}</p>
                          <p className="text-gray-500 font-mono mb-2">{vendor.phone}</p>
                          {vendor.source === 'Google Maps (Out of Bounds)' && (
                            <p className="text-red-500 font-bold mb-2">Out of Bounds: {vendor.outOfBoundsDistance}km</p>
                          )}
                          <a href={vendor.mapsLink} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1">
                            View on Maps <ArrowRight size={10} />
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
          </div>
        </div>

        {/* ── QUICK STATS BY CATEGORY ── */}
        {dashboardVendors?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Category Breakdown</h2>
              <a href="/app/leads" className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                View All Leads <ArrowRight size={12} />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(
                dashboardVendors.reduce((acc, v) => {
                  const cat = v.category || 'Uncategorized';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(v);
                  return acc;
                }, {})
              )
              .sort((a, b) => b[1].length - a[1].length)
              .slice(0, 8)
              .map(([cat, items], i) => (
                <motion.a 
                  key={cat} 
                  href={`/app/leads`} // Basic routing, context state would be better, but href resets state.
                  onClick={() => {
                    // Pre-fill activeCategory via localStorage before navigating so leads page picks it up
                    localStorage.setItem('gomandap_active_category', cat);
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="block p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-violet-300 hover:bg-violet-50/50 hover:-translate-y-1 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <p className="text-xs font-semibold text-gray-600 truncate" title={cat}>{cat}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{items.length}</p>
                  <p className="text-[10px] text-gray-400">{items.filter(v => v.verified).length} verified</p>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

