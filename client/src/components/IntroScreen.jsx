import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

const IntroScreen = ({ onComplete }) => {
  const [sequence, setSequence] = useState('CLOSED');
  const [showCouple, setShowCouple] = useState(false);
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const zoomScale = useSpring(1, { damping: 40, stiffness: 60 });
  const zoomZ = useSpring(0, { damping: 40, stiffness: 60 });

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);

  const bgX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const bgY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const midX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const midY = useTransform(smoothY, [-1, 1], [-25, 25]);

  const frontX = useTransform(smoothX, [-1, 1], [-50, 50]);
  const frontY = useTransform(smoothY, [-1, 1], [-50, 50]);

  const doorRotateYLeft = useSpring(0, { damping: 30, stiffness: 50 });
  const doorRotateYRight = useSpring(0, { damping: 30, stiffness: 50 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sequence !== 'CLOSED' || !containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const x = (e.clientX / clientWidth - 0.5) * 2;
      const y = (e.clientY / clientHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    let rAF;
    const handleOrientation = (e) => {
      if (sequence !== 'CLOSED' || !e.gamma || !e.beta) return;
      
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        let x = 0;
        let y = 0;
        
        const orientation = window.orientation || 0;
        
        if (orientation === 90) {
          x = e.beta;
          y = -e.gamma;
        } else if (orientation === -90) {
          x = -e.beta;
          y = e.gamma;
        } else {
          x = e.gamma;
          y = e.beta - 45;
        }

        const normalizedX = Math.max(-1, Math.min(1, x / 45));
        const normalizedY = Math.max(-1, Math.min(1, y / 45));
        
        mouseX.set(normalizedX);
        mouseY.set(normalizedY);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [sequence, mouseX, mouseY]);

  const handleOpen = () => {
    // Request iOS 13+ Gyroscope Permissions
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            console.log('Gyroscope permission granted');
          }
        })
        .catch(console.error);
    }

    setSequence('FLYING');
    doorRotateYLeft.set(-110);
    doorRotateYRight.set(110);
    zoomScale.set(1.4);
    zoomZ.set(400);
    mouseX.set(0);
    mouseY.set(0);

    setTimeout(() => {
      setShowCouple(true);
    }, 1500);

    setTimeout(() => {
      onComplete();
    }, 5000); 
  };

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[9999] overflow-hidden bg-black font-sans select-none"
      style={{ perspective: '1200px' }}
    >
      <motion.div 
        animate={{ translateZ: sequence === 'CLOSED' ? 0 : 400 }}
        transition={{ duration: 4.5, ease: [0.25, 1, 0.5, 1] }} 
        style={{ 
          rotateX: sequence === 'CLOSED' ? 0 : rotateX, 
          rotateY: sequence === 'CLOSED' ? 0 : rotateY, 
          transformStyle: "preserve-3d" 
        }}
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
      >
        {/* Layer 1: Background Temple (Z: -600) */}
        <motion.div style={{ x: bgX, y: bgY, translateZ: -600, scale: 1.2 }} className="absolute inset-[-10%] z-0">
          <img src="/images/temple_background.webp" alt="Background" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
        </motion.div>

        {/* Layer 2: Intricate Mandap Frame (Z: -100) */}
        <motion.div style={{ x: midX, y: midY, translateZ: -100, scale: 1.2 }} className="absolute inset-0 z-20 flex items-center justify-center">
          <img src="/images/temple_mandap.webp" alt="Mandap" className="w-[100vw] md:w-[90vw] h-[80vh] md:h-[90vh] object-contain mix-blend-screen opacity-100" style={{ filter: 'drop-shadow(0 0 30px rgba(255,193,7,0.3))' }} />
        </motion.div>

        <motion.div style={{ x: frontX, y: frontY, translateZ: 100, scale: 1.1 }} className="absolute inset-[-5%] z-30 flex items-center justify-center pt-[15vh] md:pt-[10vh]">
          <AnimatePresence>
            {showCouple && (
              <motion.img 
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px) drop-shadow(0 0 0px transparent)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px) drop-shadow(0 0 50px rgba(255,193,7,0.6))" }}
                transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
                src="/images/couple_transparent.webp" 
                alt="Couple" 
                className="w-[90vw] md:w-[60vw] max-h-[50vh] md:max-h-[60vh] object-contain object-bottom"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none" style={{ transform: "translateZ(150px)" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "120vh", x: Math.random() * window.innerWidth, rotate: 0 }}
              animate={{ y: "-20vh", x: `calc(${Math.random() * 100}vw)`, rotate: 360 }}
              transition={{ duration: Math.random() * 8 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
              className={`absolute w-3 h-3 bg-gradient-to-br ${
                i % 3 === 0 ? 'from-[#FFC107] to-white shadow-[0_0_15px_#FFC107]' : 
                'from-[#E91E63] to-[#F48FB1] shadow-[0_0_10px_#E91E63] rounded-tr-full rounded-bl-full' 
              } blur-[1px] opacity-80`}
            />
          ))}
        </div>

        {/* Layer 4: The 3D Doors (Z: 50) */}
        <AnimatePresence>
          {sequence === 'CLOSED' && (
            <motion.div className="absolute inset-[-5%] z-[100] flex pointer-events-none" style={{ transform: "translateZ(50px)", willChange: "transform" }}>
              <motion.div exit={{ rotateY: 105, opacity: 0 }} transition={{ duration: 3, ease: [0.25, 1, 0.5, 1] }} className="w-1/2 h-full pointer-events-auto" style={{ backgroundImage: "url('/images/real_temple_doors.webp')", backgroundSize: "200% 100%", backgroundPosition: "left", transformOrigin: "left", boxShadow: "50px 0 100px rgba(0,0,0,1)", willChange: "transform, opacity" }} />
              <motion.div exit={{ rotateY: -105, opacity: 0 }} transition={{ duration: 3, ease: [0.25, 1, 0.5, 1] }} className="w-1/2 h-full pointer-events-auto" style={{ backgroundImage: "url('/images/real_temple_doors.webp')", backgroundSize: "200% 100%", backgroundPosition: "right", transformOrigin: "right", boxShadow: "-50px 0 100px rgba(0,0,0,1)", willChange: "transform, opacity" }} />
              
              <motion.div exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 1 }} className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
                <button onClick={handleOpen} className="relative w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center cursor-pointer group">
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-full border border-[#FFC107]/50 transition-all duration-700 shadow-[0_0_40px_rgba(255,193,7,0.3)] group-hover:shadow-[0_0_80px_rgba(255,193,7,0.8)]"></div>
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
    </motion.div>
  );
};

export default IntroScreen;
