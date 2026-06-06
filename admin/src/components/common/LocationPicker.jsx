import React, { useState, useEffect, useRef, useId } from 'react';
import { OlaMaps } from 'olamaps-web-sdk';

const LocationPicker = ({ locationData, onChange }) => {
  const mapId = useId().replace(/:/g, '');
  const [mapLink, setMapLink] = useState(locationData?.googleMapsLink || '');
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapContainerRef = useRef(null);
  const olaMapsRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const isInitializing = useRef(false);

  // Initialize Map
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

        const map = await olaMaps.init({
          style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
          container: mapContainerRef.current,
          center: [lng, lat],
          zoom: 15,
          pitch: 60,
          bearing: 20
        });

        mapRef.current = map;

        // Custom Marker Element
        const el = document.createElement('div');
        el.className = 'w-10 h-10 bg-brand-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-grab active:cursor-grabbing';
        el.style.marginTop = '-20px';
        const inner = document.createElement('div');
        inner.className = 'w-2.5 h-2.5 bg-white rounded-full';
        el.appendChild(inner);

        const marker = olaMaps.addMarker({
          element: el,
          offset: [0, -20],
          anchor: 'bottom',
          draggable: true
        })
          .setLngLat([lng, lat])
          .addTo(map);
        
        markerRef.current = marker;

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          updatePosition(lngLat.lng, lngLat.lat);
        });

        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          marker.setLngLat([lng, lat]);
          updatePosition(lng, lat);
        });

      } catch (error) {
        console.error("Error initializing Ola Maps SDK:", error);
      } finally {
        isInitializing.current = false;
      }
    };

    initMap();
  }, []);

  // Sync external prop changes
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

  const updatePosition = async (lng, lat, skipReverseGeocode = false) => {
    let locationDataUpdate = {
        type: 'Point',
        coordinates: [lng, lat],
        googleMapsLink: mapLink
    };

    if (!skipReverseGeocode) {
      try {
        const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
        const res = await fetch(`https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${apiKey}`);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          const comp = data.results[0].address_components || [];
          const getComp = (types) => {
            const found = comp.find(c => types.some(t => c.types.includes(t)));
            return found ? found.long_name : '';
          };

          locationDataUpdate.parsedAddress = {
            village: getComp(['sublocality', 'neighborhood', 'route', 'locality']) || '',
            mandal: getComp(['administrative_area_level_3', 'administrative_area_level_2']) || '',
            district: getComp(['administrative_area_level_2', 'administrative_area_level_1']) || '',
            state: getComp(['administrative_area_level_1']) || ''
          };
        }
      } catch (error) {
        console.error("Ola Maps Reverse geocoding failed", error);
      }
    }
    
    onChange(locationDataUpdate);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchText.length > 2) {
        setIsSearching(true);
        try {
          const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
          const res = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(searchText)}&api_key=${apiKey}`);
          const data = await res.json();
          if (data.predictions) {
            setPredictions(data.predictions);
          }
        } catch(e) {
          console.error("Autocomplete failed", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setPredictions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSelectPrediction = async (prediction) => {
    setSearchText(prediction.description);
    setPredictions([]);
    try {
      const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
      const res = await fetch(`https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(prediction.description)}&api_key=${apiKey}`);
      const data = await res.json();
      if (data.geocodingResults && data.geocodingResults.length > 0) {
        const loc = data.geocodingResults[0].geometry.location;
        if (markerRef.current) markerRef.current.setLngLat([loc.lng, loc.lat]);
        if (mapRef.current) mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: 15 });
        updatePosition(loc.lng, loc.lat);
      }
    } catch(e) {
      console.error("Geocode failed", e);
    }
  };

  const handleLinkParse = () => {
    if (!mapLink) return;
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = mapLink.match(regex);
    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (markerRef.current) markerRef.current.setLngLat([lng, lat]);
        if (mapRef.current) mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
        updatePosition(lng, lat);
        alert('Coordinates extracted and mapped!');
    } else {
        alert('Could not find coordinates in the link. Please drop the pin manually on the map.');
        onChange({
            ...locationData,
            googleMapsLink: mapLink
        });
    }
  };

  const handleAutoCapture = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        if (markerRef.current) markerRef.current.setLngLat([longitude, latitude]);
        if (mapRef.current) mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });
        updatePosition(longitude, latitude);
      }, (error) => {
          alert("Please allow location access to auto-capture your venue.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative z-50">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Search Location</label>
        <div className="relative">
          <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search for an area, street, or venue..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary shadow-sm"
          />
          {isSearching && (
            <div className="absolute right-4 top-3.5">
              <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {predictions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
            {predictions.map((pred, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPrediction(pred)}
                className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3"
              >
                <span className="text-sm font-semibold text-gray-700">{pred.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Google Maps Link (Optional)</label>
        <div className="flex gap-2">
            <input 
                type="text" 
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                placeholder="Paste Google Maps URL"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary"
            />
            <button 
                type="button" 
                onClick={handleLinkParse}
                className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl font-bold whitespace-nowrap"
            >
                Parse Link
            </button>
        </div>
      </div>

      <div className="relative z-0">
        <div className="flex justify-between items-end mb-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Pin your exact location</label>
            <button 
                type="button" 
                onClick={handleAutoCapture}
                className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:text-brand-secondary transition-colors"
            >
                Locate Me
            </button>
        </div>
        
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0 relative cursor-crosshair group shadow-sm">
          <style>{`
            .maplibregl-ctrl-bottom-left,
            .maplibregl-ctrl-bottom-right,
            .maplibregl-ctrl-logo,
            .maplibregl-ctrl-attrib {
              display: none !important;
            }
          `}</style>
          <div ref={mapContainerRef} id={`ola-map-${mapId}`} style={{ width: '100%', height: '100%' }}></div>
          <div className="absolute bottom-2 left-2 z-[60] bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm flex items-center gap-1 pointer-events-none">
            <span className="text-[10px] font-black text-gray-800 tracking-wide uppercase">Gomandap <span className="text-gray-400 font-bold">Maps 3D v2</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
