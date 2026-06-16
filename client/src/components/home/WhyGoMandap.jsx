import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const fallbackCards = [
  {
    title: 'Verified Vendors',
    description: 'Every vendor on our platform undergoes a strict background check for quality and reliability.',
    iconName: 'CheckCircle'
  },
  {
    title: 'Best Price Guarantee',
    description: 'We ensure you get the most competitive rates and transparent pricing with no hidden fees.',
    iconName: 'Tag'
  },
  {
    title: '3D Virtual Tours',
    description: 'Explore venues from the comfort of your home with our immersive 3D walkthroughs.',
    iconName: 'Video'
  },
  {
    title: 'Expert Planners',
    description: 'Get matched with dedicated wedding planners to bring your dream celebration to life.',
    iconName: 'Users'
  }
];

const WhyGoMandap = () => {
  const [features, setFeatures] = useState(fallbackCards);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/settings`);
        if (res.data && res.data.data && res.data.data.whyUsFeatures && res.data.data.whyUsFeatures.length > 0) {
          setFeatures(res.data.data.whyUsFeatures);
        }
      } catch (error) {
        console.error("Failed to load why us features", error);
      }
    };
    fetchSettings();
  }, []);

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName] || Icons.CheckCircle;
    return <IconComponent className="w-8 h-8 text-brand-primary" />;
  };

  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden">
      {/* Decorative background blobs for liquid glass effect */}
      <div className="absolute top-0 left-10 w-64 h-64 bg-brand-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-[pulse_6s_infinite]"></div>
      <div className="absolute top-0 right-10 w-64 h-64 bg-purple-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-[pulse_6s_infinite_2s]"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-[pulse_6s_infinite_4s]"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-black text-gray-900 mb-4"
          >
            Why Choose GoMandap?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base font-medium text-gray-500 max-w-2xl mx-auto"
          >
            We take the stress out of wedding planning by providing a transparent, immersive, and reliable marketplace for all your celebration needs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                {renderIcon(card.iconName)}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGoMandap;
