import React from 'react';
import { motion } from 'framer-motion';

const Preloader = ({ progress = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center font-sans select-none overflow-hidden"
    >
      <div className="relative flex flex-col items-center z-10">
        {/* Animated Logo Text */}
        <div className="relative text-5xl md:text-7xl font-black tracking-tighter mb-10">
          <span className="text-white/10 absolute inset-0">Gomandap</span>
          <motion.span 
            className="bg-gradient-to-r from-[#FFC107] via-[#E91E63] to-[#FFC107] bg-[length:200%_auto] text-transparent bg-clip-text relative z-10 drop-shadow-[0_0_20px_rgba(255,193,7,0.4)] block"
            initial={{ opacity: 0, backgroundPosition: "0% center" }}
            animate={{ opacity: 1, backgroundPosition: "200% center" }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          >
            Gomandap
          </motion.span>
        </div>

        {/* Loading Bar Container */}
        <div className="w-56 md:w-72 h-[3px] bg-white/10 rounded-full overflow-hidden mb-5">
          {/* Progress Fill */}
          <motion.div 
            className="h-full bg-gradient-to-r from-[#FFC107] to-[#E91E63] shadow-[0_0_10px_#FFC107]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        
        {/* Loading Text */}
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#FFC107] text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold"
        >
          Orchestrating Magic...
        </motion.div>
      </div>

      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[50vw] md:h-[50vw] bg-gradient-to-tr from-[#FFC107]/5 to-[#E91E63]/5 rounded-full blur-[100px] pointer-events-none" />
    </motion.div>
  );
};

export default Preloader;
