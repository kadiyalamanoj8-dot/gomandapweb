const cheerio = require('cheerio');
const axios = require('axios');
const StagingLead = require('../models/StagingLead');
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
    const validEmails = [...new Set(emailMatch)].filter(e => 
      !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.jpeg') && !e.endsWith('.webp') && !e.endsWith('.gif') && !e.includes('wixpress') && !e.includes('sentry')
    );

    const phoneMatch = html.match(/(?:\+91|0)?[ -]?(?:\d{5}[ -]?\d{5}|\d{3}[ -]?\d{3}[ -]?\d{4}|\d{4}[ -]?\d{4})/g) || [];
    const validPhones = [...new Set(phoneMatch)].filter(p => p.replace(/\D/g, '').length >= 10);

    let instagram = '';
    let facebook = '';

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      if (href.includes('instagram.com/') && !instagram) instagram = href;
      if (href.includes('facebook.com/') && !facebook && !href.includes('sharer')) facebook = href;
    });

    let instagramFollowers = '';
    let facebookFollowers = '';

    if (instagram) {
      try {
        const igRes = await axiosWithProxy(instagram, { timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }, 2);
        const igHtml = igRes && igRes.data ? igRes.data : igRes;
        const igMeta = cheerio.load(igHtml)('meta[property="og:description"]').attr('content');
        if (igMeta) {
          const match = igMeta.match(/([\d.,]+[KkMm]?)\s+Followers/i);
          if (match) {
            instagramFollowers = match[1];
            addLog(`[Deep Scrape] Found Instagram for ${vendorName || 'vendor'}: ${instagramFollowers} Followers`);
          }
        }
      } catch (e) {}
    }

    if (facebook) {
      try {
        // Prefer mbasic Facebook for lightweight HTML
        let fbUrl = facebook;
        try { const _u = new URL(fbUrl); fbUrl = `https://mbasic.facebook.com${_u.pathname}${_u.search || ''}`; } catch(e) {}
        const fbRes = await axiosWithProxy(fbUrl, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }, 2);
        const fbHtml = fbRes && fbRes.data ? fbRes.data : fbRes;
        const fbMeta = cheerio.load(fbHtml)('meta[property="og:description"]').attr('content');
        if (fbMeta) {
          const match = fbMeta.match(/([\d.,]+[KkMm]?)\s+(?:likes|followers)/i);
          if (match) {
            facebookFollowers = match[1];
            addLog(`[Deep Scrape] Found Facebook for ${vendorName || 'vendor'}: ${facebookFollowers}`);
          }
        }
      } catch (e) {}
    }

    return {
      email: validEmails.length > 0 ? validEmails[0] : '',
      phone: validPhones.length > 0 ? validPhones[0] : '',
      instagram,
      facebook,
      instagramFollowers,
      facebookFollowers
    };
  } catch (err) {
    console.log(`[Cheerio Deep Scrape] Failed or timed out for ${url}`);
    return { email: '', instagram: '', facebook: '', phone: '', instagramFollowers: '', facebookFollowers: '' };
  }
}

async function scrapeGooglePlaces(exactQuery, category, location, aiKeywords = []) {
  addLog(`Starting Google Maps browser scrape for ${exactQuery} (AI Validation Keywords: ${aiKeywords.length})`);

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

    // Abort image, font, media, and stylesheets to speed up scraping instantly
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(exactQuery)}`;
    addLog(`[System] Navigating to Google Maps search: ${searchUrl}`);
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

      scrapedResults.push({
        name, address, phone, rating,
        mapsLink: page.url(),
        id: 'place_' + Date.now().toString() + Math.random().toString(36).substring(7)
      });
    } else {
      // Case B: Search results list is loaded
      const scrollable = page.locator('div[role="feed"]');
      if (await scrollable.count() > 0) {
        addLog("Scrolling through search results feed... (Fast Mode)");
        
        // Dynamic Fast Scroll - stop early to hit minimum 60
        for(let i=0; i<30; i++) {
          if (globalAbortSignal.aborted) throw new Error('Master Stop Aborted');
          await scrollable.evaluate(node => node.scrollBy(0, 5000));
          await page.waitForTimeout(400); // 400ms is ultra fast
          const currentCount = await page.locator('a.hfpxzc').count();
          if (currentCount >= 65) {
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

        addLog(`Extracted ${vendorLinks.length} raw links. Beginning concurrent Deep Extraction (Hardware Accelerated)...`);

        // Phase 2: Concurrent Multi-Tab Execution (Lower batch size to prevent CPU choking and timeouts)
        const CONCURRENCY_LIMIT = 5;
        for (let i = 0; i < vendorLinks.length; i += CONCURRENCY_LIMIT) {
          if (globalAbortSignal.aborted) throw new Error('Master Stop Aborted');
          
          const batch = vendorLinks.slice(i, i + CONCURRENCY_LIMIT);
          addLog(`Processing concurrent batch ${i/CONCURRENCY_LIMIT + 1} of ${Math.ceil(vendorLinks.length/CONCURRENCY_LIMIT)}...`);
          
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

              // Navigate directly to the Maps detail view
              await newPage.goto(vendor.mapsLink, { waitUntil: 'domcontentloaded', timeout: 25000 });

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
              let enrichedData = { email: '', instagram: '', facebook: '', phone: '', instagramFollowers: '', facebookFollowers: '' };
              if (websiteUrl) {
                enrichedData = await scrapeWebsiteForSocials(browser, websiteUrl);
              }

              const finalPhone = (phone && !phone.includes('Requires')) ? phone : (enrichedData.phone || phone);

              // AI HTML Verification: Scan innerText for semantic matches
              let pageText = '';
              try {
                pageText = await newPage.innerText('body', { timeout: 2000 }).catch(()=>'');
              } catch(e) {}
              
              let aiVerified = false;
              let matchedKeywords = [];
              if (aiKeywords && aiKeywords.length > 0 && pageText) {
                const lowerText = pageText.toLowerCase();
                matchedKeywords = aiKeywords.filter(kw => lowerText.includes(kw.toLowerCase()));
                if (matchedKeywords.length > 0) {
                  aiVerified = true;
                  addLog(`[AI HTML Parser] Verified '${vendor.name}' - Found keywords: [${matchedKeywords.join(', ')}]`);
                }
              }

              return {
                name: vendor.name,
                address,
                phone: finalPhone,
                rating,
                mapsLink: vendor.mapsLink,
                website: websiteUrl,
                operatingHours: operatingHours.substring(0, 150),
                topReviews,
                email: enrichedData.email,
                instagram: enrichedData.instagram,
                facebook: enrichedData.facebook,
                instagramFollowers: enrichedData.instagramFollowers,
                facebookFollowers: enrichedData.facebookFollowers,
                aiVerified,
                matchedKeywords,
                id: 'place_' + Date.now().toString() + Math.random().toString(36).substring(7)
              };


            } catch (err) {
              addLog(`Error in concurrent extraction for ${vendor.name}: ${err.message}`);
              return null;
            } finally {
              if (newPage) await newPage.close();
            }
          });

          // Wait for the entire batch to finish concurrently
          const batchResults = await Promise.all(batchPromises);
          
          // STREAMING INSERTION TO DB
          const validResults = batchResults.filter(res => res !== null);
          let insertedInBatch = 0;

          for (const place of validResults) {
            if (!place.name) continue;

            const pincodeMatch = place.address ? place.address.match(/\b\d{6}\b/) : null;
            const pincode = pincodeMatch ? pincodeMatch[0] : '';

            // Filter out Mumbai/Maharashtra results
            const isMumbaiOrMH = place.address && (
              place.address.toLowerCase().includes('mumbai') || 
              place.address.toLowerCase().includes('maharashtra') || 
              pincode.startsWith('4')
            );
            if (isMumbaiOrMH) continue;

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
                source: 'Google Maps Engine',
                verified: false,
                aiVerified: place.aiVerified,
                matchedKeywords: place.matchedKeywords,
                email: place.email || '',
                instagram: place.instagram || '',
                instagramFollowers: place.instagramFollowers || '',
                facebook: place.facebook || '',
                facebookFollowers: place.facebookFollowers || '',
                website: place.website || '',
                qualityScore: leadScore,
                tier: determineTier(leadScore),
                operatingHours: place.operatingHours || '',
                topReviews: place.topReviews || []
              });
              const savedLead = await newLead.save();
              try { emitVendorEvent(savedLead, 'inserted'); } catch (e) {}
              insertedInBatch++;
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
              try { emitVendorEvent(existing, 'updated'); } catch (e) {}
            }
          }
          
          scrapedResults.push(...validResults);
          addLog(`Streamed ${insertedInBatch} new vendors to DB from this batch. (Total extracted so far: ${scrapedResults.length})`);
        }
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
