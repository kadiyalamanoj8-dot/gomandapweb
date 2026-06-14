import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, RefreshCw, Phone, Mail, Camera,
  MapPin, Star, CheckCircle2, XCircle, Trash2, X, ChevronDown,
  Users, Database, TrendingUp, Map, List, FolderOpen,
  ExternalLink, Globe, Send, ArrowRight, Eye
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FixedSizeList as ListWindow } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useScraper } from '../../context/ScraperContext';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapBounds = ({ vendors, autoCenter }) => {
  const map = useMap();
  useEffect(() => {
    if (!autoCenter) return;
    if (vendors && vendors.length > 0) {
      const bounds = L.latLngBounds(vendors.map(v => [v.safeLat, v.safeLng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [vendors, map, autoCenter]);
  return null;
};
const STATUS_COLORS = {
  New: 'bg-gray-100 text-gray-600 border-gray-200',
  Contacted: 'bg-blue-50 text-blue-600 border-blue-100',
  Interested: 'bg-green-50 text-green-600 border-green-100',
  Closed: 'bg-violet-50 text-violet-600 border-violet-100',
  NotInterested: 'bg-red-50 text-red-500 border-red-100',
};

export default function LeadsPage() {
  const {
    grouped, filteredVendors, displayedVendors,
    stagingVendorsWithPhones, stagingVendorsNoPhones, liveVendors,
    vendors, activeTab, setActiveTab,
    searchFilter, setSearchFilter,
    selectedCity, setSelectedCity, cities,
    fetchVendors, handleVerify, handleDelete, handleAssign,
    exportToCSV, exportCategoryCSV, clearQueue,
    employees, activeJobs, loading, handleUpdateJob,
    selectedFolder, setSelectedFolder,
    selectedJobCategory, setSelectedJobCategory,
    grouped: groupedData,
    outOfBoundsVendors,
    searchSessionStart
  } = useScraper();

  const [view, setView] = useState('folders'); // 'folders' | 'list' | 'map'
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    const preCategory = localStorage.getItem('gomandap_active_category');
    if (preCategory) {
      // Find the folder key that matches this category (since folders are "Category in City")
      // Actually, if we want to view all leads for this category, we might just set search filter?
      // Wait, folders are exact keys of groupedData. If the user clicked "Photographers", they might want to see all Photographers.
      setSearchFilter(preCategory);
      setView('list'); // Show list view with search filter applied
      localStorage.removeItem('gomandap_active_category');
    }
  }, [setSearchFilter]);
  const mapRef = useRef(null);

  const tabs = [
    { id: 'staging', label: 'Extracted Leads', count: (stagingVendorsWithPhones?.length || 0) + (stagingVendorsNoPhones?.length || 0), color: 'green' },
    { id: 'out-of-bounds', label: 'Out of Bounds', count: outOfBoundsVendors?.length || 0, color: 'gray' },
    { id: 'pushed', label: 'Live Database', count: liveVendors?.length || 0, color: 'violet' },
  ];

  const rawMapVendors = (filteredVendors || [])
    .filter(v => (v.lat && v.lng) || (v.latitude && v.longitude))
    .filter(v => {
      // If a search is currently active, instantly clear old pins from the map
      if (searchSessionStart && activeJobs.length > 0) {
        return new Date(v.scrapedAt).getTime() >= searchSessionStart;
      }
      // If no active search, show the pins from the selected tab/filter
      return true;
    })
    .map(v => ({...v, safeLat: v.lat || v.latitude, safeLng: v.lng || v.longitude}));

  const mapVendors = React.useDeferredValue(rawMapVendors);
  const [autoCenter, setAutoCenter] = useState(true);
  const getCityFromFilter = () => selectedCity !== 'All' ? selectedCity : 'India';

  return (
    <div className="min-h-full bg-[#f7f8fa]">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Leads Pipeline</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review, verify, and manage all extracted business contacts</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggles */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
              {[
                { id: 'folders', icon: <FolderOpen size={14} />, label: 'Folders' },
                { id: 'list', icon: <List size={14} />, label: 'List' },
                { id: 'map', icon: <Map size={14} />, label: 'Map' },
              ].map(v => (
                <button key={v.id} onClick={() => setView(v.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
            <button onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all">
              <Download size={15} /> Export CSV
            </button>
            <button onClick={clearQueue}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all">
              <Trash2 size={15} /> Clear Queue
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">

        {/* ── TAB BAR ── */}
        <div className="flex items-center gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            const colors = {
              green: active ? 'bg-green-50 text-green-700 border border-green-100' : 'hover:bg-gray-50 text-gray-500',
              amber: active ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'hover:bg-gray-50 text-gray-500',
              violet: active ? 'bg-violet-50 text-violet-700 border border-violet-100' : 'hover:bg-gray-50 text-gray-500',
              gray: active ? 'bg-gray-100 text-gray-700 border border-gray-200' : 'hover:bg-gray-50 text-gray-500',
            };
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${colors[tab.color]}`}>
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-black ${active ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                  {tab.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── FILTERS BAR ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter by name, phone, category..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all shadow-sm" />
          </div>
          <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-violet-300 shadow-sm">
            {(cities || ['All']).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={fetchVendors}
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-violet-600 hover:border-violet-200 transition-all shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="text-xs font-semibold text-gray-400 ml-auto">
            {filteredVendors?.length?.toLocaleString() || 0} results
          </div>
        </div>

        {/* ── VIEWS ── */}

        {/* FOLDER VIEW */}
            {view === 'folders' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(groupedData || {}).length === 0 ? (
              <div className="col-span-4 py-24 flex flex-col items-center text-center text-gray-400">
                <Database size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-gray-500">No leads found</p>
                <p className="text-sm mt-1">Start a search from the Scraper page to extract leads</p>
                <a href="/app/overview" className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2">
                  Go to Scraper <ArrowRight size={14} />
                </a>
              </div>
            ) : (
              Object.entries(groupedData).sort((a, b) => b[1].length - a[1].length).map(([cat, items]) => {
                const verified = items.filter(v => v.verified).length;
                const withPhone = items.filter(v => v.phone && v.phone.length > 5).length;
                const isRunning = activeJobs?.some(j => j.category === cat && j.status === 'running');
                return (
                  <motion.div key={cat} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedFolder(cat)}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-50/60 transition-all cursor-pointer p-5 relative overflow-hidden">
                    {isRunning && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 font-black text-lg flex-shrink-0">
                        {cat[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm truncate leading-tight" title={cat}>{cat}</p>
                        <p className="text-[10px] text-gray-400">{isRunning ? 'Actively extracting...' : 'Click to view leads'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-gray-900">{items.length}</p>
                        <p className="text-[10px] text-gray-400">Total</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-green-700">{withPhone}</p>
                        <p className="text-[10px] text-green-500">Phones</p>
                      </div>
                      <div className="bg-violet-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-violet-700">{verified}</p>
                        <p className="text-[10px] text-violet-500">Verified</p>
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); exportCategoryCSV(cat, items); }}
                      className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-100 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Download size={12} /> Export CSV
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <div className="flex-1 h-[70vh] bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
            {(filteredVendors || []).length === 0 ? (
              <div className="py-20 flex flex-col items-center text-gray-400 h-full justify-center">
                <Database size={40} className="mb-4 opacity-20" />
                <p className="font-bold">No leads to display</p>
              </div>
            ) : (
              <AutoSizer>
                {({ height, width }) => (
                  <ListWindow
                    height={height}
                    itemCount={(filteredVendors || []).length}
                    itemSize={130} // Approximate height of a VendorCard + padding
                    width={width}
                    itemData={filteredVendors || []}
                    className="scrollbar-thin scrollbar-thumb-gray-200"
                  >
                    {({ index, style, data }) => {
                      const vendor = data[index];
                      return (
                        <div style={style} className="pr-3 pb-3">
                          <VendorCard
                            key={vendor.id || index}
                            vendor={vendor}
                            employees={employees || []}
                            onVerify={handleVerify}
                            onDelete={handleDelete}
                            onAssign={handleAssign}
                            onClick={() => setSelectedVendor(vendor)}
                          />
                        </div>
                      );
                    }}
                  </ListWindow>
                )}
              </AutoSizer>
            )}
          </div>
        )}

        {/* MAP VIEW */}
        {view === 'map' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Map size={18} className="text-violet-500" />
                <div>
                  <p className="font-bold text-gray-900">Geographic Distribution</p>
                  <p className="text-xs text-gray-400">{mapVendors.length} leads with location data shown</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedCity !== 'All' && (
                  <span className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-100">
                    📍 {selectedCity}
                  </span>
                )}
                <button onClick={() => setSelectedCity('All')} className="text-xs text-gray-400 hover:text-gray-700">
                  View All Cities
                </button>
              </div>
            </div>

            {/* react-leaflet MapContainer */}
            <div className="relative w-full h-[480px] group">
              {/* Custom Map Controls */}
              <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setAutoCenter(true)} className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 text-violet-600 hover:bg-violet-50 hover:scale-105 transition-all" title="Recenter Map">
                  <MapPin size={20} />
                </button>
              </div>

              {mapVendors.length > 0 ? (
                <MapContainer 
                  center={[mapVendors[0].safeLat, mapVendors[0].safeLng]} 
                  zoom={11} 
                  style={{ width: '100%', height: '100%' }} 
                  zoomControl={false}
                  preferCanvas={true}
                  onMoveStart={() => setAutoCenter(false)}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                  <MapBounds vendors={mapVendors} autoCenter={autoCenter} />
                  <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
                    {mapVendors.map((vendor, i) => (
                      <Marker key={i} position={[vendor.safeLat, vendor.safeLng]}>
                        <Popup>
                          <div className="text-xs p-1">
                            <p className="font-bold text-gray-900 mb-1">{vendor.name}</p>
                            <p className="text-gray-500 mb-1">{vendor.category}</p>
                            {vendor.phone && <p className="text-green-600 font-semibold">{vendor.phone}</p>}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                </MapContainer>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <p>No map data available for current leads</p>
                </div>
              )}
              
              {/* Overlay cards for leads */}
              <div className="absolute top-4 right-4 max-h-80 overflow-y-auto space-y-2 w-64 z-[400]" style={{ scrollbarWidth: 'thin' }}>
                {(filteredVendors || []).slice(0, 10).map((vendor, i) => (
                  <div key={i} onClick={() => setSelectedVendor(vendor)}
                    className="bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-gray-100 shadow-md cursor-pointer hover:border-violet-200 transition-all">
                    <p className="font-bold text-gray-900 text-xs truncate">{vendor.name}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={9} /> {vendor.city} · {vendor.category}
                    </p>
                    {vendor.phone && (
                      <p className="text-[10px] text-green-600 font-semibold mt-0.5 flex items-center gap-1">
                        <Phone size={9} /> {vendor.phone}
                      </p>
                    )}
                  </div>
                ))}
                {(filteredVendors || []).length > 10 && (
                  <div className="bg-violet-50 rounded-xl p-3 text-center text-xs font-bold text-violet-600 border border-violet-100 z-[400]">
                    +{(filteredVendors.length - 10).toLocaleString()} more leads
                  </div>
                )}
                {(filteredVendors || []).length === 0 && (
                  <div className="bg-white rounded-xl p-4 text-center text-xs text-gray-400 border border-gray-100 z-[400]">
                    No leads for current filter
                  </div>
                )}
              </div>
            </div>

            {/* City distribution */}
            <div className="p-6 border-t border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Leads by City</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(
                  (filteredVendors || []).reduce((acc, v) => { if (v.city) { acc[v.city] = (acc[v.city] || 0) + 1; } return acc; }, {})
                ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([city, count]) => (
                  <button key={city} onClick={() => setSelectedCity(city)}
                    className={`p-3 rounded-xl text-left border transition-all ${selectedCity === city ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-gray-50 border-gray-100 hover:border-violet-100'}`}>
                    <p className="text-sm font-bold text-gray-900 truncate">{city}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{count} leads</p>
                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400 rounded-full" style={{ width: `${Math.min(100, count / (filteredVendors?.length || 1) * 300)}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOLDER DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedFolder && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end" onClick={() => setSelectedFolder(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-gray-900 text-lg">{selectedFolder}</h2>
                  <p className="text-sm text-gray-400">{groupedData?.[selectedFolder]?.length || 0} leads extracted</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportCategoryCSV(selectedFolder, groupedData?.[selectedFolder])}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 hover:bg-gray-100">
                    <Download size={14} /> Export
                  </button>
                  <button onClick={() => setSelectedFolder(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl">
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
                {(() => {
                  const folderVendors = groupedData?.[selectedFolder] || [];
                  const withContact = folderVendors.filter(v => v.phone && v.phone.length > 5 && !v.phone.includes('Requires'));
                  const noContact = folderVendors.filter(v => !v.phone || v.phone.length <= 5 || v.phone.includes('Requires'));

                  if (folderVendors.length === 0) {
                    return (
                      <div className="py-16 text-center text-gray-400">
                        <FolderOpen size={40} className="mx-auto mb-4 opacity-20" />
                        <p>No leads in this folder</p>
                      </div>
                    );
                  }

                  const folderVendorsList = [...withContact, ...noContact];
                  return (
                    <div className="h-full w-full relative">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span> 
                        Total Leads ({folderVendorsList.length})
                      </h3>
                      <div className="absolute inset-0 top-8">
                        <AutoSizer>
                          {({ height, width }) => (
                            <ListWindow
                              height={height}
                              itemCount={folderVendorsList.length}
                              itemSize={130}
                              width={width}
                              itemData={folderVendorsList}
                              className="scrollbar-thin scrollbar-thumb-gray-200"
                            >
                              {({ index, style, data }) => {
                                const vendor = data[index];
                                return (
                                  <div style={style} className="pr-3 pb-3">
                                    <VendorCard
                                      key={vendor.id || index}
                                      vendor={vendor}
                                      employees={employees || []}
                                      onVerify={handleVerify}
                                      onDelete={handleDelete}
                                      onAssign={handleAssign}
                                      onClick={() => setSelectedVendor(vendor)}
                                    />
                                  </div>
                                );
                              }}
                            </ListWindow>
                          )}
                        </AutoSizer>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── VENDOR DETAIL PANEL ── */}
      <AnimatePresence>
        {selectedVendor && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedVendor(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {(selectedVendor.avatar || (selectedVendor.images && selectedVendor.images.length > 0)) ? (
                    <img src={selectedVendor.avatar || selectedVendor.images[0]} alt={selectedVendor.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-100 flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVendor.name || 'Vendor')}&background=ede9fe&color=7c3aed`; }} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 font-black text-2xl">
                      {selectedVendor.name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">{selectedVendor.name}</h3>
                    <p className="text-sm text-gray-500">{selectedVendor.category} · {selectedVendor.city}</p>
                    {selectedVendor.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-600">{selectedVendor.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedVendor(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                
                {/* Images Carousel / Grid */}
                {selectedVendor.images && selectedVendor.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vendor Photos</p>
                    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                      {selectedVendor.images.map((img, i) => (
                        <img key={i} src={img} alt={`Vendor ${i}`} className="h-24 w-24 object-cover rounded-xl border border-gray-100 flex-shrink-0 shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedVendor.phone && (
                    <ContactRow icon={<Phone size={15} />} label="Phone" value={selectedVendor.phone} color="green" />
                  )}
                {selectedVendor.email && (
                  <ContactRow icon={<Mail size={15} />} label="Email" value={selectedVendor.email} color="blue" />
                )}
                {selectedVendor.Camera && (
                  <ContactRow icon={<Camera size={15} />} label="Camera" value={selectedVendor.Camera} color="pink" />
                )}
                {selectedVendor.address && (
                  <ContactRow icon={<MapPin size={15} />} label="Address" value={selectedVendor.address} color="gray" />
                )}
                {selectedVendor.mapsLink && (
                  <a href={selectedVendor.mapsLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-100">
                    <Globe size={15} /> Open in Maps <ExternalLink size={12} className="ml-auto" />
                  </a>
                )}
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => { handleVerify(selectedVendor.id, !selectedVendor.verified); setSelectedVendor(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-2 ${selectedVendor.verified ? 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100' : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'}`}>
                  <CheckCircle2 size={15} /> {selectedVendor.verified ? 'Unverify' : 'Verify Lead'}
                </button>
                <button onClick={() => { handleDelete(selectedVendor.id); setSelectedVendor(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all">
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ContactRow = React.memo(({ icon, label, value, color }) => {
  const colorMap = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorMap[color]}`}>
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
});

const VendorCard = React.memo(({ vendor, employees, onVerify, onDelete, onAssign, onClick }) => {
  return (
    <div onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50/50 transition-all p-4 cursor-pointer">
      <div className="flex gap-4">
        {(vendor.avatar || (vendor.images && vendor.images.length > 0)) ? (
          <img src={vendor.avatar || vendor.images[0]} alt={vendor.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-100 flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.name || 'Vendor')}&background=ede9fe&color=7c3aed`; }} />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center text-violet-600 font-black text-xl flex-shrink-0">
            {vendor.name?.[0] || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 truncate">{vendor.name}</p>
            {vendor.verified && <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400">{vendor.category}</span>
            {vendor.city && <span className="text-xs text-gray-300">·</span>}
            {vendor.city && <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin size={9} />{vendor.city}</span>}
            {vendor.rating && <span className="text-xs text-amber-500 flex items-center gap-0.5"><Star size={9} />{vendor.rating}</span>}
          </div>
          
          {/* Inline Images display for VendorCard */}
          {vendor.images && vendor.images.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
              {vendor.images.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="" className="h-8 w-8 object-cover rounded-md border border-gray-100 shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
              ))}
              {vendor.images.length > 4 && (
                <div className="h-8 w-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  +{vendor.images.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {vendor.phone && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-100">
              <Phone size={10} /> {vendor.phone.length > 13 ? vendor.phone.slice(0, 13) + '...' : vendor.phone}
            </span>
          )}
          {vendor.Camera && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-pink-50 text-pink-700 text-xs font-semibold rounded-lg border border-pink-100">
              <Camera size={10} />
            </span>
          )}
          {vendor.email && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
              <Mail size={10} />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button onClick={() => onVerify(vendor.id, !vendor.verified)}
            className={`p-1.5 rounded-lg transition-colors ${vendor.verified ? 'text-green-500 bg-green-50' : 'text-gray-300 hover:text-green-500 hover:bg-green-50'}`}
            title="Verify">
            <CheckCircle2 size={15} />
          </button>
          <button onClick={() => onDelete(vendor.id)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
});


