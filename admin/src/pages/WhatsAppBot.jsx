import React, { useState, useEffect } from 'react';
import { QrCode, MessageCircle, Send, CheckCircle2, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { API_URL } from '../config/api';

const WhatsAppBot = () => {
  const [status, setStatus] = useState({ isReady: false, qrCode: null });
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [template, setTemplate] = useState('Hi {{name}}, we saw your profile on Gomandap! We are offering free premium vendor listings this month. Reply YES to claim your spot.');
  const [isSending, setIsSending] = useState(false);
  const [messageLog, setMessageLog] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/status`);
      const data = await res.json();
      if (data.success) {
        setStatus({ isReady: data.isReady, qrCode: data.qrCode });
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp status', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vendors?limit=100`);
      const data = await res.json();
      if (data.success) {
        // Filter out vendors without contact info
        const contactable = data.data.filter(v => v.contact && v.contact.length > 0);
        setVendors(contactable);
      }
    } catch (error) {
      console.error('Failed to fetch vendors', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchVendors();
    const interval = setInterval(fetchStatus, 5000); // Poll status every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSendBulk = async () => {
    if (!template.trim()) {
      alert('Please enter a message template.');
      return;
    }
    if (vendors.length === 0) {
      alert('No vendors with contact numbers available.');
      return;
    }

    if (!window.confirm(`Are you sure you want to send this to ${vendors.length} vendors? It will take approx ${vendors.length * 15} seconds.`)) {
      return;
    }

    setIsSending(true);
    setMessageLog(`Started background job for ${vendors.length} vendors... Please check server terminal for live logs.`);
    
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendors, template })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error);
        setIsSending(false);
      } else {
        setMessageLog(data.message);
        // We don't reset isSending because it's running in background, but we can let them leave the page.
      }
    } catch (error) {
      alert('Failed to trigger bulk send.');
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <MessageCircle className="text-green-500" size={32} /> WhatsApp Automation
          </h1>
          <p className="text-gray-500 font-medium mt-1">Connect your phone to send free automated messages to vendors.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${status.isReady ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {status.isReady ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {status.isReady ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {!status.isReady ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <QrCode size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Link your WhatsApp</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            1. Open WhatsApp on your phone.<br/>
            2. Tap Menu or Settings and select <b>Linked Devices</b>.<br/>
            3. Point your phone to this screen to capture the code.
          </p>

          {status.qrCode ? (
            <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm mb-6">
              <img src={status.qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 mb-6">
              <RefreshCw className="animate-spin text-gray-300" size={32} />
            </div>
          )}
          <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
            <RefreshCw size={12} /> Auto-refreshing every 5s
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Campaign Builder */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Send size={20} className="text-brand-primary" /> New Outreach Campaign
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Message Template</label>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <textarea 
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full bg-transparent border-none outline-none resize-none h-32 text-gray-900 font-medium"
                    placeholder="Type your message here..."
                  />
                  <div className="pt-3 border-t border-gray-200 flex gap-2">
                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 cursor-pointer hover:bg-gray-50" onClick={() => setTemplate(t => t + ' {{name}}')}>`{'{{name}}'}`</span>
                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 cursor-pointer hover:bg-gray-50" onClick={() => setTemplate(t => t + ' {{category}}')}>`{'{{category}}'}`</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800 font-medium">
                <strong>Anti-Ban Protection:</strong> Messages will be sent with a 15-second random delay between each contact to prevent WhatsApp from flagging your number.
              </div>

              {messageLog && (
                <div className="mb-6 p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre-wrap">
                  {messageLog}
                </div>
              )}

              <button 
                onClick={handleSendBulk}
                disabled={isSending || vendors.length === 0}
                className="w-full bg-brand-primary text-white font-black py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-[#D41B4D] transition-all disabled:opacity-50"
              >
                {isSending ? 'Campaign Running in Background...' : `Send to ${vendors.length} Vendors`}
              </button>
            </div>
          </div>

          {/* Stats & Audience */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-500" /> Target Audience
              </h2>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl mb-4">
                <span className="font-bold text-blue-900">Valid Contacts</span>
                <span className="text-2xl font-black text-blue-600">{vendors.length}</span>
              </div>

              <p className="text-xs font-semibold text-gray-500 mb-4">
                This includes all scraped vendors and newly registered vendors who have a valid phone number.
              </p>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {vendors.slice(0, 20).map(v => (
                  <div key={v._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{v.name}</p>
                      <p className="text-[10px] text-gray-500">{v.category}</p>
                    </div>
                    <span className="text-xs font-mono text-gray-600 shrink-0">{v.contact[0]}</span>
                  </div>
                ))}
                {vendors.length > 20 && (
                  <div className="text-center py-2 text-xs font-bold text-gray-400">
                    + {vendors.length - 20} more...
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default WhatsAppBot;
