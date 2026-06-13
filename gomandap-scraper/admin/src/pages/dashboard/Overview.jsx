import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Play, Square, RefreshCw, ArrowRight, MapPin, Camera,
  MessageCircle, Globe, Database, Briefcase, Image, Clock,
  Trash2, X, Activity, ChevronDown, Check, XCircle, Download,
  FolderOpen, Filter, Send, Settings, TrendingUp, Zap, Target, Map, Users
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useScraper } from '../../context/ScraperContext';
import OmniSearch from '../../components/OmniSearch';

// Fix for default leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapBounds = ({ vendors, gridPoints }) => {
  const map = useMap();
  useEffect(() => {
    let pts = [];
    if (vendors && vendors.length > 0) pts.push(...vendors.map(v => [v.safeLat, v.safeLng]));
    if (gridPoints && gridPoints.length > 0) pts.push(...gridPoints.map(p => [p.lat, p.lng]));
    
    if (pts.length > 0) {
      const bounds = L.latLngBounds(pts);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [vendors, gridPoints, map]);
  return null;
};

export default function OverviewPage() {
  const {
    loading, logs, sseStatus, logLevel, setLogLevel,
    searchRadius, setSearchRadius,
    enabledEngines, setEnabledEngines,
    startScrape, handleMasterStop,
    stagingVendorsWithPhones, stagingVendorsNoPhones, liveVendors, verifiedCount,
    modelLoadingStatus, suggestions, showSuggestions, setShowSuggestions,
    suggestionIndex, searchHistory, setSearchHistory,
    showDirectory, setShowDirectory, knowledge,
    handleSearchChange, handleKeyDown,
    categoryQuery, setCategoryQuery,
    locationQuery, setLocationQuery,
    activeInput, setActiveInput,
    searchScope, setSearchScope,
    handleCategoryChange, handleLocationChange,
    triggerPython, triggerCheerio, triggerMaps,
    vendors, activeJobs, grouped, pushToProd,
    searchContainerRef, terminalRef, gridPoints, gridDensity, setGridDensity,
    activePoints
  } = useScraper();

  const [showLog, setShowLog] = useState(false);

  const PLATFORMS = [
    { id: 'maps', label: 'Maps & Location', icon: <MapPin size={14} />, desc: 'Google Maps & local directories' },
    { id: 'instagram', label: 'Instagram', icon: <Camera size={14} />, desc: 'Business profiles & contacts' },
    { id: 'google-web', label: 'Universal Web Search', icon: <Globe size={14} />, desc: 'Global organic web scraper' },
    { id: 'justdial', label: 'Justdial', icon: <Globe size={14} />, desc: 'India\'s top business directory' },
    { id: 'firebase', label: 'Cloud Sync', icon: <Database size={14} />, desc: 'Sync with live database' },
  ];

  const totalLeads = vendors?.length || 0;
  const withPhone = stagingVendorsWithPhones?.length || 0;
  const noPhone = stagingVendorsNoPhones?.length || 0;
  const live = liveVendors?.length || 0;

  const mapVendors = [...(stagingVendorsWithPhones || []), ...(stagingVendorsNoPhones || [])]
    .filter(v => (v.lat && v.lng) || (v.latitude && v.longitude))
    .map(v => ({...v, safeLat: v.lat || v.latitude, safeLng: v.lng || v.longitude}))
    .slice(0, 50);



  return (
    <div className="min-h-full bg-[#f7f8fa]">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Lead Scraper</h1>
            <p className="text-sm text-gray-500 mt-0.5">Search and extract verified business contacts from multiple sources</p>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Search size={18} className="text-violet-500" /> Intelligent Search
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              ✨ Type a business type and city, or use natural language (e.g., <i>"I want a complete list of photographers in Guntur"</i>). AI semantic search is{' '}
              {modelLoadingStatus?.status === 'ready'
                ? <span className="text-green-500 font-semibold">active ✓</span>
                : modelLoadingStatus?.status === 'loading'
                  ? <span className="text-amber-500 font-semibold">loading ({Math.round(modelLoadingStatus.progress || 0)}%)...</span>
                  : <span className="text-gray-400">standby</span>
              }
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6 flex justify-center">
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

            <div className="mb-6">
              <OmniSearch 
                onSearch={(cat, loc) => {
                  setTimeout(() => startScrape(null, cat, loc), 10);
                }}
                knowledge={knowledge}
                history={searchHistory}
              />
            </div>

            {/* Platform selectors */}
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-3">Extract From</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { id: 'maps', label: 'Google Maps', icon: <MapPin size={13} />, color: 'blue' },
                  { id: 'instagram', label: 'Instagram', icon: <Camera size={13} />, color: 'pink' },
                  { id: 'facebook', label: 'Facebook', icon: <Globe size={13} />, color: 'blue' },
                  { id: 'youtube', label: 'YouTube', icon: <Target size={13} />, color: 'red' },
                  { id: 'pinterest', label: 'Pinterest', icon: <Globe size={13} />, color: 'red' },
                  { id: 'linkedin', label: 'LinkedIn', icon: <Users size={13} />, color: 'blue' },
                ].map(p => (
                  <button key={p.id} type="button" onClick={() => setEnabledEngines(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      enabledEngines.includes(p.id)
                        ? `bg-${p.color}-50 text-${p.color}-700 border-${p.color}-200 shadow-sm`
                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                    }`}>
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse directory */}
            {knowledge && (
              <div>
                <button type="button" onClick={() => setShowDirectory(!showDirectory)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors">
                  <FolderOpen size={13} />
                  {showDirectory ? 'Hide' : 'Browse'} Categories & Locations
                  <ChevronDown size={13} className={`transition-transform ${showDirectory ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showDirectory && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-4 grid grid-cols-2 gap-6 overflow-hidden">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                        <div className="h-40 overflow-y-auto flex flex-wrap gap-1.5 content-start pr-2">
                          {knowledge.categories?.map((c, i) => (
                            <button key={i} type="button"
                              onClick={() => { setCategoryQuery(c); setShowDirectory(false); searchContainerRef.current?.querySelector('input')?.focus(); }}
                              className="text-xs px-2.5 py-1.5 bg-gray-50 hover:bg-violet-50 hover:text-violet-700 border border-gray-100 hover:border-violet-200 rounded-lg text-gray-600 transition-all font-medium">
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Top Cities</p>
                        <div className="h-40 overflow-y-auto flex flex-wrap gap-1.5 content-start pr-2">
                          {knowledge.locations?.filter(l => l.type === 'district').map((l, i) => (
                            <button key={i} type="button"
                              onClick={() => { setLocationQuery(l.name); setShowDirectory(false); }}
                              className="text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg transition-all font-medium">
                              {l.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* MASTER CONTROL */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Master Control</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button type="button"
                  onClick={() => {
                    const q = document.getElementById('manualQuery').value;
                    const l = document.getElementById('manualLocation').value;
                    triggerPython(q, l);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-all">
                  <span className="text-lg">🐍</span> Python Engine
                </button>
                
                <button type="button"
                  onClick={() => {
                    startScrape(null, `${categoryQuery} in ${locationQuery}`, enabledEngines); // Pass ALL enabled engines
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold shadow-lg shadow-violet-500/20 border bg-violet-600 text-white hover:bg-violet-700 transition-all w-full col-span-2">
                  <span className="text-xl">✨</span> Launch Master Omni-Search
                </button>
                
                <button type="button"
                  onClick={() => {
                    const q = document.getElementById('manualQuery').value;
                    const l = document.getElementById('manualLocation').value;
                    triggerMaps(q, q, l, searchRadius);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-all">
                  <MapPin size={16} /> Google Maps
                </button>
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

          <AnimatePresence>
            {showLog && (
              <motion.div initial={{ height: 0 }} animate={{ height: 320 }} exit={{ height: 0 }}
                className="overflow-hidden border-t border-gray-100">
                <div ref={terminalRef} className="h-80 overflow-y-auto p-5 font-mono text-[11px] leading-loose bg-gray-950 text-gray-300"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
                  {logs?.length === 0
                    ? <span className="text-gray-600">No logs yet. Start a scrape to see activity.</span>
                    : [...(logs || [])].filter(l => !logLevel || logLevel === 'ALL' || l.includes(`[${logLevel}]`)).slice(-200).reverse().map((log, i) => {
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
              </motion.div>
            )}
          </AnimatePresence>
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
            {stagingVendorsWithPhones.length === 0 && stagingVendorsNoPhones.length === 0 ? (
              <p className="text-sm text-gray-500">No leads extracted yet. Start a scrape!</p>
            ) : (
              [...stagingVendorsWithPhones, ...stagingVendorsNoPhones]
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{mapVendors.length} Pins</span>
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
                  {activePoints.map((pt, i) => (
                    <div key={i} className="bg-white border border-amber-100 rounded shadow-sm px-2.5 py-1.5 flex-grow min-w-[200px] max-w-[250px] hover:border-amber-300 transition-colors">
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{pt.locationName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Worker {pt.instanceId}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-100">
            {mapVendors.length > 0 || gridPoints?.length > 0 ? (
              <MapContainer center={mapVendors.length > 0 ? [mapVendors[0].safeLat, mapVendors[0].safeLng] : [gridPoints[0].lat, gridPoints[0].lng]} zoom={11} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <MapBounds vendors={mapVendors} gridPoints={gridPoints} />
                
                {/* Render Grid Points */}
                {gridPoints?.length > 0 && gridPoints[0].maxRadiusKm > 0 && (
                  <Circle 
                    center={[gridPoints[0].lat, gridPoints[0].lng]} 
                    radius={gridPoints[0].maxRadiusKm * 1000} 
                    pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.1, dashArray: '5, 10' }} 
                  />
                )}

                {gridPoints?.map((pt, i) => (
                  <CircleMarker key={`grid-${i}`} center={[pt.lat, pt.lng]} radius={i === 0 ? 8 : 4} color={i === 0 ? "#ef4444" : "#8b5cf6"} fillColor={i === 0 ? "#ef4444" : "#8b5cf6"} fillOpacity={0.6}>
                    <Popup>
                      <div className="text-xs p-1">
                        <p className="font-bold mb-1">{i === 0 ? 'Center Pin' : `Search Point ${i+1}`}</p>
                        <p className="text-gray-500">Radius Dist: {pt.distanceFromCenter ? pt.distanceFromCenter.toFixed(2) : 0}km</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Render Blinking Active Points */}
                {activePoints?.map((pt, i) => (
                  <CircleMarker key={`active-${i}`} center={[pt.lat, pt.lng]} radius={10} 
                    className="animate-ping"
                    color="#eab308" fillColor="#eab308" fillOpacity={0.9} stroke={false}>
                  </CircleMarker>
                ))}
                {activePoints?.map((pt, i) => (
                  <CircleMarker key={`active-solid-${i}`} center={[pt.lat, pt.lng]} radius={6} 
                    color="#ca8a04" fillColor="#fef08a" fillOpacity={1}>
                    <Popup>
                      <div className="text-xs p-1">
                        <p className="font-bold text-yellow-700 mb-1">🔥 Active Scanner (Worker {pt.instanceId})</p>
                        <p className="text-gray-600 mb-1">{pt.locationName}</p>
                        <p className="text-gray-500 text-[10px] font-mono">{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {mapVendors.map((vendor, i) => (
                  <Marker key={`vendor-${i}`} position={[vendor.safeLat, vendor.safeLng]}>
                    <Popup>
                      <div className="text-xs p-1">
                        <p className="font-bold text-gray-900 mb-1">{vendor.name}</p>
                        <p className="text-gray-500 mb-1">{vendor.category}</p>
                        {vendor.phone && <p className="text-green-600 font-semibold">{vendor.phone}</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 flex-col gap-3">
                <Map size={32} className="opacity-20" />
                <p className="font-bold text-sm">Waiting for geographic data...</p>
              </div>
            )}
          </div>
        </div>

        {/* ── QUICK STATS BY CATEGORY ── */}
        {Object.keys(grouped || {}).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Category Breakdown</h2>
              <a href="/app/leads" className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                View All Leads <ArrowRight size={12} />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(grouped).slice(0, 8).map(([cat, items]) => (
                <div key={cat} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                  <p className="text-xs font-semibold text-gray-600 truncate" title={cat}>{cat}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{items.length}</p>
                  <p className="text-[10px] text-gray-400">{items.filter(v => v.verified).length} verified</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

