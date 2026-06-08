const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const activeCronJobs = {};
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const { firefox } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const Fuse = require('fuse.js');
const MiniSearch = require('minisearch');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') }); // Load backend .env for Cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: 'uploads/' });

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

const mongoose = require('mongoose');
const StagingLead = require('./models/StagingLead');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/gomandap_scraper')
  .then(() => console.log('Scraper connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Load regions
const REGIONS_FILE = path.join(__dirname, 'data', 'regions.json');
const getRegions = () => fs.existsSync(REGIONS_FILE) ? JSON.parse(fs.readFileSync(REGIONS_FILE, 'utf-8')) : {};

// Telecaller Data
const EMPLOYEES_FILE = path.join(__dirname, 'data', 'employees.json');
if (!fs.existsSync(EMPLOYEES_FILE)) {
  fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify([
    { id: 'emp_1', username: 'telecaller1', password: 'password123', name: 'Agent 1', location: 'Guntur', role: 'employee' }
  ]));
}
const getEmployees = () => JSON.parse(fs.readFileSync(EMPLOYEES_FILE, 'utf-8'));
const writeEmployees = (data) => fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(data, null, 2));

// Admin Credentials
const ADMIN_FILE = path.join(__dirname, 'data', 'admin.json');
if (!fs.existsSync(ADMIN_FILE)) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify({ username: 'admin', password: 'password123' }));
}
const getAdminCredentials = () => JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));

// Auth Login API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const admin = getAdminCredentials();
  
  if (username === admin.username && password === admin.password) {
    return res.json({ success: true, user: { role: 'admin', name: 'Administrator' } });
  }

  const employees = getEmployees();
  const employee = employees.find(e => e.username === username && e.password === password);
  if (employee) {
    return res.json({ success: true, user: { role: 'employee', name: employee.name, location: employee.location, id: employee.id, avatar: employee.avatar } });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Update Admin Credentials API
app.put('/api/auth/admin', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  fs.writeFileSync(ADMIN_FILE, JSON.stringify({ username, password }));
  res.json({ success: true, message: 'Admin credentials updated' });
});

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

// NLP & Spelling Correction Setup
const categoryFuse = new Fuse(CATEGORIES, { includeScore: true, threshold: 0.6 });

const getFlatLocations = () => {
  const regions = getRegions();
  let allLocs = [];
  for (const [district, mandals] of Object.entries(regions)) {
    allLocs.push({ type: 'district', name: district });
    if (mandals) {
      for (const m of mandals) {
        allLocs.push({ type: 'mandal', name: m, district: district });
      }
    }
  }
  return allLocs;
};

// Initialize MiniSearch for Locations
let locationSearch = new MiniSearch({
  fields: ['name', 'district'], 
  storeFields: ['name', 'type', 'district'],
  searchOptions: { fuzzy: 0.2, prefix: true }
});
// Add unique IDs to the locations so MiniSearch can index them
const indexLocations = () => {
  locationSearch.removeAll();
  const flat = getFlatLocations().map((loc, i) => ({ id: `loc_${i}`, ...loc }));
  locationSearch.addAll(flat);
};
indexLocations();

// API: Get Regions
app.get('/api/regions', (req, res) => {
  res.json(getRegions());
});

// API: Get Knowledge Base (Categories + Flat Locations)
app.get('/api/knowledge', (req, res) => {
  res.json({
    categories: CATEGORIES,
    locations: getFlatLocations()
  });
});

// Big Data Analytics: Lead Quality Scoring Algorithm
function calculateLeadScore(vendor) {
  let score = 0;
  
  // Base Data
  if (vendor.phone) score += 30;
  if (vendor.address) score += 10;
  
  // Rich Data
  if (vendor.website) score += 20;
  
  // Reputation
  if (vendor.rating && parseFloat(vendor.rating) > 4.2) score += 15;
  if (vendor.reviews && parseInt(vendor.reviews.replace(/,/g, '')) > 50) score += 5;
  
  // Deep Scraped Data
  if (vendor.email) score += 10;
  if (vendor.instagram) score += 5;
  if (vendor.facebook) score += 5;

  return Math.min(score, 100);
}

function determineTier(score) {
  if (score >= 80) return 'Premium';
  if (score >= 50) return 'Standard';
  return 'Basic';
}

// API: Get all scraped vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const data = await StagingLead.find().sort({ scrapedAt: -1 }).lean();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Update a vendor (verify/edit)
app.put('/api/vendors/:id', async (req, res) => {
  try {
    const updated = await StagingLead.findOneAndUpdate(
      { id: req.params.id }, 
      { ...req.body, verified: true }, 
      { new: true }
    );
    if (updated) res.json({ success: true, vendor: updated });
    else res.status(404).json({ error: 'Vendor not found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Delete a vendor
app.delete('/api/vendors/:id', async (req, res) => {
  try {
    await StagingLead.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Clear all unverified vendors from queue
app.post('/api/vendors/clear-unverified', async (req, res) => {
  try {
    await StagingLead.deleteMany({ verified: false, pushed: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Get all employees (Telecallers)
app.get('/api/employees', (req, res) => {
  const employees = getEmployees().filter(e => e.role === 'employee');
  res.json(employees);
});

// API: Create an Employee
app.post('/api/employees', (req, res) => {
  const employees = getEmployees();
  const newEmp = { ...req.body, id: 'emp_' + Date.now(), role: 'employee' };
  employees.push(newEmp);
  writeEmployees(employees);
  res.json({ success: true, employee: newEmp });
});

// API: Update an Employee
app.put('/api/employees/:id', (req, res) => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === req.params.id);
  if (index > -1) {
    employees[index] = { ...employees[index], ...req.body };
    writeEmployees(employees);
    res.json({ success: true, employee: employees[index] });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// API: Delete an Employee
app.delete('/api/employees/:id', (req, res) => {
  const employees = getEmployees();
  const newEmployees = employees.filter(e => e.id !== req.params.id);
  writeEmployees(newEmployees);
  res.json({ success: true });
});

// API: Upload to Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gomandap_avatars',
    });
    fs.unlinkSync(req.file.path); // Clean up local file
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// API: Batch assign leads
app.post('/api/vendors/assign', async (req, res) => {
  try {
    const { vendorIds, employeeId } = req.body;
    if (!vendorIds || !employeeId) return res.status(400).json({ error: 'Missing data' });
    
    await StagingLead.updateMany(
      { id: { $in: vendorIds } },
      { $set: { assignedTo: employeeId, verified: true } } // Implicitly verify when assigning
    );
    res.json({ success: true, count: vendorIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Telecaller update CRM status
app.put('/api/vendors/:id/crm', async (req, res) => {
  try {
    const { crmStatus, crmNotes } = req.body;
    const updated = await StagingLead.findOneAndUpdate(
      { id: req.params.id },
      { $set: { crmStatus, crmNotes } },
      { new: true }
    );
    res.json({ success: true, vendor: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Push verified vendors to CRM Lead Pipeline
app.post('/api/vendors/push', async (req, res) => {
  try {
    const verifiedVendors = await StagingLead.find({ verified: true, pushed: false }).lean();
    
    if (verifiedVendors.length === 0) {
      return res.status(400).json({ error: 'No verified unpushed vendors found.' });
    }

    const response = await axios.post('http://localhost:5000/api/leads/bulk', {
      leads: verifiedVendors
    });
    
    if (response.data.success) {
      await StagingLead.updateMany(
        { id: { $in: verifiedVendors.map(v => v.id) } },
        { $set: { pushed: true, pushedAt: new Date() } }
      );
      res.json({ success: true, pushed: verifiedVendors.length, message: response.data.message });
    } else {
      res.status(500).json({ error: 'Failed to push to CRM' });
    }
  } catch (error) {
    console.error('Error pushing to CRM:', error);
    res.status(500).json({ error: 'Failed to push to CRM' });
  }
});

// API: Manual Scrape (Legacy)
app.post('/api/scrape', (req, res) => {
  const { category, district, mandal, engine } = req.body;
  if (!category || !district) return res.status(400).json({ error: 'Category and district required' });

  const queryLocation = mandal ? `${mandal}, ${district}` : district;

  res.json({ success: true, message: `Started scraping ${category} in ${queryLocation} using ${engine}` });

  if (engine === 'justdial') scrapeJustDial(category, queryLocation).catch(console.error);
  else if (engine === 'weddingbazaar') scrapeWeddingBazaar(category, queryLocation).catch(console.error);
  else if (engine === 'weddingwire') scrapeWeddingWire(category, queryLocation).catch(console.error);
  else if (engine === 'mandap') scrapeMandap(category, queryLocation).catch(console.error);
  else if (engine === 'google') scrapeGooglePlaces(category, queryLocation).catch(console.error);
  else if (engine === 'ola') scrapeGooglePlaces(category, queryLocation).catch(console.error); // Fallback to Google if Ola not ready
  else console.log("Engine not implemented.");
});

// API: Omni-Search Scrape (Advanced NLP)
app.post('/api/scrape/omni', async (req, res) => {
  const { query, engine = 'google' } = req.body;
  if (!query) return res.status(400).json({ error: 'Search query required' });

  // Extract category and location using split points
  const splitKeywords = [' in ', ' at ', ' near ', ' around ', ' for '];
  let rawCategory = query;
  let rawLocation = '';
  
  for (const keyword of splitKeywords) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes(keyword)) {
      const idx = lowerQuery.indexOf(keyword);
      rawCategory = query.substring(0, idx).trim();
      rawLocation = query.substring(idx + keyword.length).trim();
      break;
    }
  }

  // --- Deep Misspelling Correction (NLP) ---
  const standardCategories = [
    "Mechanics", "Venues", "Photographers", "Caterers", "Decorators", "Makeup Artists", 
    "Bridal Wear", "Groom Wear", "Mehendi Artists", "Choreographers", "Pandits", 
    "Invitations", "Favors", "Planners", "Transport", "Jewellery"
  ];
  
  let matchedCategory = rawCategory;
  if (rawCategory) {
    const categoryFuse = new Fuse(standardCategories, { includeScore: true, threshold: 0.4 });
    const result = categoryFuse.search(rawCategory);
    if (result.length > 0) {
      console.log(`[NLP Engine] Auto-corrected Category: "${rawCategory}" -> "${result[0].item}" (Score: ${result[0].score})`);
      matchedCategory = result[0].item;
    }
  }

  let queryLocation = rawLocation;
  if (rawLocation) {
    // Flatten regions to build a dictionary of known towns
    const regions = getRegions();
    const allLocations = [];
    Object.keys(regions).forEach(dist => {
      allLocations.push(dist);
      regions[dist].forEach(m => allLocations.push(m));
    });
    
    const locationFuse = new Fuse(allLocations, { includeScore: true, threshold: 0.3 });
    const locResult = locationFuse.search(rawLocation);
    if (locResult.length > 0) {
      console.log(`[NLP Engine] Auto-corrected Location: "${rawLocation}" -> "${locResult[0].item}" (Score: ${locResult[0].score})`);
      queryLocation = locResult[0].item;
    }
  }

  const correctedQuery = `${matchedCategory} in ${queryLocation}`;

  // --- Opt-In Radius Expansion (Using internal regions) ---
  const numericRadius = parseInt(req.body.radius) || 0;
  
  if (numericRadius > 0) {
    console.log(`[Radius Expansion] Radius set to ${numericRadius}km. Expanding search around ${queryLocation}...`);
    const regions = getRegions();
    let parentDistrict = null;
    let nearbyTowns = [queryLocation]; // Always include the target

    // Find the district this location belongs to
    for (const dist in regions) {
      if (dist.toLowerCase() === queryLocation.toLowerCase() || regions[dist].some(m => m.toLowerCase() === queryLocation.toLowerCase())) {
        parentDistrict = dist;
        break;
      }
    }

    if (parentDistrict) {
      // Add a subset of towns from this district to simulate radius coverage
      // 10km ~ 2 towns, 50km ~ 10 towns, 100km ~ all towns
      const maxTownsToAdd = Math.ceil(numericRadius / 5);
      const allMandals = regions[parentDistrict];
      const additional = allMandals.filter(m => m.toLowerCase() !== queryLocation.toLowerCase()).slice(0, maxTownsToAdd);
      nearbyTowns = [...nearbyTowns, ...additional];
      console.log(`[Radius Expansion] Discovered ${nearbyTowns.length} nearby locations:`, nearbyTowns);
    }

    // Queue them up in the batch system
    for (const town of nearbyTowns) {
      batchQueue.push({ category: matchedCategory, mandal: town, district: parentDistrict || 'Unknown', engine });
    }
    batchProgress.total = batchQueue.length;
    batchProgress.isActive = true;

    if (!isBatchRunning) {
      runBatchQueue();
    }

    return res.json({ 
      success: true, 
      parsed: { category: matchedCategory, queryLocation, correctedQuery },
      message: `Radius expansion active. Queued ${nearbyTowns.length} locations.`
    });
  }

  // STANDARD SINGLE SCRAPE (Radius === 0)
  res.json({ 
    success: true, 
    parsed: { category: matchedCategory, queryLocation, correctedQuery },
    message: `Scraping exactly: ${query} using ${engine}`
  });

  // Schedule background task
  const jobKey = matchedCategory; 
  if (!activeCronJobs[jobKey]) {
    console.log(`[CRON] Registering recurring background scrape for: ${jobKey} in ${queryLocation}`);
    
    const intervalMs = 10 * 60 * 1000; // default 10 min
    const timer = setInterval(() => {
      console.log(`[CRON] Executing scheduled background scrape for: ${jobKey}`);
      if (engine === 'google' || engine === 'ola') {
        scrapeGooglePlaces(matchedCategory, queryLocation).catch(console.error);
      }
    }, intervalMs);

    activeCronJobs[jobKey] = {
      interval: intervalMs,
      timer,
      status: 'running',
      location: queryLocation
    };
  }

  // Execute directly right now
  if (engine === 'justdial') scrapeJustDial(matchedCategory, queryLocation).catch(console.error);
  else if (engine === 'weddingbazaar') scrapeWeddingBazaar(matchedCategory, queryLocation).catch(console.error);
  else if (engine === 'weddingwire') scrapeWeddingWire(matchedCategory, queryLocation).catch(console.error);
  else if (engine === 'mandap') scrapeMandap(matchedCategory, queryLocation).catch(console.error);
  else if (engine === 'google') scrapeGooglePlaces(matchedCategory, queryLocation).catch(console.error);
  else if (engine === 'ola') scrapeGooglePlaces(matchedCategory, queryLocation).catch(console.error); // Ola Fallback
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

// Global Browser Instance for Ultra-Fast Scraping
let globalBrowser = null;

async function getBrowser() {
  if (!globalBrowser || !globalBrowser.isConnected()) {
    globalBrowser = await chromium.launch({ headless: true, args: ['--disable-http2', '--no-sandbox'] });
  }
  return globalBrowser;
}

async function scrapeWebsiteForSocials(browser, url) {
  if (!url || !url.startsWith('http')) return { email: '', instagram: '', facebook: '' };
  
  try {
    // Ultra-Fast Open Source Deep Scraping using Axios & Cheerio (No headless browser needed)
    const response = await axios.get(url, { 
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // Find Emails (using Regex on raw HTML is extremely fast)
    const emailMatch = html.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g) || [];
    const validEmails = [...new Set(emailMatch)].filter(e => 
      !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.jpeg') && !e.endsWith('.webp') && !e.endsWith('.gif') && !e.includes('wixpress') && !e.includes('sentry')
    );

    // Advanced Social Parsing using Cheerio selectors
    let instagram = '';
    let facebook = '';

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      if (href.includes('instagram.com/') && !instagram) instagram = href;
      if (href.includes('facebook.com/') && !facebook && !href.includes('sharer')) facebook = href;
    });

    return {
      email: validEmails.length > 0 ? validEmails[0] : '',
      instagram,
      facebook
    };
  } catch (err) {
    console.log(`[Cheerio Deep Scrape] Failed or timed out for ${url}`);
    return { email: '', instagram: '', facebook: '' };
  }
}

async function scrapeGooglePlaces(category, location) {
  console.log(`Starting Google Maps browser scrape for ${category} in ${location}`);
  const query = `${category} in ${location}`;
  
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Abort image, font, media, and stylesheets to speed up scraping instantly
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['image', 'media', 'font', 'stylesheet', 'other'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    console.log(`Navigating to Google Maps search: ${searchUrl}`);
    // Wait for networkidle instead of domcontentloaded for faster extraction
    await page.goto(searchUrl, { waitUntil: 'load', timeout: 30000 });

    const consentBtn = page.locator('button:has-text("Accept all"), button:has-text("Reject all"), button:has-text("I agree"), button:has-text("Agree")');
    if (await consentBtn.count() > 0) {
      await consentBtn.first().click();
      await page.waitForTimeout(1000);
    }

    try {
      await Promise.race([
        page.waitForSelector('div[role="feed"]', { timeout: 10000 }),
        page.waitForSelector('[data-item-id="address"]', { timeout: 10000 })
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
        name, address, phone, rating,
        mapsLink: page.url(),
        id: 'place_' + Date.now().toString() + Math.random().toString(36).substring(7)
      });
    } else {
      // Case B: Search results list is loaded
      const scrollable = page.locator('div[role="feed"]');
      if (await scrollable.count() > 0) {
        console.log("Scrolling through search results feed... (Fast Mode)");
        
        // Aggressive Infinite Scroll - scroll 15 times to load ~100-150 vendors
        for(let i=0; i<15; i++) {
          await scrollable.evaluate(el => el.scrollTop = el.scrollHeight);
          await page.waitForTimeout(1000);
        }

        const cards = page.locator('a.hfpxzc');
        const count = await cards.count();
        console.log(`Found ${count} total business cards. Extracting URLs...`);

        // Phase 1: Rapid Extraction of HREFs
        const vendorLinks = [];
        for (let i = 0; i < Math.min(count, 120); i++) {
          const card = cards.nth(i);
          const name = await card.getAttribute('aria-label');
          const mapsLink = await card.getAttribute('href');
          if (name && mapsLink) {
            vendorLinks.push({ name, mapsLink });
          }
        }

        console.log(`Extracted ${vendorLinks.length} raw links. Beginning concurrent Deep Extraction (Hardware Accelerated)...`);

        // Phase 2: Concurrent Multi-Tab Execution (Batch size of 5)
        const CONCURRENCY_LIMIT = 5;
        for (let i = 0; i < vendorLinks.length; i += CONCURRENCY_LIMIT) {
          const batch = vendorLinks.slice(i, i + CONCURRENCY_LIMIT);
          console.log(`Processing concurrent batch ${i/CONCURRENCY_LIMIT + 1} of ${Math.ceil(vendorLinks.length/CONCURRENCY_LIMIT)}...`);
          
          const batchPromises = batch.map(async (vendor) => {
            let newPage;
            try {
              newPage = await context.newPage();
              // Disable heavy resources on the new tab as well
              await newPage.route('**/*', (route) => {
                const rt = route.request().resourceType();
                if (['image', 'media', 'font', 'stylesheet'].includes(rt)) {
                  route.abort();
                } else {
                  route.continue();
                }
              });

              // Navigate directly to the Maps detail view using domcontentloaded
              await newPage.goto(vendor.mapsLink, { waitUntil: 'domcontentloaded', timeout: 15000 });

              let address = '';
              const addressEl = newPage.locator('[data-item-id="address"]');
              if (await addressEl.count() > 0) {
                const rawAddress = await addressEl.getAttribute('aria-label');
                address = rawAddress ? rawAddress.replace(/^Address:\s*/i, '') : '';
              }

              let phone = '';
              const phoneEl = newPage.locator('[data-item-id^="phone:tel:"]');
              if (await phoneEl.count() > 0) {
                const rawPhone = await phoneEl.getAttribute('aria-label');
                phone = rawPhone ? rawPhone.replace(/^Phone:\s*/i, '') : '';
              }

              let rating = null;
              const ratingEl = newPage.locator('div.F7nice').first();
              if (await ratingEl.count() > 0) {
                const text = await ratingEl.innerText();
                const match = text.match(/^([0-9.]+)/);
                if (match) rating = parseFloat(match[1]);
              }

              // Advanced Extraction: Website & Operating Hours
              let websiteUrl = '';
              const websiteEl = newPage.locator('a[data-item-id="authority"]');
              if (await websiteEl.count() > 0) {
                websiteUrl = await websiteEl.getAttribute('href');
              }

              let operatingHours = '';
              const hoursEl = newPage.locator('[aria-label*="hours"]').first();
              if (await hoursEl.count() > 0) {
                operatingHours = await hoursEl.getAttribute('aria-label') || await hoursEl.innerText();
              }

              // Advanced Extraction: Top Reviews Sentiment
              const topReviews = [];
              const reviewEls = newPage.locator('.OA1nbd');
              const reviewCount = await reviewEls.count();
              for (let j = 0; j < Math.min(reviewCount, 3); j++) {
                topReviews.push(await reviewEls.nth(j).innerText());
              }

              // Parallel Website Deep Enrichment
              let enrichedData = { email: '', instagram: '', facebook: '' };
              if (websiteUrl) {
                enrichedData = await scrapeWebsiteForSocials(browser, websiteUrl);
              }

              return {
                name: vendor.name,
                address,
                phone,
                rating,
                mapsLink: vendor.mapsLink,
                website: websiteUrl,
                operatingHours: operatingHours.substring(0, 150),
                topReviews,
                email: enrichedData.email,
                instagram: enrichedData.instagram,
                facebook: enrichedData.facebook,
                id: 'place_' + Date.now().toString() + Math.random().toString(36).substring(7)
              };

            } catch (err) {
              console.error(`Error in concurrent extraction for ${vendor.name}:`, err.message);
              return null;
            } finally {
              if (newPage) await newPage.close();
            }
          });

          // Wait for the entire batch to finish concurrently
          const batchResults = await Promise.all(batchPromises);
          
          // Filter out failed extractions and add to results
          batchResults.filter(res => res !== null).forEach(res => scrapedResults.push(res));
        }
      }
    }

    console.log(`Google Maps Scraping found ${scrapedResults.length} vendors.`);

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

      let parsedRating = null;
      if (place.rating && place.rating !== '-') {
        parsedRating = parseFloat(place.rating);
        if (isNaN(parsedRating)) parsedRating = null;
      }

      const existing = await StagingLead.findOne({
        $or: [
          { mapsLink: place.mapsLink },
          { name: place.name }
        ]
      });

      if (!existing) {
        const leadScore = calculateLeadScore(place);
        const newLead = new StagingLead({
          id: place.id,
          name: place.name,
          category: category,
          city: location || 'Global',
          address: place.address || '',
          pincode: pincode,
          phone: place.phone || 'Requires Manual Lookup',
          rating: parsedRating,
          mapsLink: place.mapsLink || '',
          source: 'Google Places',
          email: place.email || '',
          instagram: place.instagram || '',
          facebook: place.facebook || '',
          website: place.website || '',
          qualityScore: leadScore,
          tier: determineTier(leadScore),
          operatingHours: place.operatingHours || '',
          topReviews: place.topReviews || []
        });
        await newLead.save();
        inserted++;
      } else {
        if (!existing.pincode && place.address) {
          const pMatch = place.address.match(/\b\d{6}\b/);
          if (pMatch) existing.pincode = pMatch[0];
        }
        if (!existing.rating && parsedRating) existing.rating = parsedRating;
        if ((!existing.phone || existing.phone.includes('Obfuscated') || existing.phone.includes('Requires')) && place.phone) {
          existing.phone = place.phone;
        }
        await existing.save();
      }
    }

    console.log(`Google Maps Scraping complete. Inserted ${inserted} new vendors into staging.`);
  } catch (error) {
    console.error('Google Maps Scraper error:', error.message);
  } finally {
    await context.close();
  }
}

async function scrapeJustDial(category, location) {
  console.log(`Starting JustDial scrape for ${category} in ${location}`);
  const searchUrl = `https://www.justdial.com/${location.split(',')[0].trim()}/${category.replace(/ /g, '-')}`;
  
  console.log(`Navigating to: ${searchUrl}`);
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const finalUrl = page.url().toLowerCase();
    const mandalSegment = location.split(',')[0].trim().toLowerCase().replace(/ /g, '-');
    const districtSegment = location.includes(',') ? location.split(',')[1].trim().toLowerCase().replace(/ /g, '-') : '';
    
    const isMandalMatched = finalUrl.includes(mandalSegment);
    const isDistrictMatched = districtSegment && finalUrl.includes(districtSegment);

    if (!isMandalMatched && !isDistrictMatched) {
      console.log(`[Warning] JustDial redirected to an unrelated city page. Skipping.`);
      return;
    }

    let html = await page.content();
    if (html.includes('<body></body>') || html.length < 500) {
      throw new Error("JustDial persistently blocked this request (IP Rate Limited). Try again later.");
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
      const existing = await StagingLead.findOne({ name: v.name, city: location });
      if (!existing) {
        let parsedRating = null;
        if (v.rating && v.rating !== '-') {
          parsedRating = parseFloat(v.rating);
          if (isNaN(parsedRating)) parsedRating = null;
        }
        const pincodeMatch = v.address ? v.address.match(/\b\d{6}\b/) : null;
        await StagingLead.create({
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          name: v.name,
          category: category,
          city: location,
          address: v.address || `Located in ${location}`,
          pincode: pincodeMatch ? pincodeMatch[0] : '',
          phone: v.phone || 'Requires Manual Lookup',
          rating: parsedRating,
          source: 'JustDial'
        });
        newCount++;
      }
    }
    console.log(`Scraping complete. Inserted ${newCount} new vendors into staging.`);
  } catch (error) {
    console.error('JustDial Scraper error:', error);
  } finally {
    await browser.close();
  }
}

async function genericPlaywrightScrape(engineName, searchUrl, category, location, evaluateFn) {
  console.log(`Starting ${engineName} scrape for ${category} in ${location}`);
  const browser = await chromium.launch({ headless: true, args: ['--disable-http2'] });
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
      const existing = await StagingLead.findOne({ name: v.name, city: location });
      if (!existing) {
        let parsedRating = null;
        if (v.rating && v.rating !== '-') {
          parsedRating = parseFloat(v.rating);
          if (isNaN(parsedRating)) parsedRating = null;
        }
        const pincodeMatch = v.address ? v.address.match(/\b\d{6}\b/) : null;
        await StagingLead.create({
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          name: v.name,
          category: category,
          city: location,
          address: v.address || `Located in ${location}`,
          pincode: pincodeMatch ? pincodeMatch[0] : '',
          phone: 'Requires Manual Lookup / Login',
          rating: parsedRating,
          mapsLink: v.profileLink || '',
          source: engineName
        });
        newCount++;
      }
    }
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

// API: Get Active Cron Jobs
app.get('/api/scrape/jobs', (req, res) => {
  const jobs = Object.keys(activeCronJobs).map(cat => ({
    category: cat,
    interval: activeCronJobs[cat].interval,
    status: activeCronJobs[cat].status,
    location: activeCronJobs[cat].location
  }));
  res.json(jobs);
});

// API: Update Cron Job
app.post('/api/scrape/jobs/update', (req, res) => {
  const { category, action, intervalMs } = req.body;
  const job = activeCronJobs[category];
  
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (action === 'stop') {
    clearInterval(job.timer);
    job.status = 'stopped';
  } else if (action === 'start') {
    if (job.status === 'stopped') {
      const ms = intervalMs || job.interval;
      job.interval = ms;
      job.status = 'running';
      job.timer = setInterval(() => {
        scrapeGooglePlaces(category, job.location).catch(console.error);
      }, ms);
    }
  } else if (action === 'update_interval') {
    clearInterval(job.timer);
    job.interval = intervalMs;
    job.status = 'running';
    job.timer = setInterval(() => {
        scrapeGooglePlaces(category, job.location).catch(console.error);
    }, intervalMs);
  }

  res.json({ success: true, message: `Job for ${category} updated.` });
});

// API: Bulk CSV Upload Ingestion
app.post('/api/scrape/upload', (req, res) => {
  const { tasks } = req.body; // Array of { category, location }
  if (!tasks || !Array.isArray(tasks)) return res.status(400).json({ error: 'Invalid tasks array' });

  for (const task of tasks) {
    // Treat location as mandal for batch queue
    batchQueue.push({ category: task.category, mandal: task.location, district: 'Bulk Upload', engine: 'google' });
  }

  batchProgress = {
    total: batchQueue.length,
    completed: 0,
    currentTask: 'Processing Bulk Upload...',
    isActive: true
  };

  if (!isBatchRunning) {
    runBatchQueue();
  }

  res.json({ success: true, message: `Successfully queued ${tasks.length} bulk tasks.` });
});

// API: Stop All Cron Jobs & Batches (Master Stop)
app.post('/api/scrape/jobs/stop-all', (req, res) => {
  // Stop all active cron jobs
  for (const key of Object.keys(activeCronJobs)) {
    clearInterval(activeCronJobs[key].timer);
    activeCronJobs[key].status = 'stopped';
  }

  // Stop batch queue
  batchQueue = [];
  batchProgress.currentTask = 'Stopped manually by Master Stop';
  batchProgress.isActive = false;
  isBatchRunning = false;

  res.json({ success: true, message: 'Master Stop initiated. All background tasks and queues have been terminated.' });
});

app.listen(PORT, () => {
  console.log(`Scraper backend running on http://localhost:${PORT}`);
});
