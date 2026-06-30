const axios = require('axios');

async function testQuery(queryDesc, query) {
  try {
    const res = await axios.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'GomandapScraper' }
    });
    const localities = [...new Set(res.data.elements.map(el => el.tags.name).filter(Boolean))];
    console.log(`\n--- ${queryDesc} ---`);
    console.log(`Found ${localities.length} localities.`);
    console.log(localities.join(', '));
  } catch(e) {
    console.log(`Error on ${queryDesc}:`, e.message);
  }
}

const queryAdminLevel8 = `
[out:json][timeout:25];
area['name'='Guntur']['admin_level'='8']->.searchArea;
(
  node['place'='suburb'](area.searchArea);
  node['place'='neighbourhood'](area.searchArea);
);
out body;
`;

const queryRadius = `
[out:json][timeout:25];
node["place"="city"]["name"="Guntur"]->.center;
(
  node["place"="suburb"](around.center:7000);
  node["place"="neighbourhood"](around.center:7000);
);
out body;
`;

(async () => {
  await testQuery('Admin Level 8 (Strict City Boundary)', queryAdminLevel8);
  await testQuery('Radius 7KM from City Center', queryRadius);
})();
