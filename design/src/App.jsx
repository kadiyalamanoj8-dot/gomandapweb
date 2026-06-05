import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

function App() {
  const [sequence, setSequence] = useState('CLOSED');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Extremely smooth, heavy spring for a premium cinematic feel (no wobbling)
  const springConfig = { damping: 80, stiffness: 40 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle Parallax Tracking
  // Rotate the camera slightly
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);

  // Translate layers slightly for 3D parallax
  const bgX = useTransform(smoothX, [-0.5, 0.5], [40, -40]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], [40, -40]);
  
  const midX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const midY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
  
  const frontX = useTransform(smoothX, [-0.5, 0.5], [-40, 40]);
  const frontY = useTransform(smoothY, [-0.5, 0.5], [-40, 40]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sequence === 'DASHBOARD') return; // Stop tracking when dashboard is up
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, sequence]);

  const handleOpen = () => {
    setSequence('FLYING');
    
    // Switch to Dashboard after the doors open
    setTimeout(() => {
      setSequence('DASHBOARD');
    }, 4000); 
  };

  // Camera pushes forward 400px into the scene
  const cameraZ = sequence === 'CLOSED' ? 0 : 400;

  const sceneBlur = sequence === 'DASHBOARD' ? 'blur(12px)' : 'blur(0px)';
  const sceneOpacity = sequence === 'DASHBOARD' ? 0.3 : 1;

  return (
    <div className="h-[100dvh] w-screen bg-black overflow-hidden flex items-center justify-center font-sans perspective-1200 select-none">
      
      {/* 3D World Camera Container */}
      <motion.div 
        animate={{ 
          translateZ: cameraZ,
          opacity: sceneOpacity 
        }}
        transition={{ duration: 4.5, ease: [0.25, 1, 0.5, 1] }} 
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          filter: sceneBlur,
          transition: "filter 2s ease-out, opacity 2s ease-out"
        }}
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
      >
        
        {/* Layer 1: Background Temple (Z: -600) */}
        <motion.div 
          style={{ x: bgX, y: bgY, translateZ: -600, scale: 2 }}
          className="absolute inset-[-10%] z-0"
        >
          <img src="/temple_background.png" alt="Temple Background" className="w-full h-full object-cover opacity-90 brightness-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-[#FFC107]/10 to-black/60" />
        </motion.div>

        {/* Layer 2: Intricate Mandap Frame (Z: -100) */}
        <motion.div 
          style={{ x: midX, y: midY, translateZ: -100, scale: 1.2 }}
          className="absolute inset-0 z-20 flex items-center justify-center"
        >
          <img 
            src="/temple_mandap.png" 
            alt="Temple Mandap Frame" 
            className="w-[100vw] md:w-[90vw] h-[80vh] md:h-[90vh] object-contain mix-blend-screen opacity-100" 
            style={{ filter: 'drop-shadow(0 0 30px rgba(255,193,7,0.3))' }}
          />
        </motion.div>

        {/* Layer 3: The Couple Appears (Z: 100) */}
        <motion.div 
          style={{ x: frontX, y: frontY, translateZ: 100, scale: 1.1 }}
          className="absolute inset-[-5%] z-30 flex items-center justify-center pt-[15vh] md:pt-[10vh]"
        >
          <AnimatePresence>
            {sequence !== 'CLOSED' && (
              <motion.img 
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px) contrast(1) brightness(1)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px) contrast(1.2) brightness(1.1)" }}
                transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
                src="/couple_by_fire.png" 
                alt="Couple by fire" 
                className="w-[90vw] md:w-[60vw] max-h-[50vh] md:max-h-[60vh] object-contain object-bottom"
                style={{ 
                  mixBlendMode: 'screen', 
                  WebkitMaskImage: 'radial-gradient(ellipse at center 60%, black 40%, transparent 80%)',
                  maskImage: 'radial-gradient(ellipse at center 60%, black 40%, transparent 80%)'
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Particles (Z: 150) */}
        <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none" style={{ transform: "translateZ(150px)" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "120vh", x: Math.random() * window.innerWidth, rotate: 0 }}
              animate={{ y: "-20vh", x: `calc(${Math.random() * 100}vw)`, rotate: 360 }}
              transition={{ duration: Math.random() * 8 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
              className={`absolute w-3 h-3 bg-gradient-to-br ${
                i % 3 === 0 ? 'from-[#FFC107] to-white shadow-[0_0_15px_#FFC107]' : 
                'from-[#ff9800] to-[#ffd700] shadow-[0_0_10px_#ff9800] rounded-tr-full rounded-bl-full' 
              } blur-[1px] opacity-80`}
            />
          ))}
        </div>

        {/* Layer 4: The 3D Real Temple Doors (Z: 300) */}
        <AnimatePresence>
          {sequence === 'CLOSED' && (
            <motion.div 
              className="absolute inset-[-5%] z-[100] flex pointer-events-none"
              style={{ transform: "translateZ(300px)" }} 
            >
              {/* Left Door */}
              <motion.div 
                exit={{ rotateY: 105, opacity: 0 }}
                transition={{ duration: 3, ease: [0.25, 1, 0.5, 1] }}
                className="w-1/2 h-full pointer-events-auto"
                style={{ 
                  backgroundImage: "url('/real_temple_doors.png')", 
                  backgroundSize: "200% 100%", 
                  backgroundPosition: "left", 
                  transformOrigin: "left", 
                  boxShadow: "50px 0 100px rgba(0,0,0,1)" 
                }}
              />
              {/* Right Door */}
              <motion.div 
                exit={{ rotateY: -105, opacity: 0 }}
                transition={{ duration: 3, ease: [0.25, 1, 0.5, 1] }}
                className="w-1/2 h-full pointer-events-auto"
                style={{ 
                  backgroundImage: "url('/real_temple_doors.png')", 
                  backgroundSize: "200% 100%", 
                  backgroundPosition: "right", 
                  transformOrigin: "right", 
                  boxShadow: "-50px 0 100px rgba(0,0,0,1)" 
                }}
              />
              
              <motion.div 
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto"
              >
                <button 
                  onClick={handleOpen}
                  className="relative w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center cursor-pointer group"
                >
                  <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-full border border-[#FFC107]/50 transition-all duration-700 shadow-[0_0_40px_rgba(255,193,7,0.3)] group-hover:shadow-[0_0_80px_rgba(255,193,7,0.8)]"
                  ></div>
                  <div className="absolute inset-2 border-2 border-dashed border-[#FFC107]/60 rounded-full animate-[spin_12s_linear_infinite]"></div>
                  <div className="relative flex flex-col items-center">
                    <span className="text-[#FFC107] font-black text-2xl md:text-4xl tracking-tighter mb-1 md:mb-2 drop-shadow-xl">Gomandap</span>
                    <span className="text-white/90 text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold">Touch to Enter</span>
                  </div>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* The Dashboard UI overlay */}
      <AnimatePresence>
        {sequence === 'DASHBOARD' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-auto px-4 md:px-8 py-10"
          >
            <div className="w-full max-w-6xl h-full md:h-[85vh] bg-white/5 backdrop-blur-3xl rounded-3xl md:rounded-[2rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
              <div className="h-16 md:h-20 border-b border-white/10 flex items-center px-6 md:px-8 justify-between bg-black/40">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#E91E63] to-[#FFC107] flex items-center justify-center text-white font-black text-lg md:text-xl shadow-[0_0_20px_rgba(233,30,99,0.4)]">G</div>
                  <span className="text-white font-bold text-lg md:text-2xl tracking-widest uppercase">Gomandap</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="hidden md:block text-white/60 text-sm tracking-widest uppercase font-bold">Welcome, Taj Mandap</span>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20"></div>
                </div>
              </div>
              
              <div className="flex-1 p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 overflow-y-auto">
                <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                  <span className="text-white/50 font-bold uppercase tracking-widest text-xs group-hover:text-white transition-colors">Total Bookings</span>
                  <span className="text-4xl md:text-5xl font-black text-white mt-2 md:mt-4">1,248</span>
                  <span className="text-[#FFC107] text-xs md:text-sm mt-4 md:mt-6 font-bold">+12% this month</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                  <span className="text-white/50 font-bold uppercase tracking-widest text-xs group-hover:text-white transition-colors">Revenue</span>
                  <span className="text-4xl md:text-5xl font-black text-white mt-2 md:mt-4">₹4.2L</span>
                  <span className="text-[#E91E63] text-xs md:text-sm mt-4 md:mt-6 font-bold">+5% this month</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                  <span className="text-white/50 font-bold uppercase tracking-widest text-xs group-hover:text-white transition-colors">Active Leads</span>
                  <span className="text-4xl md:text-5xl font-black text-white mt-2 md:mt-4">24</span>
                  <span className="text-green-400 text-xs md:text-sm mt-4 md:mt-6 font-bold">5 new today</span>
                </div>
                
                <div className="md:col-span-3 min-h-[250px] md:min-h-0 md:h-80 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center group hover:bg-white/10 transition-colors">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-dashed border-[#FFC107]/50 flex items-center justify-center mb-4 group-hover:border-[#FFC107] transition-colors">
                    <span className="text-[#FFC107]">✦</span>
                  </div>
                  <span className="text-white/40 font-bold tracking-widest uppercase text-xs md:text-sm group-hover:text-white/70 transition-colors">Interactive Graph Region</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        .perspective-1200 {
          perspective: 1200px;
        }
      `}</style>
    </div>
  );
}

export default App;
