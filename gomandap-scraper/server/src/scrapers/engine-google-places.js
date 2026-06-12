const cheerio = require('cheerio');
const axios = require('axios');
const path = require('path');
const dbAdapter = require('../config/dbAdapter');
const geoAI = require('../utils/geoAI');
const { getBrowser, chromium } = require('./browserFactory');
const { verifyWithAI } = require('../utils/aiParser');

// Lead Quality Scoring Algorithm
function calculateLeadScore(vendor) {
  let score = 0;
  if (vendor.phone) score += 30;
  if (vendor.address) score += 10;
  if (vendor.website) score += 20;
  if (vendor.rating && parseFloat(vendor.rating) > 4.2) score += 15;
  if (vendor.reviews && parseInt(vendor.reviews.replace(/,/g, '')) > 50) score += 5;
  if (vendor.email) score += 10;
  return Math.min(score, 100);
}

function determineTier(score) {
  if (score >= 80) return 'Premium';
  if (score >= 50) return 'Standard';
  return 'Basic';
}

// Global state variables passed from index.js
let globalAbortSignal = { aborted: false };
let addLog = console.log;
let emitVendorEvent = () => {};

function setDeps({ logger, abortSignal, emitVendorEvent: evt }) {
    if (logger) addLog = logger;
    if (abortSignal) globalAbortSignal = abortSignal;
    if (evt) emitVendorEvent = evt;
}

async function scrapeWebsiteForSocials(browser, url, vendorName) {
  if (!url || !url.startsWith('http')) return { email: '', instagram: '', facebook: '', phone: '', instagramFollowers: '', facebookFollowers: '' };
  
  try {
    addLog(`[Deep Scrape] Investigating website for ${vendorName || 'vendor'}...`);
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
    
    const emailMatch = html.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g) || [];
    let validEmails = [...new Set(emailMatch)].filter(e => 
      !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.jpeg') && !e.endsWith('.webp') && !e.endsWith('.gif') && !e.includes('wixpress') && !e.includes('sentry')
    );

    // We no longer scan the entire raw HTML for 10-digit strings because it hallucinates UNIX timestamps (e.g. 1608662146)
    let validPhones = [];
    
    // Strict text-node scanning for contextual phone numbers (e.g. "Phone: 9876543210" or "Call +91-9876543210")
    const phoneContextRegex = /(?:phone|tel|call|whatsapp|mob|mobile)[\s:.-]*((?:\+\d{1,4}[\s-]?)?(?:\(\d{1,4}\)[\s-]?)?(?:\d{1,4}[\s-]?){2,4}\d{2,4})/gi;
    let match;
    while ((match = phoneContextRegex.exec(html)) !== null) {
      const digits = match[1].replace(/\D/g, '');
      if (digits.length >= 8 && digits.length <= 15) {
        validPhones.push(match[1].trim());
      }
    }

    let instagram = '';
    let facebook = '';

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      
      const lowerHref = href.toLowerCase();
      if (lowerHref.startsWith('mailto:')) {
        const mail = lowerHref.replace('mailto:', '').split('?')[0];
        if (mail && mail.includes('@')) validEmails.push(mail);
      }
      if (lowerHref.startsWith('tel:')) {
        const tel = lowerHref.replace('tel:', '').replace(/[^\d+]/g, '');
        if (tel.length >= 10) validPhones.push(tel);
      }
      
      if (lowerHref.includes('instagram.com/') && !instagram) instagram = href;
      if (lowerHref.includes('facebook.com/') && !facebook && !lowerHref.includes('sharer')) facebook = href;
    });
    
    validEmails = [...new Set(validEmails)];
    validPhones = [...new Set(validPhones)];

    // Deep JSON / Script extraction for modern React/NextJS sites
    if (!instagram) {
      const rawIgMatch = html.match(/https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+/gi) || [];
      const validIg = rawIgMatch.find(l => !l.includes('/p/') && !l.includes('/reel/') && !l.includes('explore'));
      if (validIg) instagram = validIg.replace(/["'\\]/g, '');
    }

    const images = [];
    try {
      const ogImg = $('meta[property="og:image"]').attr('content');
      if (ogImg) images.push(ogImg);
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && images.length < 5) {
          images.push(src);
        }
      });
    } catch (e) {}

    return {
      email: validEmails.length > 0 ? validEmails[0] : '',
      phone: validPhones.length > 0 ? validPhones[0] : '',
      instagram: '',
      facebook: '',
      instagramFollowers: '',
      facebookFollowers: '',
      images
    };
  } catch (err) {
    console.log(`[Cheerio Deep Scrape] Failed or timed out for ${url}`);
    return { email: '', instagram: '', facebook: '', phone: '', instagramFollowers: '', facebookFollowers: '', images: [] };
  }
}

function isListingRelevantToQuery(name, pageText, category, exactQuery) {
  // Relaxed rule: If it's a search, we generally trust Google Maps placement unless it's obviously wildly wrong
  return true; 
}

function isListingRelevantToQueryGeneral(name, pageText, category, exactQuery) {
  // User requested to register EVERYTHING that flows through. We completely remove filtering.
  return true;
}

function extractCoords(url) {
  if (!url) return null;
  const match = url.match(/!8m2!3d([0-9.-]+)!4d([0-9.-]+)/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  const atMatch = url.match(/@([0-9.-]+),([0-9.-]+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  return null;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function scrapeGooglePlaces(exactQuery, category, location, sessionId = "legacy", centerLat = null, centerLng = null, radiusKm = null, strategy = 'broad') {
  addLog(`Starting Google Maps browser scrape for exact match: "${exactQuery}"`);

  // If Playwright not available (production/Render), skip browser scraping
  if (!chromium) {
    console.warn('[scrapeGooglePlaces] Playwright Chromium not available. Skipping browser scrape.');
    return [];
  }
  
  const browser = await getBrowser();
  if (!browser) {
    console.warn('[scrapeGooglePlaces] Browser not available. Skipping.');
    return [];
  }

  let context = null;
  let page = null;

  try {
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });
    page = await context.newPage();

    // Abort image, font, and media for maximum speed, but allow stylesheets/other so Google Maps JS renders the feed correctly.
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'media', 'font'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    const searchUrl = exactQuery.startsWith('http')
      ? exactQuery
      : `https://www.google.com/maps/search/${encodeURIComponent(exactQuery)}`;
    addLog(`[System] Navigating to Google Maps search: ${searchUrl}`);
    // Wait for networkidle instead of domcontentloaded for faster extraction
    await page.goto(searchUrl, { waitUntil: 'load', timeout: 30000 }).catch(e => addLog(`[Google Maps] Note: Search load timed out but continuing...`));

    const consentBtn = page.locator('button:has-text("Accept all"), button:has-text("Reject all"), button:has-text("I agree"), button:has-text("Agree")');
    try {
      if (await consentBtn.count() > 0) {
        await consentBtn.first().click({ timeout: 5000 }).catch(()=>{});
        await page.waitForTimeout(1000);
      }
    } catch(e) {}

    try {
      await Promise.race([
        page.waitForSelector('div[role="feed"]', { timeout: 10000 }),
        page.waitForSelector('[data-item-id="address"]', { timeout: 10000 })
      ]);
    } catch (e) {
      addLog("Could not find feed or place details within timeout");
    }

    let scrapedResults = [];

    // Case A: Redirected directly to a single business details page
    if (await page.locator('[data-item-id="address"]').count() > 0 && await page.locator('div[role="feed"]').count() === 0) {
      addLog("Redirected directly to a single business page.");
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

      let allImages = [];
      try {
        const imgLocators = await page.locator('button[aria-label^="Photo of"] img, img[src*="googleusercontent.com/p/"]').all().catch(()=>[]);
        for (let j = 0; j < Math.min(imgLocators.length, 10); j++) {
          const src = await imgLocators[j].getAttribute('src', { timeout: 500 }).catch(()=>null);
          if (src) allImages.push(src);
        }
      } catch (e) {}
      
      const avatar = allImages.length > 0 ? allImages[0] : '';

      let website = '';
      try {
        const websiteEl = page.locator('a[data-item-id="authority"]');
        if (await websiteEl.count() > 0) {
          website = await websiteEl.getAttribute('href', { timeout: 3000 }) || '';
        }
      } catch (e) {}

      let enrichedData = { email: '', instagram: '', facebook: '', instagramFollowers: '', facebookFollowers: '', images: [] };
      if (website) {
        enrichedData = await scrapeWebsiteForSocials(browser, website, name);
      }

      const combinedText = `${name} ${address}`;
      
      const coords = extractCoords(page.url());
      if (centerLat !== null && centerLng !== null && radiusKm !== null && coords && strategy === 'strict') {
        const distance = getDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
        if (distance > radiusKm) {
          addLog(`[Boundary Filter] Saving '${name}' to Out of Bounds Folder (${distance.toFixed(1)}km > ${radiusKm}km limit)`);
          
          const leadScore = calculateLeadScore({ name, address, phone: null, rating: null });
          const oobLead = {
            id: 'place_' + Date.now().toString() + Math.random().toString(36).substring(7),
            name, category, city: location || 'Global', address: address || '', 
            phone: '', rating: '', mapsLink: page.url(), 
            latitude: coords.lat, longitude: coords.lng, source: 'Google Maps (Out of Bounds)',
            outOfBoundsDistance: distance.toFixed(1)
          };
          dbAdapter.saveOutOfBoundsVendor(oobLead);
          try { emitVendorEvent(oobLead, 'out-of-bounds'); } catch (e) {}
          return;
        }
      }

      const mapsLink = page.url();
        const id = 'place_' + Date.now().toString() + Math.random().toString(36).substring(7);

        const pincodeMatch = address ? address.match(/\b\d{6}\b/) : null;
        const pincode = pincodeMatch ? pincodeMatch[0] : '';
        
        // Read local database
        const vendors = dbAdapter.getVendors();
        const existingIndex = vendors.findIndex(v => v.mapsLink === mapsLink || v.name === name);

        if (existingIndex === -1) {
          const leadScore = calculateLeadScore({ name, address, phone, rating });
          const newLead = {
            id,
            name,
            category,
            city: location || 'Global',
            address: address || '',
            pincode: pincode,
            phone: phone || 'Requires Manual Lookup',
            rating,
            mapsLink,
            latitude: coords ? coords.lat : null,
            longitude: coords ? coords.lng : null,
            source: 'Google Maps Engine',
            verified: false,
            aiVerified: false,
            matchedKeywords: [],
            email: enrichedData.email || '',
            instagram: enrichedData.instagram || '',
            instagramFollowers: enrichedData.instagramFollowers || '',
            facebook: enrichedData.facebook || '',
            facebookFollowers: enrichedData.facebookFollowers || '',
            website: website,
            images: [...allImages, ...(enrichedData.images || [])].filter(Boolean),
            avatar: avatar,
            qualityScore: leadScore,
            tier: determineTier(leadScore),
            operatingHours: '',
            topReviews: [],
            scrapedAt: new Date().toISOString()
          };

          vendors.push(newLead);
          dbAdapter.saveVendors(vendors);
          try { emitVendorEvent(newLead, 'inserted'); } catch (e) {}
          scrapedResults.push(newLead);
          // Silently saving to DB, no log flooding
        }
    } else {
      // Case B: Search results list is loaded
      const scrollable = page.locator('div[role="feed"]');
      if (await scrollable.count() > 0) {
        addLog("Scrolling through search results feed... (Fast Mode)");
        
        // Dynamic Fast Scroll - absolute minimum delays
        for(let i=0; i<30; i++) {
          if (globalAbortSignal.aborted) throw new Error('Master Stop Aborted');
          await scrollable.evaluate(node => node.scrollBy(0, 10000));
          await page.waitForTimeout(150); // Ultra-fast hardware scroll speed
          await page.waitForTimeout(150); // Ultra-fast hardware scroll speed
          const currentCount = await page.locator('a.hfpxzc').count();
          if (currentCount >= 120) {
            addLog(`Reached ${currentCount} cards quickly, stopping scroll.`);
            break;
          }
        }

        const cards = page.locator('a.hfpxzc');
        const count = await cards.count();
        addLog(`Found ${count} total business cards. Extracting URLs...`);

        // Phase 1: Rapid Extraction of HREFs
        const vendorLinks = [];
        for (let i = 0; i < count; i++) {
          const card = cards.nth(i);
          const name = await card.getAttribute('aria-label');
          const mapsLink = await card.getAttribute('href');
          if (name && mapsLink) {
            vendorLinks.push({ name, mapsLink });
          }
        }

        addLog(`Extracted ${vendorLinks.length} raw links. Beginning Single-Tab Fast Extraction (God Mode)...`);

        // Phase 2: Single-Tab Fast Extraction
        // Instead of opening 60 new tabs, we click each card directly on the main page.
        // This takes ~0.5 seconds per vendor instead of 3-5 seconds!
        const allCards = await page.locator('a.hfpxzc').all();
        
        let insertedInBatch = 0;

        for (let i = 0; i < allCards.length; i++) {
          if (globalAbortSignal.aborted) throw new Error('Master Stop Aborted');
          
          const card = allCards[i];
          const name = await card.getAttribute('aria-label').catch(()=>null);
          const mapsLink = await card.getAttribute('href').catch(()=>null);
          if (!name || !mapsLink) continue;

          addLog(`[Fast Extract] Processing ${i+1}/${allCards.length}: ${name}`);

          let address = '';
          let phone = '';
          let rating = null;
          let websiteUrl = '';
          let operatingHours = '';
          let topReviews = [];
          let coverImage = '';
          let aiVerified = false;
          let matchedKeywords = [];

          try {
            await card.click();
            
            // Wait for side panel details to appear. The title usually appears as an h1
            await page.waitForSelector(`h1`, { timeout: 1500 }).catch(()=>{});
            
            // Ultra-fast phone detection without arbitrary waits
            await page.waitForSelector('button[data-item-id^="phone:tel:"], button[data-tooltip="Copy phone number"]', { timeout: 1000 }).catch(()=>{});

            const addressEl = page.locator('[data-item-id="address"]').first();
            try {
              if (await addressEl.count() > 0) {
                const rawAddress = await addressEl.getAttribute('aria-label', { timeout: 1000 });
                address = rawAddress ? rawAddress.replace(/^Address:\s*/i, '') : '';
              }
            } catch (err) {}

            // Fix: Check for all possible phone selectors and extract the exact tel: link if available
            const phoneEls = await page.locator('button[data-item-id^="phone:tel:"], button[data-tooltip*="phone"], button[aria-label^="Phone:"], button[aria-label^="phone:"]').all();
            
            try {
              if (phoneEls.length > 0) {
                // Try to find one with data-item-id="phone:tel:..."
                for (const el of phoneEls) {
                  const dataId = await el.getAttribute('data-item-id', { timeout: 1000 }).catch(() => null);
                  if (dataId && dataId.startsWith('phone:tel:')) {
                    phone = dataId.replace('phone:tel:', '').trim();
                    break;
                  }
                }
                
                // Fallback to aria-label
                if (!phone) {
                  const rawPhone = await phoneEls[0].getAttribute('aria-label', { timeout: 1000 }).catch(() => null);
                  phone = rawPhone ? rawPhone.replace(/^Phone:\s*/i, '').trim() : '';
                }

                // Fallback to innerText
                if (!phone) {
                  const rawText = await phoneEls[0].innerText({ timeout: 1000 }).catch(() => null);
                  if (rawText && rawText.match(/\d{4}/)) {
                    phone = rawText.trim();
                  }
                }

                if (phone) addLog(`[Extracted] Phone for ${name}: ${phone}`);
              }
            } catch (err) {
               addLog(`[Warning] Phone extraction error for ${name}: ${err.message}`);
            }

            const ratingEl = page.locator('div.F7nice').first();
            try {
              if (await ratingEl.count() > 0) {
                const text = await ratingEl.innerText({ timeout: 1000 });
                const match = text.match(/^([0-9.]+)/);
                if (match) rating = parseFloat(match[1]);
              }
            } catch (err) {}

            const websiteEl = page.locator('a[data-item-id="authority"]');
            try {
              if (await websiteEl.count() > 0) {
                websiteUrl = await websiteEl.getAttribute('href', { timeout: 1000 });
              }
            } catch (err) {}

            const hoursEl = page.locator('[aria-label*="hours"]').first();
            try {
              if (await hoursEl.count() > 0) {
                operatingHours = await hoursEl.getAttribute('aria-label', { timeout: 1000 }) || await hoursEl.innerText({ timeout: 1000 });
              }
            } catch (err) {}

            let allImages = [];
            try {
              const imgLocators = await page.locator('button[aria-label^="Photo of"] img, img[src*="googleusercontent.com/p/"]').all().catch(()=>[]);
              for (let j = 0; j < Math.min(imgLocators.length, 10); j++) {
                const src = await imgLocators[j].getAttribute('src', { timeout: 500 }).catch(()=>null);
                if (src) allImages.push(src);
              }
            } catch (e) {}
            
            const avatar = allImages.length > 0 ? allImages[0] : '';

            // Fire-and-Forget Background Enrichment (No Blocking!)
            let enrichedData = { email: '', instagram: '', facebook: '', phone: '', instagramFollowers: '', facebookFollowers: '', images: [] };
            if (websiteUrl) {
               // We run this in the background so the map extraction never pauses
               scrapeWebsiteForSocials(browser, websiteUrl, name).then(data => {
                  const currentVendors = dbAdapter.getVendors();
                  const vIdx = currentVendors.findIndex(v => v.name === name);
                  if (vIdx !== -1) {
                     let existing = currentVendors[vIdx];
                     let updated = false;
                     if (data.email) { existing.email = data.email; updated = true; }
                     if (data.phone && (!existing.phone || existing.phone.includes('Requires'))) { existing.phone = data.phone; updated = true; }
                     if (updated) {
                       dbAdapter.saveVendors(currentVendors);
                       try { emitVendorEvent(existing, 'updated'); } catch(e){}
                     }
                  }
               }).catch(()=>{});
            }

            const coords = extractCoords(mapsLink);
            const finalPhone = (phone && !phone.includes('Requires')) ? phone : phone;

            const place = {
              name,
              address,
              phone: finalPhone,
              rating,
              mapsLink,
              latitude: coords ? coords.lat : null,
              longitude: coords ? coords.lng : null,
              website: websiteUrl,
              operatingHours: (operatingHours||'').substring(0, 150),
              topReviews,
              email: '',
              instagram: '',
              facebook: '',
              instagramFollowers: '',
              facebookFollowers: '',
              images: [...allImages, ...(enrichedData.images || [])].filter(Boolean),
              avatar: avatar,
              aiVerified,
              matchedKeywords,
              id: 'place_' + Date.now().toString() + Math.random().toString(36).substring(7)
            };

            // STREAMING INSERTION TO DB
            const combinedText = `${place.name} ${place.address} ${place.operatingHours}`;

            // Apply boundary filter ONLY if strategy is strict
            if (centerLat !== null && centerLng !== null && radiusKm !== null && place.latitude && place.longitude && strategy === 'strict') {
              const distance = getDistanceKm(centerLat, centerLng, place.latitude, place.longitude);
              if (distance > radiusKm) {
                addLog(`[Boundary Filter] Saving '${place.name}' to Out of Bounds Folder (${distance.toFixed(1)}km > ${radiusKm}km limit)`);
                place.outOfBoundsDistance = distance.toFixed(1);
                place.source = 'Google Maps (Out of Bounds)';
                dbAdapter.saveOutOfBoundsVendor(place);
                continue;
              }
            }

            // Strict Address Text Filter (Bypass if Broad Strategy)
            if (strategy === 'strict') {
              const cleanCityName = location ? location.split(' (@')[0].trim().toLowerCase() : '';
              if (place.address && cleanCityName) {
                const addrLower = place.address.toLowerCase();
                if (!addrLower.includes(cleanCityName)) {
                  addLog(`[Strict Filter] Discarding '${place.name}' - Address does not contain '${cleanCityName}'`);
                  continue;
                }
              }
            }

            const pincodeMatch = place.address ? place.address.match(/\b\d{6}\b/) : null;
            const pincode = pincodeMatch ? pincodeMatch[0] : '';

            let parsedRating = null;
            if (place.rating && place.rating !== '-') {
              parsedRating = parseFloat(place.rating);
              if (isNaN(parsedRating)) parsedRating = null;
            }

            // Read local database
            const vendors = dbAdapter.getVendors();
            const existingIndex = vendors.findIndex(v => v.mapsLink === place.mapsLink || v.name === place.name);

            if (existingIndex === -1) {
              const leadScore = calculateLeadScore(place);
              place.pincode = pincode;
              place.qualityScore = leadScore;
              place.tier = determineTier(leadScore);
              place.category = category;
              place.city = location || 'Global';
              place.source = 'Google Maps Engine';
              place.verified = false;
              place.scrapedAt = new Date().toISOString();
              place.sessionId = sessionId;
              place.strategy = strategy; // Store strategy so UI knows how to group folders
              
              // Apply GeoAI reverse geocoding for deep location folders
              if (place.latitude && place.longitude) {
                try {
                  const locationInfo = await geoAI.reverseGeocode(place.latitude, place.longitude);
                  if (locationInfo) {
                    place.village = locationInfo.village;
                    place.mandal = locationInfo.mandal;
                    place.district = locationInfo.district;
                    place.state = locationInfo.state;
                  }
                } catch(e) { }
              }
              
              vendors.push(place);
              dbAdapter.saveVendors(vendors);
              scrapedResults.push(place);
              try { emitVendorEvent(place, 'inserted'); } catch (e) {}
              insertedInBatch++;
              // Silently saving to DB, no log flooding
            } else {
              let existing = vendors[existingIndex];
              let updated = false;

              if (!existing.pincode && place.address) {
                const pMatch = place.address.match(/\b\d{6}\b/);
                if (pMatch) { existing.pincode = pMatch[0]; updated = true; }
              }
              if (!existing.rating && parsedRating) { existing.rating = parsedRating; updated = true; }
              if ((!existing.phone || existing.phone.includes('Obfuscated') || existing.phone.includes('Requires')) && place.phone) {
                existing.phone = place.phone; updated = true;
              }
              
              existing.sessionId = sessionId;
              existing.scrapedAt = new Date().toISOString();
              updated = true;

              if (updated) {
                vendors[existingIndex] = existing;
                dbAdapter.saveVendors(vendors);
                try { emitVendorEvent(existing, 'updated'); } catch (e) {}
              }
            }
          } catch (err) {
            addLog(`Error fast-extracting ${name}: ${err.message}`);
          }
        }

          
          // Single-Tab extraction loop finishes here
        addLog(`Streamed ${insertedInBatch} new vendors to DB. (Total extracted so far: ${scrapedResults.length})`);
      }
    }

    addLog(`Google Maps Scraping complete. Found ${scrapedResults.length} vendors total.`);
  } catch (error) {
    addLog(`Google Maps Scraper error: ${error.message}`);
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}
module.exports = { scrapeGooglePlaces, setDeps };
