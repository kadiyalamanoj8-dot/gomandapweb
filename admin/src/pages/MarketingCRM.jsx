import React, { useState, useEffect } from 'react';
import { Users, Mail, MessageCircle, Upload, CheckCircle, Clock, Bell } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

const MarketingCRM = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    fetchContacts();
    checkPushSubscription();
  }, []);

  const checkPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      setPushEnabled(!!subscription);
    }
  };

  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator)) return alert('Service Workers not supported');
    try {
      const res = await axios.get(`${API_URL}/api/notifications/vapidPublicKey`, { withCredentials: true });
      const publicVapidKey = res.data.publicKey;
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey
      });

      await axios.post(`${API_URL}/api/notifications/subscribe`, subscription, { withCredentials: true });
      setPushEnabled(true);
      alert('Push notifications enabled successfully! You will now receive alerts on this device.');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Failed to enable push notifications.');
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/marketing/contacts`, { withCredentials: true });
      setContacts(res.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let importedData = [];
        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(event.target.result);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parser for demo purposes
          const lines = event.target.result.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            let obj = {};
            headers.forEach((header, index) => {
              obj[header] = values[index];
            });
            importedData.push(obj);
          }
        }

        // Map data to expected schema
        const formattedContacts = importedData.map(c => ({
          businessName: c.businessName || c.name || c['Business Name'] || 'Unknown Business',
          category: c.category || c.Category || '',
          phone: c.phone || c['Phone Number'] || c.Phone || '',
          email: c.email || c.Email || '',
          city: c.city || c.City || ''
        }));

        await axios.post(`${API_URL}/api/marketing/contacts/import`, { contacts: formattedContacts }, { withCredentials: true });
        alert('Contacts imported successfully!');
        fetchContacts();
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to parse file or import data.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSendEmail = async (contact) => {
    if (!contact.email) return alert('No email address for this contact.');
    try {
      await axios.post(`${API_URL}/api/marketing/email/send/${contact._id}`, {}, { withCredentials: true });
      alert('Email sent successfully via Google Workspace!');
      fetchContacts(); // refresh status
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Check SMTP configuration in .env.');
    }
  };

  const handleSendWhatsApp = async (contact) => {
    if (!contact.phone) return alert('No phone number for this contact.');
    
    // Format phone number to international format if needed (simple clean up)
    const phone = contact.phone.replace(/\D/g, '');
    
    const message = `Hi *${contact.businessName}*,

We noticed your excellent services in the wedding industry! 

We'd love to invite you to partner with *Gomandap* - the premier wedding vendor platform. 
Listing your business is *100% free* and helps you get more leads and direct bookings!

*Benefits:*
✅ Free listing & high visibility
✅ Direct leads to your dashboard
✅ Custom pricing & portfolio display

*Register now for free:*
https://vendor.gomandap.com

If you need any help, reply to this message!
- The Gomandap Team`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // Update status in backend
    try {
      await axios.put(`${API_URL}/api/marketing/contacts/${contact._id}/status`, { status: 'WhatsApp Sent' }, { withCredentials: true });
      fetchContacts(); // refresh status
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            Outbound Marketing CRM
          </h1>
          <p className="text-gray-500 mt-2">Manage scraped contacts, send automated emails, and WhatsApp outreach.</p>
        </div>

        <div className="flex items-center gap-4">
          {!pushEnabled && (
            <button onClick={handleEnablePush} className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl font-semibold hover:bg-amber-100 transition-colors">
              <Bell size={20} /> Enable Alerts
            </button>
          )}
          <label className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
            {importing ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <Upload size={20} />}
            {importing ? 'Importing...' : 'Import CSV/JSON'}
            <input type="file" accept=".csv,.json" className="hidden" onChange={handleFileUpload} disabled={importing} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Business Name</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Loading contacts...</td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 flex flex-col items-center">
                    <Users size={48} className="text-gray-300 mb-4" />
                    No contacts found. Import a CSV or JSON file to get started.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{contact.businessName}</div>
                      <div className="text-sm text-gray-500">{contact.city}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> {contact.email || 'N/A'}</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1.5 mt-1"><MessageCircle size={14} className="text-gray-400" /> {contact.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">{contact.category || 'Vendor'}</span>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        contact.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        contact.status === 'WhatsApp Sent' ? 'bg-green-50 text-green-600' :
                        contact.status === 'Email Sent' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {contact.status === 'Pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {contact.status}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleSendWhatsApp(contact)}
                          disabled={!contact.phone}
                          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </button>
                        <button 
                          onClick={() => handleSendEmail(contact)}
                          disabled={!contact.email}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Mail size={16} /> Email
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

export default MarketingCRM;
