const { launchStealthBrowser } = require('./browserFactory');
const StagingLead = require('../models/StagingLead');

let globalAbortSignal = { aborted: false };
let addLog = console.log;
let emitVendorEvent = () => {};

function setDeps({ logger, abortSignal, emitVendorEvent: evt }) {
  if (logger) addLog = logger;
  if (abortSignal) globalAbortSignal = abortSignal;
  if (evt) emitVendorEvent = evt;
}

async function scrapeJustDial(category, location) {
  addLog(`Starting JustDial scrape for ${category} in ${location}`);
  const searchUrl = `https://www.justdial.com/${location.split(',')[0].trim()}/${category.replace(/ /g, '-')}`;
  
  addLog(`Navigating to: ${searchUrl}`);
  
  let browser = null;
  let context = null;
  let page = null;

  try {
    const launched = await launchStealthBrowser(false);
    browser = launched.browser;

    context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    page = await context.newPage();

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const finalUrl = page.url().toLowerCase();
    const mandalSegment = location.split(',')[0].trim().toLowerCase().replace(/ /g, '-');
    const districtSegment = location.includes(',') ? location.split(',')[1].trim().toLowerCase().replace(/ /g, '-') : '';
    
    const isMandalMatched = finalUrl.includes(mandalSegment);
    const isDistrictMatched = districtSegment && finalUrl.includes(districtSegment);

    if (!isMandalMatched && !isDistrictMatched) {
      addLog(`[Warning] JustDial redirected to an unrelated city page. Skipping.`);
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

    addLog(`Found ${results.length} raw results from JustDial`);
    let newCount = 0;
    
    for (const v of results) {
      if (globalAbortSignal.aborted) throw new Error('Master Stop Aborted');
      const existing = await StagingLead.findOne({ name: v.name, city: location });
      if (!existing) {
        let parsedRating = null;
        if (v.rating && v.rating !== '-') {
          parsedRating = parseFloat(v.rating);
          if (isNaN(parsedRating)) parsedRating = null;
        }
        const pincodeMatch = v.address ? v.address.match(/\\b\\d{6}\\b/) : null;
        const created = await StagingLead.create({
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          name: v.name,
          category: category,
          city: location,
          address: v.address || `Located in ${location}`,
          pincode: pincodeMatch ? pincodeMatch[0] : '',
          phone: v.phone || 'Requires Manual Lookup',
          rating: parsedRating,
          source: 'JustDial',
          verified: false,
          pushed: false,
          qualityScore: 30
        });
        try { emitVendorEvent(created, 'inserted'); } catch (e) {}
        newCount++;
      }
    }
    addLog(`Scraping complete. Inserted ${newCount} new vendors into staging.`);
  } catch (error) {
    addLog(`JustDial Scraper error: ${error.message}`);
  } finally {
    try { if (context) await context.close(); } catch(e){}
    try { if (browser) await browser.close(); } catch(e){}
  }
}

module.exports = { scrapeJustDial, setDeps };
