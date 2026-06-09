import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Automatically complete after 3 seconds for a smooth app-like splash
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 800); // Wait for exit animation to finish
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center font-sans select-none overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative flex flex-col items-center z-10">
            {/* SVG Ring Animations */}
            <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 mb-8">
              {/* Outer Golden Ring */}
              <motion.svg 
                className="absolute w-full h-full text-brand-gold drop-shadow-[0_0_15px_rgba(255,193,7,0.3)]"
                viewBox="0 0 100 100"
                initial={{ rotate: -90 }}
                animate={{ rotate: 270 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </motion.svg>

              {/* Inner Dashed Ring */}
              <motion.svg 
                className="absolute w-[85%] h-[85%] text-brand-gold/40"
                viewBox="0 0 100 100"
                initial={{ rotate: 90 }}
                animate={{ rotate: -270 }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 8"
                  strokeLinecap="round"
                />
              </motion.svg>
              
              {/* Subtle Pulsing Core */}
              <motion.div 
                className="absolute w-[70%] h-[70%] bg-brand-gold/5 rounded-full blur-md"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />

              {/* Logo Center */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, filter: "drop-shadow(0px 0px 0px transparent)" }}
                animate={{ scale: 1, opacity: 1, filter: "drop-shadow(0px 0px 20px rgba(255, 193, 7, 0.4))" }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl p-3 backdrop-blur-xl"
              >
                <img src="/logo.svg?v=2" alt="Gomandap Logo" className="w-full h-full object-contain" />
              </motion.div>
            </div>

            {/* Typography */}
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 text-center"
            >
              Gomandap Business
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
              className="overflow-hidden text-center"
            >
              <p className="text-sm md:text-base font-medium text-brand-gold/80 tracking-wide max-w-xs md:max-w-md px-4 leading-relaxed mx-auto">
                The Ultimate Growth Platform<br/>for Event Professionals
              </p>
            </motion.div>
            
            {/* Minimal Loading Dots */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-12 flex gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.div 
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-brand-gold/60"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroScreen;
