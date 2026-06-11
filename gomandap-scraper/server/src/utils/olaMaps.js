const axios = require('axios');
const { getOlaMapsApiKey } = require('../config/settingsManager');

async function geocodeWithNominatim(locationQuery) {
  try {
    console.log(`[Nominatim Geocoding] Attempting to geocode: "${locationQuery}"`);
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: locationQuery,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        countrycodes: 'in'
      },
      headers: {
        'User-Agent': 'GomandapScraper/1.0 (contact@gomandap.com)'
      },
      timeout: 8000
    });

    if (response.data && response.data.length > 0) {
      const bestMatch = response.data[0];
      console.log(`[Nominatim Geocoding] Resolved to: ${bestMatch.display_name} (${bestMatch.lat}, ${bestMatch.lon})`);
      return {
        formattedLocation: bestMatch.display_name,
        lat: parseFloat(bestMatch.lat),
        lng: parseFloat(bestMatch.lon)
      };
    }
    console.warn(`[Nominatim Geocoding] No coordinates found for "${locationQuery}"`);
    return { formattedLocation: locationQuery.trim(), lat: null, lng: null };
  } catch (err) {
    console.error(`[Nominatim Geocoding Error] Failed to geocode "${locationQuery}":`, err.message);
    return { formattedLocation: locationQuery.trim(), lat: null, lng: null };
  }
}

/**
 * Validates and geocodes a location string using Ola Maps Places API
 * @param {string} locationQuery - The raw location string (e.g. "banquets near hyd")
 * @returns {Promise<{ formattedLocation: string, lat: number, lng: number } | null>}
 */
async function geocodeLocation(locationQuery) {
  if (!locationQuery || locationQuery.trim().length === 0) return null;
  
  const apiKey = getOlaMapsApiKey();
  
  // If no API key is provided, gracefully fallback to Nominatim
  if (!apiKey || apiKey.trim().length === 0) {
    console.warn('[Ola Maps] No API key configured. Falling back to Nominatim.');
    return geocodeWithNominatim(locationQuery);
  }

  try {
    // Call Ola Maps Geocoding / Places API
    // Note: Assuming standard REST endpoint structure for Ola Maps. 
    // If exact endpoint differs, it handles the standard mapping for query.
    const response = await axios.get(`https://api.olamaps.io/places/v1/geocode`, {
      params: {
        address: locationQuery,
        api_key: apiKey
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (response.data && response.data.geocodingResults && response.data.geocodingResults.length > 0) {
      const bestMatch = response.data.geocodingResults[0];
      return {
        formattedLocation: bestMatch.formatted_address,
        lat: bestMatch.geometry.location.lat,
        lng: bestMatch.geometry.location.lng,
        viewport: bestMatch.geometry.viewport // Useful for bounding box search
      };
    }
    
    // If Ola Maps finds nothing, fallback to Nominatim
    return geocodeWithNominatim(locationQuery);
  } catch (error) {
    console.error(`[Ola Maps Error] Failed to geocode "${locationQuery}":`, error.message);
    // Fallback to Nominatim so scraper doesn't completely halt
    return geocodeWithNominatim(locationQuery);
  }
}

async function autocompleteLocation(text) {
  if (!text || text.trim().length === 0) return [];
  const apiKey = getOlaMapsApiKey();
  if (!apiKey || apiKey.trim().length === 0) return [];

  try {
    const response = await axios.get(`https://api.olamaps.io/places/v1/autocomplete`, {
      params: { input: text, api_key: apiKey },
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });
    
    if (response.data && response.data.predictions) {
      return response.data.predictions.map(p => p.description);
    }
    return [];
  } catch (error) {
    console.error(`[Ola Maps Autocomplete Error]:`, error.message);
    return [];
  }
}

module.exports = {
  geocodeLocation,
  autocompleteLocation
};
