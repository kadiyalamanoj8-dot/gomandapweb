import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';

const DEFAULT_IMAGES = [];

const HeroMarquee = ({ 
  images = [], 
  width = '100vw', 
  height = '100%', 
  positionY = '0px', 
  speed = 4,
  isMobile
}) => {
  const carouselImages = images && images.length > 0 ? images : DEFAULT_IMAGES;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!carouselImages || carouselImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, speed * 1000);
    return () => clearInterval(timer);
  }, [carouselImages.length, speed]);

  if (!carouselImages || carouselImages.length === 0) return null;

  return (
    <div 
      className="absolute z-20 flex items-center justify-center pointer-events-none"
      style={{
        width: width,
        height: height,
        transform: `translateY(${positionY})`
      }}
    >
      <AnimatePresence mode="wait">
        <m.img
          key={currentIndex}
          src={carouselImages[currentIndex]}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute w-full h-full max-w-full max-h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] mix-blend-screen"
          alt={`Mandap Background ${currentIndex}`}
          style={{ willChange: isMobile ? 'auto' : 'transform, opacity, filter' }}
          loading="lazy"
        />
      </AnimatePresence>
    </div>
  );
};

export default HeroMarquee;
