import React from 'react';

const ProtectedImage = ({ src, alt, className = '', containerClassName = '' }) => {
  const handleContextMenu = (e) => {
    e.preventDefault();
    alert("Images on Gomandap are protected and cannot be downloaded.");
  };

  const handleDragStart = (e) => {
    e.preventDefault();
  };

  return (
    <div className={`relative overflow-hidden select-none ${containerClassName}`}>
      <img 
        src={src} 
        alt={alt} 
        className={`${className} pointer-events-auto`} 
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        draggable="false"
      />
      {/* Transparent overlay to block interaction */}
      <div 
        className="absolute inset-0 z-10" 
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      ></div>
    </div>
  );
};

export default ProtectedImage;
