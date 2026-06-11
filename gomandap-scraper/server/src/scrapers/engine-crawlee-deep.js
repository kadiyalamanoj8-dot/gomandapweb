const { CheerioCrawler, log } = require('crawlee');
const dbAdapter = require('../config/dbAdapter');

let deps = {
  logger: console.log,
  abortSignal: { aborted: false },
  emitVendorEvent: () => {}
};

function setDeps(newDeps) {
  deps = { ...deps, ...newDeps };
}

// Helper: Extract emails and phones using regex
function extractContactInfo(text) {
  const emails = [];
  const phones = [];
  
  if (!text) return { emails, phones };

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const foundEmails = text.match(emailRegex) || [];
  foundEmails.forEach(e => {
    if (!emails.includes(e.toLowerCase()) && !e.includes('.png') && !e.includes('.jpg')) {
      emails.push(e.toLowerCase());
    }
  });

  const phoneRegex = /(?:\+91|0)?[ -]?\d{4}[ -]?\d{3}[ -]?\d{3}|(?:\+91|0)?[ -]?\d{5}[ -]?\d{5}/g;
  const foundPhones = text.match(phoneRegex) || [];
  foundPhones.forEach(p => {
    const cleanPhone = p.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && cleanPhone.length <= 12) {
      if (!phones.includes(cleanPhone)) {
        phones.push(cleanPhone);
      }
    }
  });

  return { emails, phones };
}

async function scrapeCrawleeDeep(url, vendorName, category, location) {
  deps.logger(`[Crawlee Deep Scanner] Starting deep scan for ${vendorName} at ${url}`);
  
  let foundContacts = { phone: null, email: null };

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 5, // Only check up to 5 sub-pages to save time
    async requestHandler({ $, request, enqueueLinks }) {
      if (deps.abortSignal.aborted) {
        deps.logger(`[Crawlee] Aborted crawl for ${url}`);
        return;
      }
      
      deps.logger(`[Crawlee] Scanning ${request.url}`);
      
      // Remove scripts and styles before extracting text
      $('script, style, noscript').remove();
      const bodyText = $('body').text();
      
      const { emails, phones } = extractContactInfo(bodyText);
      
      if (!foundContacts.phone && phones.length > 0) {
        foundContacts.phone = `+91 ${phones[0].slice(-10)}`;
        deps.logger(`[Crawlee] Found Phone: ${foundContacts.phone} on ${request.url}`);
      }
      if (!foundContacts.email && emails.length > 0) {
        foundContacts.email = emails[0];
        deps.logger(`[Crawlee] Found Email: ${foundContacts.email} on ${request.url}`);
      }
      
      // If we found both, stop crawling
      if (foundContacts.phone && foundContacts.email) {
        deps.logger(`[Crawlee] Found both Phone and Email. Stopping deep scan for ${vendorName}.`);
        return;
      }

      // Look for contact pages
      await enqueueLinks({
        globs: ['**/contact**', '**/about**', '**/reach-us**'],
      });
    },
    failedRequestHandler({ request }) {
      deps.logger(`[Crawlee Error] Request ${request.url} failed.`);
    },
  });

  await crawler.run([url]);
  
  if (foundContacts.phone || foundContacts.email) {
    const newLead = {
      name: vendorName,
      category: category,
      city: location,
      address: 'Unknown',
      phone: foundContacts.phone,
      email: foundContacts.email,
      website: url,
      source: 'Crawlee Deep Scan',
      verified: false,
      pushed: false
    };
    
    // Save to DB
    const existingVendors = await dbAdapter.getVendors();
    const isDup = existingVendors.find(v => v.phone === newLead.phone || v.website === newLead.website);
    if (!isDup) {
      existingVendors.push(newLead);
      await dbAdapter.saveVendors(existingVendors);
      try { deps.emitVendorEvent(newLead, 'inserted'); } catch (e) {}
    } else {
      deps.logger(`[Crawlee] Vendor already exists in DB.`);
    }
  } else {
    deps.logger(`[Crawlee] No contact info found after deep scan for ${vendorName}.`);
  }
}

module.exports = { scrapeCrawleeDeep, setDeps };
