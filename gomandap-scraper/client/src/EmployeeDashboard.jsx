import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Phone, MessageCircle, MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeDashboard({ user, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignedLeads();
  }, []);

  // In the real world, this endpoint would filter by `user.location` or `user.id`. 
  // For now, we fetch the staging vendors and filter them locally.
  const fetchAssignedLeads = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
      const res = await axios.get(`${API_URL}/vendors`);
      
      // Filter: Only show leads that match the employee's assigned location, 
      // and only leads that have a valid phone number (no point showing them empty leads to call).
      const validLeads = res.data.filter(v => 
        !v.pushed && // Not yet pushed to live
        v.phone && v.phone.length > 5 && !v.phone.includes('Requires') && // Has phone
        (user.location === 'All' || v.city.toLowerCase().includes(user.location.toLowerCase())) // Matches territory
      ).reverse();
      
      setLeads(validLeads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    // Strip non-numeric characters for the dialer
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const handleWhatsApp = (lead) => {
    let cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const msg = `Hi ${lead.name} team! We are inviting premium venues in ${lead.city} to list on Gomandap.com. Are you the right person to speak with?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      {/* Mobile Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-brand-black tracking-tight">Gomandap <span className="text-brand-primary">Outreach</span></h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user.location} Territory</p>
        </div>
        <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full bg-gray-100">
          <LogOut size={18} />
        </button>
      </nav>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        
        {/* Stats & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-500">My Assigned Leads</span>
            <span className="bg-brand-primary/10 text-brand-primary font-black px-3 py-1 rounded-full text-sm">{leads.length} Pending</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Lead Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={24} />
              </div>
              <h3 className="font-bold text-gray-900">No leads available</h3>
              <p className="text-sm text-gray-500 mt-1">Check back later for new assignments in {user.location}.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredLeads.map(lead => (
                <motion.div 
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-50">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-gray-900 text-lg leading-tight">{lead.name}</h3>
                      <span className="shrink-0 bg-gray-100 text-gray-500 text-[10px] uppercase font-black tracking-wider px-2 py-1 rounded-md">
                        {lead.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mt-2">
                      <MapPin size={12} /> {lead.address}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50/50">
                    <button 
                      onClick={() => handleCall(lead.phone)}
                      className="p-4 flex items-center justify-center gap-2 font-black text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Phone size={18} /> Direct Call
                    </button>
                    <button 
                      onClick={() => handleWhatsApp(lead)}
                      className="p-4 flex items-center justify-center gap-2 font-black text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                    >
                      <MessageCircle size={18} /> WhatsApp
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
