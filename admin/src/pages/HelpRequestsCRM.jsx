import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, MessageCircle, MapPin, Loader2, CheckCircle2, UserPlus, Phone, Calendar, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const HelpRequestsCRM = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/help-requests`);
      setRequests(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch help requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/help-requests/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const sendWhatsApp = async (req) => {
    if (!req.phone) return toast.error('No phone number available');
    
    // Format phone (remove spaces, add country code if missing)
    let formattedPhone = req.phone.replace(/[^0-9]/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;
    
    const message = `Hi ${req.name}! This is the Gomandap Expert Team. We received your request for help finding vendors for your ${req.eventType || 'event'}. How can we assist you today?`;
    
    // Open WhatsApp Web/App
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    
    // Auto-update status to In Progress if it's New
    if (req.status === 'New') {
      handleStatusChange(req._id, 'In Progress');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'In Progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-black mb-1">Expert Help Requests</h1>
          <p className="text-gray-500 text-sm">Manage concierge requests from clients looking for vendors.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-black uppercase tracking-wider text-gray-500">
                <th className="p-4">Client Info</th>
                <th className="p-4">Event Details</th>
                <th className="p-4">Required Vendors</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <Loader2 className="animate-spin text-brand-primary mx-auto mb-2" size={32} />
                    <p className="text-gray-500 font-medium">Loading Requests...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <MessageCircle className="text-gray-300 mx-auto mb-2" size={48} />
                    <p className="text-gray-500 font-medium">No help requests found.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-black">{req.name}</span>
                        <div className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-1">
                          <Phone size={12} className="text-gray-400"/>
                          {req.phone}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-2">
                          Received: {new Date(req.createdAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-brand-black">
                          {req.eventType || 'Unspecified Event'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12}/> {formatDate(req.eventDate)}
                        </span>
                        {req.message && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 max-w-[200px] break-words">
                            "{req.message}"
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {req.requiredVendors && req.requiredVendors.length > 0 ? (
                          req.requiredVendors.map((vendor, i) => (
                            <span key={i} className="text-[10px] bg-brand-primary/10 text-brand-black px-2 py-1 rounded-md font-semibold">
                              {vendor}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">None specified</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <select 
                        value={req.status}
                        onChange={(e) => handleStatusChange(req._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer w-max ${getStatusColor(req.status)}`}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="p-4 text-right align-top">
                      <button
                        onClick={() => sendWhatsApp(req)}
                        disabled={!req.phone}
                        className="p-2 inline-flex bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-[#25D366]/10 disabled:hover:text-[#25D366]"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </button>
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

export default HelpRequestsCRM;
