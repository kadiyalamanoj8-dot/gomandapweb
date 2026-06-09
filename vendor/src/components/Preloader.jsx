import React from 'react';
import { motion } from 'framer-motion';

const Preloader = ({ progress = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className="fixed inset-0 z-[99999] bg-[#0f0305] flex flex-col items-center justify-center font-sans select-none overflow-hidden"
    >
      {/* Deep Rich Background with subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3a060b] via-[#0f0305] to-black pointer-events-none" />
      
      {/* Dynamic Ambient Pulses for Light Painting effect */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div 
        className="absolute top-[30%] w-[800px] h-[400px] bg-[#FFD700]/10 rounded-full blur-[100px] pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative flex flex-col items-center z-10 w-full max-w-lg px-4">
        
        {/* Intricate SVG Mandap Drawing with Real Gold Gradient */}
        <div className="relative flex items-center justify-center w-full max-w-[320px] md:max-w-[400px] aspect-square mb-2 md:mb-6 mx-auto">
          <motion.svg 
            viewBox="0 0 400 400" 
            className="w-full h-full drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]"
          >
            <defs>
              {/* Metallic Real Gold Gradient (Light Painting Effect) */}
              <linearGradient id="real-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BF953F" />
                <stop offset="25%" stopColor="#FCF6BA" />
                <stop offset="50%" stopColor="#B38728" />
                <stop offset="75%" stopColor="#FBF5B7" />
                <stop offset="100%" stopColor="#AA771C" />
              </linearGradient>
              
              <linearGradient id="real-gold-reverse" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#AA771C" />
                <stop offset="30%" stopColor="#FCF6BA" />
                <stop offset="60%" stopColor="#BF953F" />
                <stop offset="100%" stopColor="#FBF5B7" />
              </linearGradient>
            </defs>

            {/* Outer Decorative Border Ring */}
            <motion.circle
              cx="200" cy="200" r="180"
              fill="none" stroke="url(#real-gold-reverse)" strokeWidth="1" strokeDasharray="4 8"
              initial={{ pathLength: 0, opacity: 0, rotate: -90 }}
              animate={{ pathLength: 1, opacity: 0.5, rotate: 270 }}
              transition={{ duration: 3.5, ease: "linear" }}
              style={{ transformOrigin: "200px 200px" }}
            />

            {/* Inner Detailed Mandala Rays */}
            <motion.path 
              d="M200 40 L200 60 M200 340 L200 360 M40 200 L60 200 M340 200 L360 200 M85 85 L100 100 M315 315 L300 300 M315 85 L300 100 M85 315 L100 300"
              fill="none" stroke="url(#real-gold)" strokeWidth="1.5" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 0.8 }} 
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Left Pillar */}
            <motion.path 
              d="M100 350 L100 150 M80 350 L120 350 M80 340 L120 340 M85 150 L115 150 M80 140 L120 140 M90 150 L90 340 M110 150 L110 340" 
              fill="none" stroke="url(#real-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Right Pillar */}
            <motion.path 
              d="M300 350 L300 150 M280 350 L320 350 M280 340 L320 340 M285 150 L315 150 M280 140 L320 140 M290 150 L290 340 M310 150 L310 340" 
              fill="none" stroke="url(#real-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Main Canopy / Dome */}
            <motion.path 
              d="M70 140 Q200 50 330 140 M90 120 Q200 20 310 120 M120 100 Q200 -10 280 100 M200 40 L200 10" 
              fill="none" stroke="url(#real-gold)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Top Kalash (Finial) */}
            <motion.path 
              d="M190 25 Q200 40 210 25 Q200 5 190 25 Z M200 5 L200 -10 M200 -15 L200 -10" 
              fill="none" stroke="url(#real-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 1, ease: "easeInOut", delay: 1.5 }}
            />

            {/* Decorative Hanging Torans */}
            <motion.path 
              d="M120 140 Q160 180 200 140 Q240 180 280 140 M120 140 Q140 160 160 140 Q180 160 200 140 Q220 160 240 140 Q260 160 280 140 M140 140 L140 150 M180 140 L180 150 M220 140 L220 150 M260 140 L260 150" 
              fill="none" stroke="url(#real-gold-reverse)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
            />
            
            {/* Hanging Diyas/Bells (Vibrant Ruby Red & Gold) */}
            <motion.path 
              d="M160 140 L160 170 M155 170 L165 170 L160 180 Z M240 140 L240 170 M235 170 L245 170 L240 180 Z M200 140 L200 180 M195 180 L205 180 L200 190 Z" 
              fill="none" stroke="url(#real-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]"
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 1, ease: "easeInOut", delay: 1.8 }}
            />
          </motion.svg>

          {/* Perfectly Centered Gomandap Logo Materializing Inside the Mandap */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, filter: "drop-shadow(0px 0px 0px transparent)" }}
            animate={{ scale: 1, opacity: 1, filter: "drop-shadow(0px 0px 30px rgba(252, 246, 186, 0.5))" }}
            transition={{ duration: 1, delay: 2, ease: "easeOut" }}
            className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 bg-black/40 border border-[#FCF6BA]/40 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)] p-4 backdrop-blur-md"
          >
            <img src="/logo.svg?v=2" alt="Gomandap Logo" className="w-full h-full object-contain pointer-events-none select-none" />
          </motion.div>
        </div>

        {/* Typography */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-center drop-shadow-md bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-transparent bg-clip-text"
        >
          Gomandap Business
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.5, ease: "easeOut" }}
          className="overflow-hidden text-center"
        >
          <p className="text-sm md:text-base font-semibold text-[#FCF6BA]/90 tracking-wide px-4 leading-relaxed mx-auto uppercase">
            The Ultimate Growth Platform
          </p>
        </motion.div>

        {/* Floating Golden Particles (Sparks) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[#FCF6BA] rounded-full blur-[1px] shadow-[0_0_8px_#FCF6BA]"
              initial={{ 
                x: "50%", 
                y: "50%", 
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                x: `${50 + (Math.random() * 80 - 40)}%`, 
                y: `${50 + (Math.random() * 80 - 40)}%`,
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                ease: "easeOut", 
                delay: 1.5 + Math.random() * 1,
                repeat: Infinity,
                repeatDelay: Math.random()
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;
