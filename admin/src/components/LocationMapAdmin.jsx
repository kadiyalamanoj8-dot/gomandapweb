import React, { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const LocationMapAdmin = ({ vendorId, locationData }) => {
  const [viewState, setViewState] = useState({
    longitude: locationData?.coordinates && locationData.coordinates[0] !== 0 ? locationData.coordinates[0] : 78.9629,
    latitude: locationData?.coordinates && locationData.coordinates[0] !== 0 ? locationData.coordinates[1] : 20.5937,
    zoom: 15,
    pitch: 60,
    bearing: 20
  });

  const mapRef = React.useRef(null);

  useEffect(() => {
    // Fix for "corrupted" map when rendering inside animated/hidden containers
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (locationData?.coordinates && locationData.coordinates[0] !== 0) {
      setViewState(prev => ({
        ...prev,
        longitude: locationData.coordinates[0],
        latitude: locationData.coordinates[1]
      }));
    }
  }, [locationData]);

  const transformRequest = (url, resourceType) => {
    const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
    if (url.includes('api.olamaps.io')) {
      return { url: url.includes('?') ? `${url}&api_key=${apiKey}` : `${url}?api_key=${apiKey}` };
    }
    return { url };
  };

  return (
    <div className="space-y-4">
        {!import.meta.env.VITE_OLA_MAPS_API_KEY ? (
          <div className="h-[250px] w-full rounded-2xl border-2 border-dashed border-red-200 bg-red-50 flex flex-col items-center justify-center p-6 text-center z-0 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <h3 className="text-red-800 font-black text-lg mb-1">Map Engine Offline</h3>
            <p className="text-red-600 text-sm font-semibold">The Ola Maps API Key is missing.<br/>Please check the <code>.env</code> file and restart the Admin server.</p>
          </div>
        ) : (
          <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0 relative group">
            <style>{`
              .maplibregl-ctrl-bottom-left,
              .maplibregl-ctrl-bottom-right,
              .maplibregl-ctrl-logo,
              .maplibregl-ctrl-attrib {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
              }
            `}</style>
            <Map
              ref={mapRef}
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              onLoad={(e) => {
                const map = e.target;
                try {
                  if (!map.getLayer('3d-buildings')) {
                    const layers = map.getStyle().layers;
                    let labelLayerId;
                    for (let i = 0; i < layers.length; i++) {
                      if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                        labelLayerId = layers[i].id;
                        break;
                      }
                    }
                    map.addLayer(
                      {
                        'id': '3d-buildings',
                        'source': 'openmaptiles',
                        'source-layer': 'building',
                        'filter': ['==', 'extrude', 'true'],
                        'type': 'fill-extrusion',
                        'minzoom': 15,
                        'paint': {
                          'fill-extrusion-color': '#e2e8f0',
                          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
                          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
                          'fill-extrusion-opacity': 0.8
                        }
                      },
                      labelLayerId
                    );
                  }
                } catch(err) {
                  console.warn("Could not add 3D buildings", err);
                }
              }}
              mapStyle="https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json"
              transformRequest={transformRequest}
              attributionControl={false}
              style={{ width: '100%', height: '100%' }}
            >
              <Marker 
                longitude={viewState.longitude} 
                latitude={viewState.latitude} 
                anchor="bottom"
              >
                <div className="w-8 h-8 bg-brand-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </Marker>
            </Map>

            <div className="absolute bottom-2 left-2 z-[60] bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-white/20 flex items-center gap-1 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-brand-primary">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-black text-gray-800 tracking-wide uppercase">Gomandap <span className="text-gray-400 font-bold">Maps</span></span>
            </div>
          </div>
        )}
        
        {locationData?.googleMapsLink && (
            <div className="text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-4">
                <span className="font-bold text-gray-700">Vendor Provided Google Maps Link:</span><br/>
                <a href={locationData.googleMapsLink} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline break-all">
                    {locationData.googleMapsLink}
                </a>
            </div>
        )}
    </div>
  );
};

export default LocationMapAdmin;
