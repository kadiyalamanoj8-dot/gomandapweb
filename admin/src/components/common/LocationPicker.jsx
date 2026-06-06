import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const LocationPicker = ({ locationData, onChange }) => {
  const [viewState, setViewState] = useState({
    longitude: locationData?.coordinates && locationData.coordinates[0] !== 0 ? locationData.coordinates[0] : 78.9629,
    latitude: locationData?.coordinates && locationData.coordinates[0] !== 0 ? locationData.coordinates[1] : 20.5937,
    zoom: 15,
    pitch: 60,
    bearing: 20
  });

  const [mapLink, setMapLink] = useState(locationData?.googleMapsLink || '');
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);

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

  const updatePosition = async (lng, lat, skipReverseGeocode = false) => {
    setViewState(prev => ({ ...prev, longitude: lng, latitude: lat }));
    
    let locationDataUpdate = {
        type: 'Point',
        coordinates: [lng, lat],
        googleMapsLink: mapLink,
        isLocationLocked: locationData?.isLocationLocked || false
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
        updatePosition(longitude, latitude);
      }, (error) => {
          alert("Please allow location access to auto-capture your venue.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const transformRequest = (url, resourceType) => {
    const apiKey = import.meta.env.VITE_OLA_MAPS_API_KEY;
    if (url.includes('api.olamaps.io')) {
      return { url: url.includes('?') ? `${url}&api_key=${apiKey}` : `${url}?api_key=${apiKey}` };
    }
    return { url };
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative z-50">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Search Location</label>
        <div className="relative">
          <input 
              type="text" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search for an area, street, or venue..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:outline-none focus:border-brand-primary shadow-sm"
              disabled={locationData?.isLocationLocked}
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
                <svg className="w-5 h-5 text-brand-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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
                disabled={locationData?.isLocationLocked}
            />
            <button 
                type="button" 
                onClick={handleLinkParse}
                disabled={locationData?.isLocationLocked}
                className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl font-bold whitespace-nowrap disabled:opacity-50"
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
                disabled={locationData?.isLocationLocked}
                className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:text-brand-secondary transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                Locate Me
            </button>
        </div>
        {locationData?.isLocationLocked && (
            <div className="text-xs text-red-500 mb-2 font-bold">Your location has been locked by Admin and cannot be changed.</div>
        )}
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0 relative cursor-crosshair group">
          {/* Inject CSS to hide all logos and attributions */}
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
            onClick={(e) => {
              if (!locationData?.isLocationLocked) {
                updatePosition(e.lngLat.lng, e.lngLat.lat);
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
              draggable={!locationData?.isLocationLocked}
              onDragEnd={e => updatePosition(e.lngLat.lng, e.lngLat.lat)}
            >
              <div className="w-8 h-8 bg-brand-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </div>
            </Marker>
          </Map>
          
          {/* Custom Gomandap Map Watermark */}
          <div className="absolute bottom-2 left-2 z-[60] bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-white/20 flex items-center gap-1 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-brand-primary">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-black text-gray-800 tracking-wide uppercase">Gomandap <span className="text-gray-400 font-bold">Maps</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
