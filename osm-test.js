const axios = require('axios');
const fs = require('fs');

const overpassQuery = `
[out:json][timeout:25];
area[name='Guntur']->.searchArea;
(
  node['place'='suburb'](area.searchArea);
  node['place'='neighbourhood'](area.searchArea);
  node['place'='town'](area.searchArea);
);
out body;
`;

axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
    headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'GomandapScraper/1.0',
        'Accept': 'application/json'
    },
    timeout: 15000
}).then(res => {
    fs.writeFileSync('osm_guntur_raw_response.json', JSON.stringify(res.data, null, 2));
    const localities = [...new Set(res.data.elements.map(el => el.tags.name).filter(Boolean))];
    console.log('Successfully fetched ' + localities.length + ' localities directly from OSM.');
    console.log('Saved raw JSON data to osm_guntur_raw_response.json');
    console.log('\n--- LOCALITIES ---');
    console.log(localities.join('\n'));
}).catch(err => {
    console.log('Error:', err.message);
});
