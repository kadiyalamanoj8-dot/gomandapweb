import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Lock, Unlock } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
};

const LocationMapAdmin = ({ vendorId, locationData }) => {
  const [position, setPosition] = useState(
    locationData?.coordinates && locationData.coordinates[0] !== 0 
      ? { lat: locationData.coordinates[1], lng: locationData.coordinates[0] } 
      : { lat: 20.5937, lng: 78.9629 } // Default center of India
  );
  const [isLocked, setIsLocked] = useState(locationData?.isLocationLocked || false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (locationData?.coordinates && locationData.coordinates[0] !== 0) {
      setPosition({ lat: locationData.coordinates[1], lng: locationData.coordinates[0] });
    }
  }, [locationData]);

  const toggleLock = async () => {
    setIsSaving(true);
    try {
        // Fetch call to update lock status
        const response = await fetch(`http://localhost:5000/api/vendors/${vendorId}/location-lock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isLocationLocked: !isLocked })
        });
        const data = await response.json();
        if (data.success) {
            setIsLocked(!isLocked);
        } else {
            alert('Failed to update location lock.');
        }
    } catch (error) {
        console.error("Error updating lock status:", error);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div>
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Location Pin Access</span>
                <span className={`text-sm font-black ${isLocked ? 'text-red-600' : 'text-green-600'}`}>
                    {isLocked ? 'Locked (Vendor cannot change)' : 'Unlocked (Vendor can change)'}
                </span>
            </div>
            <button 
                onClick={toggleLock} 
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 ${
                    isLocked ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                }`}
            >
                {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                {isLocked ? 'Unlock Pin' : 'Lock Pin'}
            </button>
        </div>

        <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-gray-200 z-0 relative">
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            {position && <Marker position={position}></Marker>}
            <MapUpdater position={position} />
          </MapContainer>
        </div>
        
        {locationData?.googleMapsLink && (
            <div className="text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
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
