const fs = require('fs');
const https = require('https');
const path = require('path');

// Direct raw URL of the comprehensive Indian states, districts, tehsils, and villages JSON database
const INDIA_GEO_URL = 'https://raw.githubusercontent.com/pranshumaheshwari/indian-cities-and-villages/master/data.json';
const TARGET_PATH = path.join(__dirname, '../gomandap-scraper/server/db/india_villages.json');

console.log('=== GEOGRAPHIC DATA DOWNLOADER ===');
console.log(`Target database path: ${TARGET_PATH}`);

function downloadIndiaGeo() {
  console.log(`Downloading latest India census hierarchy data from: ${INDIA_GEO_URL}`);
  
  const file = fs.createWriteStream(TARGET_PATH);
  
  https.get(INDIA_GEO_URL, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Error: Server responded with status code ${res.statusCode}`);
      return;
    }

    res.pipe(file);
    
    file.on('finish', () => {
      file.close(() => {
        console.log('Download complete.');
        try {
          const stats = fs.statSync(TARGET_PATH);
          console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
          
          // Verify JSON structure
          const data = JSON.parse(fs.readFileSync(TARGET_PATH, 'utf8'));
          if (Array.isArray(data)) {
            console.log(`✅ Successfully verified and loaded ${data.length} states in the database!`);
          } else {
            console.warn('⚠️ Warning: File downloaded but doesn\'t seem to be a standard JSON array.');
          }
        } catch (err) {
          console.error('❌ Failed to verify downloaded JSON database:', err.message);
        }
      });
    });
  }).on('error', (err) => {
    fs.unlink(TARGET_PATH, () => {});
    console.error('❌ Download failed:', err.message);
  });
}

// Ensure the db folder exists
const dbDir = path.dirname(TARGET_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

downloadIndiaGeo();
