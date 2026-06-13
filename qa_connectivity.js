const http = require('http');

const testEndpoint = (url, method = 'GET', postData = null) => {
  return new Promise((resolve) => {
    const req = http.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data.substring(0, 100) });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 'ERROR', message: err.message });
    });

    if (postData) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(postData));
    }
    
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', message: 'Request timed out' });
    });

    req.end();
  });
};

async function runQA() {
  console.log("=== GOMANDAP SCRAPER (Port 5002) ===");
  const scraperTest1 = await testEndpoint('http://localhost:5002/api/knowledge');
  console.log(`- GET /api/knowledge -> Status: ${scraperTest1.status}`);
  const scraperTest2 = await testEndpoint('http://localhost:5002/api/vendors/stats');
  console.log(`- GET /api/vendors/stats -> Status: ${scraperTest2.status}`);

  console.log("\n=== GOMANDAP RESEARCH (Port 5003) ===");
  const researchTest1 = await testEndpoint('http://localhost:5003/api/research/start', 'POST', { query: 'test', deepCrawl: false });
  console.log(`- POST /api/research/start -> Status: ${researchTest1.status}`);
  
  // We expect a 404 for a bad job ID
  const researchTest2 = await testEndpoint('http://localhost:5003/api/research/status/invalid123');
  console.log(`- GET /api/research/status/invalid123 -> Status: ${researchTest2.status} (Expected 404)`);
}

runQA();
