import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, MessageCircle, MapPin, Loader2, CheckCircle2, UserPlus, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LeadsCRM = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sendingEmailId, setSendingEmailId] = useState(null);


  async function fetchLeads() {
    setLoading(true);
    try {
      const url = filterStatus === 'All' ? `${API_URL}/leads` : `${API_URL}/leads?status=${filterStatus}`;
      const res = await axios.get(url);
      setLeads(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/leads/${id}`, { status: newStatus });
      toast.success('Lead status updated');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const sendWhatsApp = async (lead) => {
    if (!lead.phone) return toast.error('No phone number available');
    
    // Format phone (remove spaces, add country code if missing)
    let formattedPhone = lead.phone.replace(/[^0-9]/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;
    
    const message = `Hi ${lead.name} team! We saw your profile on Google Maps. We are inviting premium venues to list on Gomandap.com. You can claim your pre-built profile here: http://localhost:5173/vendor/onboarding?lead_id=${lead._id}`;
    
    // Update local status
    await axios.put(`${API_URL}/leads/${lead._id}`, { whatsappStatus: 'Sent', status: 'Outreach Sent' });
    
    // Open WhatsApp Web/App
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    fetchLeads();
  };

  const sendEmail = async (lead) => {
    const targetEmail = prompt(`Enter email address for ${lead.name}:`, lead.email || '');
    if (!targetEmail) return;

    setSendingEmailId(lead._id);
    try {
      await axios.post(`${API_URL}/leads/${lead._id}/send-email`, { targetEmail });
      toast.success('Email dispatched successfully via Gomandap SMTP!');
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmailId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Outreach Sent': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Claimed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Live': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Discarded': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-black mb-1">Lead Generation CRM</h1>
          <p className="text-gray-500 text-sm">Manage leads, send WhatsApps, and dispatch emails.</p>
        </div>

        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          {['All', 'New', 'Outreach Sent', 'Claimed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === status ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-black uppercase tracking-wider text-gray-500">
                <th className="p-4">Lead Info</th>
                <th className="p-4">Contact</th>
                <th className="p-4">CRM Status</th>
                <th className="p-4 text-right">Outreach Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <Loader2 className="animate-spin text-brand-primary mx-auto mb-2" size={32} />
                    <p className="text-gray-500 font-medium">Loading CRM Data...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <UserPlus className="text-gray-300 mx-auto mb-2" size={48} />
                    <p className="text-gray-500 font-medium">No leads found in this pipeline.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-black">{lead.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={12}/> {lead.address?.city || 'Unknown Location'} • {lead.category}
                        </span>
                        {lead.mapsLink && (
                          <a href={lead.mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline mt-1 inline-block w-max">
                            View on Maps
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-brand-black flex items-center gap-2">
                        <Phone size={14} className="text-gray-400"/>
                        {lead.phone || <span className="text-gray-400 italic">No Phone</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <select 
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer w-max ${getStatusColor(lead.status)}`}
                        >
                          <option value="New">New Lead</option>
                          <option value="Outreach Sent">Outreach Sent</option>
                          <option value="Claimed">Profile Claimed</option>
                          <option value="Discarded">Discarded</option>
                        </select>
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                          <span className={`${lead.whatsappStatus !== 'Not Sent' ? 'text-green-500' : 'text-gray-400'}`}>WA: {lead.whatsappStatus}</span>
                          <span className={`${lead.emailStatus !== 'Not Sent' ? 'text-blue-500' : 'text-gray-400'}`}>EM: {lead.emailStatus}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => sendWhatsApp(lead)}
                          disabled={!lead.phone}
                          className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-[#25D366]/10 disabled:hover:text-[#25D366]"
                          title="Send WhatsApp Deep Link"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button
                          onClick={() => sendEmail(lead)}
                          disabled={sendingEmailId === lead._id}
                          className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                          title="Dispatch Magic Link Email"
                        >
                          {sendingEmailId === lead._id ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsCRM;
