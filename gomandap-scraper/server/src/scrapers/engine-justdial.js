const { launchStealthBrowser } = require('./browserFactory');
const dbAdapter = require('../config/dbAdapter');

let deps = {
  logger: console.log,
  abortSignal: { aborted: false },
  emitVendorEvent: () => {}
};

function setDeps(newDeps) {
  deps = { ...deps, ...newDeps };
}

async function scrapeJustDial(category, location) {
  deps.logger(`[JustDial Engine] Starting scrape for ${category} in ${location}`);
  const searchUrl = `https://www.justdial.com/${location.split(',')[0].trim()}/${category.replace(/ /g, '-')}`;
  
  deps.logger(`[JustDial Engine] Navigating to: ${searchUrl}`);
  
  let browser = null;
  let context = null;

  try {
    const launched = await launchStealthBrowser(true); 
    browser = launched.browser;

    context = await browser.newContext({
      viewport: { width: 1280 + Math.floor(Math.random()*100), height: 800 + Math.floor(Math.random()*100) },
      userAgent: launched.userAgent
    });
    const page = await context.newPage();

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    const finalUrl = page.url().toLowerCase();
    const mandalSegment = location.split(',')[0].trim().toLowerCase().replace(/ /g, '-');
    const districtSegment = location.includes(',') ? location.split(',')[1].trim().toLowerCase().replace(/ /g, '-') : '';
    
    const isMandalMatched = finalUrl.includes(mandalSegment);
    const isDistrictMatched = districtSegment && finalUrl.includes(districtSegment);

    if (!isMandalMatched && !isDistrictMatched) {
      deps.logger(`[JustDial Warning] Redirected to unrelated city page. Skipping.`);
      return;
    }

    let html = await page.content();
    if (html.includes('<body></body>') || html.length < 500) {
      throw new Error("JustDial persistently blocked this request. Try again later.");
    }

    for (let i = 0; i < 5; i++) {
      if (deps.abortSignal.aborted) break;
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1000);
    }
    
    if (deps.abortSignal.aborted) return;

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

    deps.logger(`[JustDial Engine] Found ${results.length} raw results.`);
    let newCount = 0;
    
    const vendors = dbAdapter.getVendors();
    for (const v of results) {
      if (deps.abortSignal.aborted) break;
      // Robust Dedup by Phone & Name
      let existing = vendors.find(x => x.name === v.name && x.city === location);
      if (!existing && v.phone && v.phone !== 'Requires Manual Lookup') {
        const normalizedInputPhone = v.phone.replace(/\D/g, '');
        existing = vendors.find(x => x.phone && x.phone.replace(/\D/g, '') === normalizedInputPhone);
      }

      if (!existing) {
        let parsedRating = null;
        if (v.rating && v.rating !== '-') {
          parsedRating = parseFloat(v.rating);
          if (isNaN(parsedRating)) parsedRating = null;
        }
        const pincodeMatch = v.address ? v.address.match(/\b\d{6}\b/) : null;
        
        let normalizedPhone = v.phone;
        if (normalizedPhone && normalizedPhone !== 'Requires Manual Lookup') {
          // Keep only digits
          normalizedPhone = normalizedPhone.replace(/\D/g, '');
        }

        const created = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          name: v.name,
          category: category,
          city: location,
          address: v.address || `Located in ${location}`,
          pincode: pincodeMatch ? pincodeMatch[0] : '',
          phone: normalizedPhone || 'Requires Manual Lookup',
          rating: parsedRating,
          source: 'JustDial',
          scrapedAt: new Date().toISOString()
        };
        vendors.push(created);
        dbAdapter.saveVendors(vendors);
        try { deps.emitVendorEvent(created, 'inserted'); } catch (e) {}
        newCount++;
      }
    }
    deps.logger(`[JustDial Engine] Complete. Inserted ${newCount} new vendors.`);
  } catch (error) {
    deps.logger(`[JustDial Error] ${error.message}`);
  } finally {
    try { if (context) await context.close(); } catch(e){}
    try { if (browser) await browser.close(); } catch(e){}
  }
}

module.exports = {
  scrapeJustDial,
  setDeps
};
