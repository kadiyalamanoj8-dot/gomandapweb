const axios = require('axios');

async function scrapeOsmVendors(city, category, sendLog) {
    sendLog(`[OSM Overpass] Initializing blazing fast sweep for ${category} in ${city}...`);
    
    // Mapping generic categories to OSM amenity tags
    const categoryLower = category.toLowerCase();
    let osmTag = 'restaurant';
    if (categoryLower.includes('hotel')) osmTag = 'hotel';
    else if (categoryLower.includes('cafe')) osmTag = 'cafe';
    else if (categoryLower.includes('hospital')) osmTag = 'hospital';
    else if (categoryLower.includes('school')) osmTag = 'school';

    const overpassQuery = `
        [out:json][timeout:25];
        area["name"="${city}"]->.searchArea;
        (
          node["amenity"="${osmTag}"](area.searchArea);
          way["amenity"="${osmTag}"](area.searchArea);
          relation["amenity"="${osmTag}"](area.searchArea);
        );
        out center;
    `;
    
    const url = 'https://overpass-api.de/api/interpreter';
    
    try {
        const res = await axios.post(url, overpassQuery, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'GomandapScraper/1.0',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        const vendors = [];
        if (res.data && res.data.elements) {
            res.data.elements.forEach(el => {
                if (el.tags && el.tags.name) {
                    vendors.push({
                        name: el.tags.name,
                        address: [
                            el.tags['addr:housenumber'],
                            el.tags['addr:street'],
                            el.tags['addr:suburb'],
                            city
                        ].filter(Boolean).join(', '),
                        phone: el.tags['contact:phone'] || el.tags.phone || null,
                        website: el.tags['contact:website'] || el.tags.website || null,
                        lat: el.lat || (el.center && el.center.lat),
                        lng: el.lon || (el.center && el.center.lon),
                        source: 'OSM Overpass'
                    });
                }
            });
        }
        return vendors;
    } catch (error) {
        console.error('[OSM Error]', error.message);
        sendLog(`[OSM Overpass] Error fetching data: ${error.message}`);
        return [];
    }
}

module.exports = { scrapeOsmVendors };
