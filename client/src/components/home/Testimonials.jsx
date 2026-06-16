import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const fallbackReviews = [
  {
    _id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop',
    rating: 5,
    text: "GoMandap made finding our dream venue so easy! The 3D virtual tours saved us weeks of venue visits. Highly recommended for any bride-to-be.",
  },
  {
    _id: 2,
    name: 'Rahul Verma',
    location: 'Delhi, NCR',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    rating: 5,
    text: "The transparent pricing was a breath of fresh air. We found the best caterers and decorators within our exact budget. Thank you GoMandap!",
  },
  {
    _id: 3,
    name: 'Anjali Desai',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    rating: 4,
    text: "I loved the verified vendors list. We booked our photographer and makeup artist through the platform and they were absolute professionals.",
  },
  {
    _id: 4,
    name: 'Vikram Singh',
    location: 'Jaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 5,
    text: "Planning a destination wedding in Jaipur seemed impossible until we found GoMandap. Their expert planners guided us through every step.",
  },
  {
    _id: 5,
    name: 'Sneha Reddy',
    location: 'Hyderabad, Telangana',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    rating: 5,
    text: "The interface is beautiful and so easy to use. I found my perfect Kalyana Mandapam in just two days. A must-use platform!",
  },
  {
    _id: 6,
    name: 'Amit Kumar',
    location: 'Bangalore, Karnataka',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    rating: 4,
    text: "Great variety of vendors. The reviews from other couples helped us make informed decisions. Everything went flawlessly on our big day.",
  }
];

const Testimonials = () => {
  const [reviews, setReviews] = useState(fallbackReviews);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/testimonials`);
        if (res.data && res.data.data && res.data.data.length > 0) {
          setReviews(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      }
    };
    fetchReviews();
  }, []);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-black text-gray-900 mb-4"
          >
            Real Couples, Real Stories
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base font-medium text-gray-500 max-w-2xl mx-auto"
          >
            Don't just take our word for it. See how GoMandap has helped couples across India plan their perfect wedding.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: (index % 3) * 0.1, duration: 0.5 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={review.image} 
                  alt={review.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.location}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < review.rating ? "fill-brand-primary text-brand-primary" : "fill-gray-200 text-gray-200"} 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">
                "{review.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
