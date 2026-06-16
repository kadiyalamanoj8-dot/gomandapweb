import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    image: '',
    rating: 5,
    text: '',
    isActive: true
  });

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${API_URL}/testimonials/admin`);
      setTestimonials(res.data.data);
    } catch (err) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (testimonial = null) => {
    if (testimonial) {
      setFormData(testimonial);
      setEditingId(testimonial._id);
    } else {
      setFormData({ name: '', location: '', image: '', rating: 5, text: '', isActive: true });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/testimonials/${editingId}`, formData);
        toast.success('Testimonial updated');
      } else {
        await axios.post(`${API_URL}/testimonials`, formData);
        toast.success('Testimonial added');
      }
      setShowModal(false);
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await axios.delete(`${API_URL}/testimonials/${id}`);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to delete testimonial');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-black mb-1">Testimonials Manager</h1>
          <p className="text-gray-500 text-sm">Manage the reviews shown on the client home page.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-liquid text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t._id} className={`bg-white rounded-2xl p-6 border transition-all shadow-sm ${t.isActive ? 'border-gray-200' : 'border-red-200 opacity-70'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{t.name}</h3>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(t)} className="p-1.5 text-gray-400 hover:text-blue-500 bg-gray-50 rounded-md"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(t._id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 rounded-md"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < t.rating ? "fill-brand-gold text-brand-gold" : "fill-gray-200 text-gray-200"} />
                ))}
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 italic">"{t.text}"</p>
              {!t.isActive && <span className="inline-block mt-3 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold uppercase">Hidden</span>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                  <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL (Unsplash portrait recommended)</label>
                <input required type="text" name="image" value={formData.image} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rating (1-5)</label>
                <input required type="number" min="1" max="5" name="rating" value={formData.rating} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Review Text</label>
                <textarea required name="text" value={formData.text} onChange={handleInputChange} rows="4" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary resize-none"></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-brand-primary rounded" />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">Active (Visible on homepage)</label>
              </div>
              
              <div className="flex gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-brand-black text-white rounded-xl font-bold hover:bg-gray-900">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
