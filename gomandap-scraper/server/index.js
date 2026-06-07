const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { chromium, firefox } = require('playwright');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5002;
const DATA_FILE = path.join(__dirname, 'data', 'scraped_vendors.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper to read data
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
// Helper to write data
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Load regions
const REGIONS_FILE = path.join(__dirname, 'data', 'regions.json');
const getRegions = () => fs.existsSync(REGIONS_FILE) ? JSON.parse(fs.readFileSync(REGIONS_FILE, 'utf-8')) : {};

const CATEGORIES = [
  "Banquet Halls", "Kalyana Mandapams", "Open Lawns & Farmhouses", 
  "Resorts & Destination Venues", "5-Star Hotels", "Party & Mini Halls", 
  "Temples & Ashrams", "Wedding Photographers", "Candid Photographers", 
  "Pre-Wedding Shoots", "Cinematographers", "Drone Specialists", 
  "Instant Photo Booths", "Decorators", "Caterers", "Makeup Artists", 
  "Mehndi Designers", "Wedding Clothes / Boutiques", "Jewelry Shops", 
  "Wedding Cards & Invites", "Cars & Buses (Travel)", "Astrologers / Pundits", 
  "Honeymoon Packages", "Event Planners"
];

// Batch Queue State
let batchQueue = [];
let isBatchRunning = false;
let batchProgress = { total: 0, completed: 0, currentTask: '', isActive: false };

// API: Get Regions
app.get('/api/regions', (req, res) => {
  res.json(getRegions());
});

// API: Get all scraped vendors
app.get('/api/vendors', (req, res) => {
  const data = readData();
  res.json(data);
});

// API: Update a vendor (verify/edit)
app.put('/api/vendors/:id', (req, res) => {
  const data = readData();
  const index = data.findIndex(v => v.id === req.params.id);
  if (index !== -1) {
    data[index] = { ...data[index], ...req.body, verified: true };
    writeData(data);
    res.json({ success: true, vendor: data[index] });
  } else {
    res.status(404).json({ error: 'Vendor not found' });
  }
});

// API: Delete a vendor
app.delete('/api/vendors/:id', (req, res) => {
  let data = readData();
  data = data.filter(v => v.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

// API: Clear all unverified vendors from queue
app.post('/api/vendors/clear-unverified', (req, res) => {
  let data = readData();
  data = data.filter(v => v.verified || v.pushed);
  writeData(data);
  res.json({ success: true });
});

// API: Push verified vendors to Production
app.post('/api/vendors/push', async (req, res) => {
  const data = readData();
  const verifiedVendors = data.filter(v => v.verified && !v.pushed);
  
  if (verifiedVendors.length === 0) {
    return res.status(400).json({ error: 'No verified unpushed vendors found.' });
  }

  try {
    let successCount = 0;
    for (const vendor of verifiedVendors) {
      // Create draft first
      const draftRes = await axios.post('https://gomandap-api.onrender.com/api/vendors/draft', {
        name: vendor.name,
        category: vendor.category,
        contact: { phone: vendor.phone || '' },
        address: { 
          street: vendor.address || '', 
          village: vendor.location || '', 
          district: vendor.city || '', 
          state: 'Andhra Pradesh' 
        },
        deepFeatures: {},
        status: 'approved'
      });
      
      if (draftRes.data.success) {
        vendor.pushed = true;
        vendor.pushedAt = new Date().toISOString();
        vendor.gomandapId = draftRes.data.data._id;
        successCount++;
      }
    }
    writeData(data);
    res.json({ success: true, pushed: successCount });
  } catch (error) {
    console.error('Error pushing to prod:', error);
    res.status(500).json({ error: 'Failed to push to production' });
  }
});

// API: Manual Scrape
app.post('/api/scrape', (req, res) => {
  const { category, district, mandal, engine } = req.body;
  if (!category || !district) return res.status(400).json({ error: 'Category and district required' });

  const queryLocation = mandal ? `${mandal}, ${district}` : district;

  res.json({ success: true, message: `Started scraping ${category} in ${queryLocation} using ${engine}` });

  if (engine === 'justdial') {
    scrapeJustDial(category, queryLocation).catch(console.error);
  } else if (engine === 'weddingbazaar') {
    scrapeWeddingBazaar(category, queryLocation).catch(console.error);
  } else if (engine === 'weddingwire') {
    scrapeWeddingWire(category, queryLocation).catch(console.error);
  } else if (engine === 'mandap') {
    scrapeMandap(category, queryLocation).catch(console.error);
  } else if (engine === 'google') {
    scrapeGooglePlaces(category, queryLocation).catch(console.error);
  } else {
    console.log("Engine not implemented.");
  }
});

// API: Batch Auto-Pilot Scrape
app.post('/api/scrape/batch', (req, res) => {
  const { district, category: targetCategory, mandal: targetMandal, engine } = req.body;
  if (!district || !engine) return res.status(400).json({ error: 'District and engine required' });

  const regions = getRegions();
  let mandals = regions[district] || [];

  // If a specific mandal is requested, only run for that mandal
  if (targetMandal && targetMandal !== 'All Mandals') {
    mandals = [targetMandal];
  } else if (!mandals || mandals.length === 0) {
    return res.status(400).json({ error: `No mandals found for district ${district}. Please update regions.json.` });
  }

  const categoriesToRun = (targetCategory && targetCategory !== 'All Categories') 
    ? [targetCategory] 
    : CATEGORIES;

  // Clear existing queue and start new
  batchQueue = [];
  
  for (const category of categoriesToRun) {
    for (const mandal of mandals) {
      batchQueue.push({ category, mandal, district, engine });
    }
  }

  batchProgress = {
    total: batchQueue.length,
    completed: 0,
    currentTask: 'Initializing...',
    isActive: true
  };

  res.json({ success: true, message: `Auto-pilot started for ${batchQueue.length} tasks in ${district}` });

  if (!isBatchRunning) {
    runBatchQueue();
  }
});

// API: Stop Batch Scrape
app.post('/api/scrape/batch/stop', (req, res) => {
  batchQueue = [];
  batchProgress.currentTask = 'Stopped manually';
  batchProgress.isActive = false;
  isBatchRunning = false;
  res.json({ success: true, message: 'Auto-pilot queue cleared and stopped.' });
});

// API: Get Batch Status
app.get('/api/scrape/batch/status', (req, res) => {
  res.json(batchProgress);
});

// Batch Runner
async function runBatchQueue() {
  isBatchRunning = true;

  while (batchQueue.length > 0) {
    const firstTask = batchQueue[0];
    const isGoogle = firstTask && firstTask.engine === 'google';
    
    // Run competitor bots sequentially (concurrency = 1) to avoid Akamai/Cloudflare IP bans
    const concurrencyLimit = isGoogle ? 3 : 1;
    const batchSlice = batchQueue.splice(0, concurrencyLimit);
    
    const promises = batchSlice.map(async (task) => {
      const queryLocation = `${task.mandal}, ${task.district}`;
      batchProgress.currentTask = `Scraping ${task.category} in ${queryLocation}`;
      
      try {
        if (task.engine === 'justdial') {
          await scrapeJustDial(task.category, queryLocation);
        } else if (task.engine === 'weddingbazaar') {
          await scrapeWeddingBazaar(task.category, queryLocation);
        } else if (task.engine === 'weddingwire') {
          await scrapeWeddingWire(task.category, queryLocation);
        } else if (task.engine === 'mandap') {
          await scrapeMandap(task.category, queryLocation);
        } else if (task.engine === 'google') {
          await scrapeGooglePlaces(task.category, queryLocation);
        }
      } catch (err) {
        console.error(`Batch Task Failed: ${task.category} in ${queryLocation}`, err);
      } finally {
        batchProgress.completed++;
      }
    });

    await Promise.all(promises);
    
    // Add a longer cool-down delay for competitor bots (8s) compared to Google (2s)
    const delayMs = isGoogle ? 2000 : 8000;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  isBatchRunning = false;
  batchProgress.isActive = false;
  batchProgress.currentTask = 'Completed';
}

async function scrapeGooglePlaces(category, location) {
  console.log(`Starting Google Maps browser scrape for ${category} in ${location}`);
  const query = `${category} in ${location}`;
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Abort image, font, and media loads to speed up scraping
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['image', 'media', 'font'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    console.log(`Navigating to Google Maps search: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Handle any cookie consent screens that Google often serves (e.g. consent.google.com)
    const consentBtn = page.locator('button:has-text("Accept all"), button:has-text("Reject all"), button:has-text("I agree"), button:has-text("Agree")');
    if (await consentBtn.count() > 0) {
      console.log("Google consent page active. Handling...");
      await consentBtn.first().click();
      await page.waitForTimeout(3000);
    }

    // Wait for the results feed or the details panel (if direct redirect)
    try {
      await Promise.race([
        page.waitForSelector('div[role="feed"]', { timeout: 15000 }),
        page.waitForSelector('[data-item-id="address"]', { timeout: 15000 })
      ]);
    } catch (e) {
      console.log("Could not find feed or place details within timeout");
    }

    let scrapedResults = [];

    // Case A: Redirected directly to a single business details page
    if (await page.locator('[data-item-id="address"]').count() > 0 && await page.locator('div[role="feed"]').count() === 0) {
      console.log("Redirected directly to a single business page.");
      const nameEl = page.locator('h1.DUwDvf');
      const name = await nameEl.count() > 0 ? await nameEl.innerText() : 'Google Maps Listing';
      
      let address = '';
      const addressEl = page.locator('[data-item-id="address"]');
      if (await addressEl.count() > 0) {
        const rawAddress = await addressEl.getAttribute('aria-label');
        address = rawAddress ? rawAddress.replace(/^Address:\s*/i, '') : '';
      }

      let phone = '';
      const phoneEl = page.locator('[data-item-id^="phone:tel:"]');
      if (await phoneEl.count() > 0) {
        const rawPhone = await phoneEl.getAttribute('aria-label');
        phone = rawPhone ? rawPhone.replace(/^Phone:\s*/i, '') : '';
      }

      let rating = null;
      const ratingEl = page.locator('div.F7nice').first();
      if (await ratingEl.count() > 0) {
        const text = await ratingEl.innerText();
        const match = text.match(/^([0-9.]+)/);
        if (match) rating = parseFloat(match[1]);
      }

      scrapedResults.push({
        name,
        address,
        phone,
        rating,
        mapsLink: page.url(),
        id: 'place_' + Date.now().toString() + Math.random().toString(36).substring(7)
      });
    } else {
      // Case B: Search results list is loaded
      const scrollable = page.locator('div[role="feed"]');
      if (await scrollable.count() > 0) {
        console.log("Scrolling through search results feed...");
        let previousScrollHeight = 0;
        let sameHeightCount = 0;
        
        while (sameHeightCount < 4) {
          previousScrollHeight = await scrollable.evaluate(el => el.scrollHeight);
          await scrollable.evaluate(el => el.scrollTop = el.scrollHeight);
          await page.waitForTimeout(1500);
          
          const newScrollHeight = await scrollable.evaluate(el => el.scrollHeight);
          if (newScrollHeight === previousScrollHeight) {
            sameHeightCount++;
          } else {
            sameHeightCount = 0;
          }
          
          const cardCount = await page.locator('a.hfpxzc').count();
          if (cardCount >= 30) {
            break;
          }
        }

        const cards = page.locator('a.hfpxzc');
        const count = await cards.count();
        console.log(`Found ${count} total business cards. Scraping details...`);

        for (let i = 0; i < Math.min(count, 30); i++) {
          const card = cards.nth(i);
          try {
            const name = await card.getAttribute('aria-label');
            const mapsLink = await card.getAttribute('href');
            
            await card.scrollIntoViewIfNeeded();
            await card.click();
            await page.waitForTimeout(1500);

            let address = '';
            const addressEl = page.locator('[data-item-id="address"]');
            if (await addressEl.count() > 0) {
              const rawAddress = await addressEl.getAttribute('aria-label');
              address = rawAddress ? rawAddress.replace(/^Address:\s*/i, '') : '';
            }

            let phone = '';
            const phoneEl = page.locator('[data-item-id^="phone:tel:"]');
            if (await phoneEl.count() > 0) {
              const rawPhone = await phoneEl.getAttribute('aria-label');
              phone = rawPhone ? rawPhone.replace(/^Phone:\s*/i, '') : '';
            }

            let rating = null;
            const ratingEl = page.locator('div.F7nice').first();
            if (await ratingEl.count() > 0) {
              const text = await ratingEl.innerText();
              const match = text.match(/^([0-9.]+)/);
              if (match) rating = parseFloat(match[1]);
            }

            if (name) {
              scrapedResults.push({
                name,
                address,
                phone,
                rating,
                mapsLink: mapsLink || page.url(),
                id: 'place_' + Date.now().toString() + Math.random().toString(36).substring(7)
              });
            }
          } catch (err) {
            console.error(`Error scraping listing index ${i}:`, err.message);
          }
        }
      }
    }

    console.log(`Google Maps Scraping found ${scrapedResults.length} vendors.`);

    let data = readData();
    let inserted = 0;

    for (const place of scrapedResults) {
      if (!place.name) continue;

      const pincodeMatch = place.address ? place.address.match(/\b\d{6}\b/) : null;
      const pincode = pincodeMatch ? pincodeMatch[0] : '';

      // Filter out Mumbai/Maharashtra results
      const isMumbaiOrMH = place.address && (
        place.address.toLowerCase().includes('mumbai') || 
        place.address.toLowerCase().includes('maharashtra') || 
        pincode.startsWith('4')
      );
      if (isMumbaiOrMH) {
        console.log(`[Warning] Google Maps returned a foreign listing in Mumbai/Maharashtra: ${place.name} (${place.address}). Skipping.`);
        continue;
      }

      const existingIndex = data.findIndex(existing => 
        (place.mapsLink && existing.mapsLink === place.mapsLink) || 
        existing.name === place.name
      );

      if (existingIndex === -1) {
        data.push({
          id: place.id,
          name: place.name,
          category: category,
          city: location,
          address: place.address || '',
          pincode: pincode,
          phone: place.phone || 'Requires Manual Lookup',
          rating: place.rating,
          mapsLink: place.mapsLink || '',
          source: 'Google Places',
          verified: false,
          pushed: false,
          scrapedAt: new Date().toISOString()
        });
        inserted++;
      } else {
        const existing = data[existingIndex];
        if (!existing.pincode && place.address) {
          const pincodeMatch = place.address.match(/\b\d{6}\b/);
          if (pincodeMatch) existing.pincode = pincodeMatch[0];
        }
        if (!existing.rating && place.rating) existing.rating = place.rating;
        if ((!existing.phone || existing.phone.includes('Obfuscated') || existing.phone.includes('Requires')) && place.phone) {
          existing.phone = place.phone;
        }
      }
    }

    writeData(data);
    console.log(`Google Maps Scraping complete. Inserted ${inserted} new vendors into staging.`);
  } catch (error) {
    console.error('Google Maps Scraper error:', error.message);
  } finally {
    await browser.close();
  }
}

async function scrapeJustDial(category, location) {
  console.log(`Starting JustDial scrape for ${category} in ${location}`);
  const data = readData();
  const searchUrl = `https://www.justdial.com/${location.split(',')[0].trim()}/${category.replace(/ /g, '-')}`;
  
  console.log(`Navigating to: ${searchUrl}`);
  // Setup playwright to scrape JustDial
  const browser = await firefox.launch({ 
    headless: true
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // 1. Redirect Check: Verify if JustDial redirected to an unrelated city (like Mumbai or Delhi)
    const finalUrl = page.url().toLowerCase();
    const mandalSegment = location.split(',')[0].trim().toLowerCase().replace(/ /g, '-');
    const districtSegment = location.includes(',') ? location.split(',')[1].trim().toLowerCase().replace(/ /g, '-') : '';
    
    const isMandalMatched = finalUrl.includes(mandalSegment);
    const isDistrictMatched = districtSegment && finalUrl.includes(districtSegment);

    if (!isMandalMatched && !isDistrictMatched) {
      console.log(`[Warning] JustDial redirected to an unrelated city page: ${page.url()} (expected ${location}). Skipping scrape to avoid dirtying database.`);
      return;
    }

    // 2. Rate Limit Check: Verify if Akamai returned a blank body
    let html = await page.content();
    if (html.includes('<body></body>') || html.length < 500) {
      console.log(`[Warning] JustDial blocked the scraper at ${searchUrl} (IP Rate Limited by Akamai).`);
      console.log("Waiting 15 seconds to let the rate limit cool down before retrying...");
      await page.waitForTimeout(15000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      html = await page.content();
      if (html.includes('<body></body>') || html.length < 500) {
        throw new Error("JustDial persistently blocked this request (IP Rate Limited). Try again later.");
      }
    }

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1000);
    }
    
    const results = await page.$$eval('.resultbox', nodes => {
      return nodes.map(node => {
        const nameEl = node.querySelector('.resultbox_title_anchor, .resultbox_title, h2');
        const name = nameEl ? nameEl.innerText.trim() : null;
        
        const addressEl = node.querySelector('.resultbox_address, address');
        const address = addressEl ? addressEl.innerText.trim() : null;
        
        const ratingEl = node.querySelector('.resultbox_totalrate');
        const rating = ratingEl ? ratingEl.innerText.trim() : null;
        
        const phoneEl = node.querySelector('.callNowAnchor, .callbutton');
        const phone = phoneEl ? phoneEl.innerText.trim() : 'Requires Manual Lookup';
        
        return { name, address, rating, phone };
      }).filter(v => v.name);
    });

    console.log(`Found ${results.length} raw results from JustDial`);
    let newCount = 0;
    
    for (const v of results) {
      if (!data.find(existing => existing.name === v.name && existing.city === location)) {
        const pincodeMatch = v.address ? v.address.match(/\b\d{6}\b/) : null;
        const pincode = pincodeMatch ? pincodeMatch[0] : '';

        data.push({
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          name: v.name,
          category: category,
          city: location,
          address: v.address || `Located in ${location}`,
          pincode: pincode,
          phone: v.phone || 'Requires Manual Lookup',
          rating: v.rating,
          mapsLink: '',
          source: 'JustDial',
          verified: false,
          pushed: false,
          scrapedAt: new Date().toISOString()
        });
        newCount++;
      }
    }
    writeData(data);
    console.log(`Scraping complete. Inserted ${newCount} new vendors into staging.`);
    
  } catch (error) {
    console.error('JustDial Scraper error:', error);
  } finally {
    await browser.close();
  }
}

async function genericPlaywrightScrape(engineName, searchUrl, category, location, evaluateFn) {
  console.log(`Starting ${engineName} scrape for ${category} in ${location}`);
  const data = readData();
  
  console.log(`Navigating to: ${searchUrl}`);
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-http2']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(6000);

    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1500);
    }
    
    const results = await page.evaluate(evaluateFn);

    console.log(`Found ${results.length} raw results from ${engineName}`);
    let newCount = 0;
    
    for (const v of results) {
      if (!data.find(existing => existing.name === v.name && existing.city === location)) {
        const pincodeMatch = v.address ? v.address.match(/\b\d{6}\b/) : null;
        const pincode = pincodeMatch ? pincodeMatch[0] : '';

        data.push({
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          name: v.name,
          category: category,
          city: location,
          address: v.address || `Located in ${location}`,
          pincode: pincode,
          phone: 'Requires Manual Lookup / Login',
          rating: v.rating || null,
          mapsLink: v.profileLink || '',
          source: engineName,
          verified: false,
          pushed: false,
          scrapedAt: new Date().toISOString()
        });
        newCount++;
      }
    }
    writeData(data);
    console.log(`${engineName} Scraping complete. Inserted ${newCount} new vendors.`);
  } catch (error) {
    console.error(`${engineName} Scraper error:`, error.message);
  } finally {
    await browser.close();
  }
}

async function scrapeWeddingBazaar(category, location) {
  const city = location.split(',')[0].trim().toLowerCase().replace(/ /g, '-');
  const catParam = category.toLowerCase().replace(/ /g, '-');
  const url = `https://www.weddingbazaar.com/${catParam}-in-${city}`;
  
  await genericPlaywrightScrape('Wedding Bazaar', url, category, location, () => {
    return Array.from(document.querySelectorAll('.vendor-card, .listing-card, article')).map(node => {
      const nameEl = node.querySelector('h2, h3, .vendor-name');
      const name = nameEl ? nameEl.innerText.trim() : null;
      const addrEl = node.querySelector('.vendor-location, .locality');
      const address = addrEl ? addrEl.innerText.trim() : '';
      const ratingEl = node.querySelector('.rating, .vendor-rating');
      const rating = ratingEl ? ratingEl.innerText.trim() : null;
      const linkEl = node.querySelector('a');
      const profileLink = linkEl ? linkEl.href : '';
      return { name, address, rating, profileLink };
    }).filter(v => v.name);
  });
}

async function scrapeWeddingWire(category, location) {
  const city = location.split(',')[0].trim().toLowerCase().replace(/ /g, '-');
  // WeddingWire primarily groups everything under wedding-venues or wedding-vendors
  const url = `https://www.weddingwire.in/wedding-vendors/${city}`;
  
  await genericPlaywrightScrape('WeddingWire', url, category, location, () => {
    return Array.from(document.querySelectorAll('.vendorTile, .storefront-list-item, .directory-item')).map(node => {
      const nameEl = node.querySelector('.vendorTile__title, .storefront-title, h2, h3');
      const name = nameEl ? nameEl.innerText.trim() : null;
      const addrEl = node.querySelector('.vendorTile__location, .storefront-location');
      const address = addrEl ? addrEl.innerText.trim() : '';
      const ratingEl = node.querySelector('.rating__count, .reviews-count');
      const rating = ratingEl ? ratingEl.innerText.trim() : null;
      const linkEl = node.querySelector('a');
      const profileLink = linkEl ? linkEl.href : '';
      return { name, address, rating, profileLink };
    }).filter(v => v.name);
  });
}

async function scrapeMandap(category, location) {
  const city = location.split(',')[0].trim().toLowerCase().replace(/ /g, '-');
  const url = `https://www.mandap.com/wedding-venues/${city}`;
  
  await genericPlaywrightScrape('Mandap.com', url, category, location, () => {
    return Array.from(document.querySelectorAll('.venue-card, .mandap-card, .listing-card')).map(node => {
      const nameEl = node.querySelector('.venue-name, h2, h3');
      const name = nameEl ? nameEl.innerText.trim() : null;
      const addrEl = node.querySelector('.venue-location, p');
      const address = addrEl ? addrEl.innerText.trim() : '';
      const ratingEl = node.querySelector('.rating');
      const rating = ratingEl ? ratingEl.innerText.trim() : null;
      const linkEl = node.querySelector('a');
      const profileLink = linkEl ? linkEl.href : '';
      return { name, address, rating, profileLink };
    }).filter(v => v.name);
  });
}

app.listen(PORT, () => {
  console.log(`Scraper backend running on http://localhost:${PORT}`);
});
