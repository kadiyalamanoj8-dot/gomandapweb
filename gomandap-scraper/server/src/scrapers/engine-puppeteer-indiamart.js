const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const dbAdapter = require('../config/dbAdapter');

let deps = {
  logger: console.log,
  abortSignal: { aborted: false },
  emitVendorEvent: () => {}
};

function setDeps(newDeps) {
  deps = { ...deps, ...newDeps };
}

async function scrapePuppeteerIndiaMart(category, location) {
  deps.logger(`[Puppeteer Stealth] Starting IndiaMart deep scrape for ${category} in ${location}`);
  const searchUrl = `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(category)}+in+${encodeURIComponent(location)}`;
  
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Randomize user agent slightly to evade basic fingerprinting
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    deps.logger(`[Puppeteer Stealth] Navigating to ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    deps.logger(`[Puppeteer Stealth] Bypassing directory walls... waiting 5 seconds.`);
    await new Promise(r => setTimeout(r, 5000));
    
    if (deps.abortSignal.aborted) throw new Error("Aborted");

    // Extract basic leads from listing
    const extractedLeads = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('.ls_co_nm, .mng_title').forEach((el) => {
        const name = el.innerText.trim();
        const parent = el.closest('li') || el.closest('.lst_nd');
        if (parent) {
          const addressEl = parent.querySelector('.clg, .desc_loc');
          const address = addressEl ? addressEl.innerText.trim() : 'India';
          const linkEl = parent.querySelector('a');
          const website = linkEl ? linkEl.href : '';
          
          results.push({ name, address, website });
        }
      });
      return results;
    });

    deps.logger(`[Puppeteer Stealth] Found ${extractedLeads.length} leads on IndiaMart. Processing...`);

    const existingVendors = await dbAdapter.getVendors();

    for (const lead of extractedLeads) {
      if (deps.abortSignal.aborted) break;

      const newLead = {
        name: lead.name,
        category: category,
        city: location,
        address: lead.address,
        phone: null, // IndiaMart usually requires clicking "View Number", which we skip for broad scrape, rely on Crawlee to deep-scan website
        email: null,
        website: lead.website,
        source: 'IndiaMART (Puppeteer)',
        verified: false,
        pushed: false
      };

      const isDup = existingVendors.find(v => v.website === newLead.website || v.name === newLead.name);
      if (!isDup && newLead.name) {
        existingVendors.push(newLead);
        await dbAdapter.saveVendors(existingVendors);
        try { deps.emitVendorEvent(newLead, 'inserted'); } catch (e) {}
      }
    }

  } catch (err) {
    deps.logger(`[Puppeteer Stealth Error] ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapePuppeteerIndiaMart, setDeps };
