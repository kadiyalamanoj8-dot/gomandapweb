import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Coins, Sparkles } from 'lucide-react';

const TrustSection = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold font-bold text-[13px] tracking-wide uppercase mb-6 border border-brand-gold/20"
          >
            <ShieldCheck size={16} /> The Gomandap Guarantee
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[40px] md:text-[56px] font-black tracking-tighter text-[#1D1D1F] leading-[1.05] mb-6"
          >
            Direct bookings. <br/> Zero hidden fees.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[20px] md:text-[24px] font-medium text-[#86868B] leading-relaxed"
          >
            We believe you should connect directly with the creators bringing your vision to life. No middlemen, no escrow holds—just pure collaboration.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Coins,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
              title: "Zero Commission",
              desc: "You negotiate directly with the vendor. We take 0% commission from your booking amount."
            },
            {
              icon: ShieldCheck,
              color: 'text-brand-gold',
              bg: 'bg-brand-gold/10',
              border: 'border-brand-gold/20',
              title: "Verified Quality",
              desc: "Every Mandapam and Makeup Artist is vetted by our team to ensure top-tier service delivery."
            },
            {
              icon: Sparkles,
              color: 'text-brand-primary',
              bg: 'bg-brand-primary/10',
              border: 'border-brand-primary/20',
              title: "Infinite Inspiration",
              desc: "Browse high-res galleries, check available dates, and instantly chat with professionals."
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1) }}
              className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-8`}>
                <feature.icon size={32} className={feature.color} />
              </div>
              <h3 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight mb-4">{feature.title}</h3>
              <p className="text-[17px] font-medium text-[#86868B] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
