import React, { useState, useEffect, useRef, useId } from 'react';
import { OlaMaps } from 'olamaps-web-sdk';

const LocationMapClient = ({ locationData }) => {
  const mapId = useId().replace(/:/g, '');
  const mapContainerRef = useRef(null);
  const olaMapsRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isInitializing.current) return;
    
    const initMap = async () => {
      isInitializing.current = true;
      try {
        const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
        if (!apiKey) return;

        const olaMaps = new OlaMaps({
          apiKey: apiKey,
          mode: "3d",
          threedTileset: "https://api.olamaps.io/tiles/vector/v1/3dtiles/tileset.json"
        });
        olaMapsRef.current = olaMaps;

        const lng = locationData?.coordinates && locationData.coordinates[0] !== 0 ? locationData.coordinates[0] : 78.9629;
        const lat = locationData?.coordinates && locationData.coordinates[0] !== 0 ? locationData.coordinates[1] : 20.5937;

        const map = olaMaps.init({
          style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
          container: mapContainerRef.current,
          center: [lng, lat],
          zoom: 15,
          pitch: 60,
          bearing: 20
        });

        mapRef.current = map;

        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-brand-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center';
        el.style.marginTop = '-16px';
        const inner = document.createElement('div');
        inner.className = 'w-2 h-2 bg-white rounded-full animate-ping';
        el.appendChild(inner);

        const marker = olaMaps.addMarker({
          element: el,
          offset: [0, -16],
          anchor: 'bottom',
          draggable: false
        })
          .setLngLat([lng, lat])
          .addTo(map);
        
        markerRef.current = marker;

      } catch (error) {
        console.error("Error initializing Ola Maps SDK:", error);
      } finally {
        isInitializing.current = false;
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current && locationData?.coordinates && locationData.coordinates[0] !== 0) {
      const lng = locationData.coordinates[0];
      const lat = locationData.coordinates[1];
      
      const currentLngLat = markerRef.current.getLngLat();
      if (Math.abs(currentLngLat.lng - lng) > 0.0001 || Math.abs(currentLngLat.lat - lat) > 0.0001) {
        markerRef.current.setLngLat([lng, lat]);
        mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
      }
    }
  }, [locationData]);

  return (
    <div className="space-y-4">
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0 relative group shadow-sm">
          <style>{`
            .maplibregl-ctrl-bottom-left,
            .maplibregl-ctrl-bottom-right,
            .maplibregl-ctrl-logo,
            .maplibregl-ctrl-attrib {
              display: none !important;
            }
          `}</style>
          <div ref={mapContainerRef} id={`ola-map-${mapId}`} style={{ width: '100%', height: '100%' }}></div>

          <div className="absolute bottom-2 left-2 z-[60] bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-white/20 flex items-center gap-1 pointer-events-none">
            <span className="text-[10px] font-black text-gray-800 tracking-wide uppercase">Gomandap <span className="text-gray-400 font-bold">Maps 3D v2</span></span>
          </div>
        </div>
        
        {locationData?.googleMapsLink && (
            <div className="text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-700">Get Directions:</span><br/>
                <a href={locationData.googleMapsLink} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline break-all">
                    {locationData.googleMapsLink}
                </a>
            </div>
        )}
    </div>
  );
};

export default LocationMapClient;
