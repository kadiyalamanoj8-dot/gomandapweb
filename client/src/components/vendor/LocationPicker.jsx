import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in Vite
import icon from 'leaflet/dist/images/.webp';
import iconShadow from 'leaflet/dist/images/.webp';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to update map view when position changes externally
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
};

const LocationMarker = ({ position, setPosition, isLocked }) => {
  useMapEvents({
    click(e) {
      if (!isLocked) {
        setPosition(e.latlng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const LocationPicker = ({ locationData, onChange }) => {
  const [position, setPosition] = useState(
    locationData?.coordinates && locationData.coordinates[0] !== 0 
      ? { lat: locationData.coordinates[1], lng: locationData.coordinates[0] } 
      : { lat: 20.5937, lng: 78.9629 } // Default center of India
  );

  const [mapLink, setMapLink] = useState(locationData?.googleMapsLink || '');

  useEffect(() => {
    if (locationData?.coordinates && locationData.coordinates[0] !== 0) {
      setPosition({ lat: locationData.coordinates[1], lng: locationData.coordinates[0] });
    }
  }, [locationData]);

  const updatePosition = async (latlng, skipReverseGeocode = false) => {
    setPosition(latlng);
    
    let locationDataUpdate = {
        type: 'Point',
        coordinates: [latlng.lng, latlng.lat],
        googleMapsLink: mapLink,
        isLocationLocked: locationData?.isLocationLocked || false
    };

    if (!skipReverseGeocode) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`);
        const data = await res.json();
        
        if (data.address) {
          locationDataUpdate.parsedAddress = {
            village: data.address.village || data.address.town || data.address.suburb || data.address.locality || '',
            mandal: data.address.county || data.address.subdistrict || '',
            district: data.address.state_district || data.address.city || '',
            state: data.address.state || ''
          };
        }
      } catch (error) {
        console.error("Reverse geocoding failed", error);
      }
    }
    
    onChange(locationDataUpdate);
  };

  const handleLinkParse = () => {
    if (!mapLink) return;
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = mapLink.match(regex);
    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        const newPos = { lat, lng };
        updatePosition(newPos);
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
        updatePosition({ lat: latitude, lng: longitude });
      }, (error) => {
          alert("Please allow location access to auto-capture your venue.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="space-y-4">
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
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0 relative">
          <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            <LocationMarker position={position} setPosition={updatePosition} isLocked={locationData?.isLocationLocked} />
            <MapUpdater position={position} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
