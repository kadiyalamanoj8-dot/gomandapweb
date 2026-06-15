import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, MapPin, User, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useVendor } from '../context/VendorContext';

const Bookings = () => {
  const { vendorProfile: vendor } = useVendor();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendor?._id) {
      fetchBookings();
    }
  }, [vendor]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cart-orders/vendor/${vendor._id}`, { withCredentials: true });
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, itemId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/cart-orders/${orderId}/item/${itemId}`, {
        status: newStatus
      }, { withCredentials: true });
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update booking status.');
    }
  };

  // Find the specific item in the order array that belongs to THIS vendor
  const getVendorItem = (order) => {
    return order.items.find(item => item.vendorId === vendor._id);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Booking Requests</h1>
        <p className="text-gray-500 mt-2 font-medium">Manage your incoming requests from the Marketplace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-[2rem] border border-gray-100 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Calendar size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 max-w-md">When clients add your services to their cart and checkout, their requests will appear here.</p>
          </div>
        ) : (
          bookings.map((order) => {
            const myItem = getVendorItem(order);
            if (!myItem) return null;

            const isPending = myItem.status === 'Pending';

            return (
              <div key={order._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-brand-primary transition-colors">
                <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${isPending ? 'bg-amber-50/50' : 'bg-gray-50/50'}`}>
                  <div className="flex items-center gap-2">
                    {isPending ? <Clock size={16} className="text-amber-500" /> : <CheckCircle size={16} className={myItem.status === 'Accepted' ? 'text-green-500' : 'text-gray-400'} />}
                    <span className={`text-sm font-bold uppercase tracking-widest ${isPending ? 'text-amber-600' : myItem.status === 'Accepted' ? 'text-green-600' : 'text-gray-500'}`}>
                      {myItem.status}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">ID: {order._id.slice(-6).toUpperCase()}</span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-1">{order.clientName}</h3>
                      <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                        <MessageCircle size={14} /> {order.clientPhone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase">Event Date</span>
                      <span className="text-sm font-bold text-gray-900">{new Date(myItem.serviceDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase">Event Type</span>
                      <span className="text-sm font-bold text-gray-900">{order.eventType}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="text-xs font-bold text-gray-400 uppercase">Quoted Price</span>
                      <span className="text-sm font-black text-brand-primary">₹ {myItem.quotedPrice}</span>
                    </div>
                  </div>

                  {order.clientNotes && (
                    <div className="mb-6">
                      <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Client Notes</span>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl italic">{order.clientNotes}</p>
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex gap-3">
                    {isPending ? (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(order._id, myItem._id, 'Rejected')}
                          className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(order._id, myItem._id, 'Accepted')}
                          className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                        >
                          Accept Booking
                        </button>
                      </>
                    ) : (
                      <a 
                        href={`https://wa.me/${order.clientPhone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={18} /> Chat with Client
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Bookings;
