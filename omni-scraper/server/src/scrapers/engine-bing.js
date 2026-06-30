const { getBrowser } = require('./browserFactory');

async function scrapeBingLocal(query, sendLog, proxyUrl = null) {
    sendLog(`[Bing Engine] Launching Stealth Context for: ${query}`);
    let context = null;
    let page = null;
    
    try {
        const browser = await getBrowser();
        // create isolated context
        const contextOptions = {};
        if (proxyUrl) {
            contextOptions.proxy = { server: proxyUrl };
            sendLog(`[Bing Engine] Using proxy: ${proxyUrl}`);
        }
        
        context = await browser.newContext(contextOptions);
        page = await context.newPage();
        
        // Go to Bing Local
        const searchUrl = `https://www.bing.com/maps?q=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

        // Wait for results
        await page.waitForSelector('.title, .name, h2', { timeout: 10000 }).catch(() => {});

        // Evaluate to extract basic elements
        // This is a simplified extraction for Bing Maps layout
        const vendors = await page.evaluate(() => {
            const results = [];
            // Bing maps lists items in elements with role="listitem" or specific classes
            // Adjust selectors as Bing maps changes
            const items = document.querySelectorAll('.entity-listing-container, .bm_collectionItem');
            
            items.forEach(item => {
                const nameEl = item.querySelector('.entity-title, .name');
                const addressEl = item.querySelector('.address, .bm_address');
                const phoneEl = item.querySelector('.phone, .bm_phone');
                const websiteEl = item.querySelector('a.website, a.bm_website');
                
                if (nameEl && nameEl.innerText) {
                    results.push({
                        name: nameEl.innerText.trim(),
                        address: addressEl ? addressEl.innerText.trim() : null,
                        phone: phoneEl ? phoneEl.innerText.trim() : null,
                        website: websiteEl ? websiteEl.href : null,
                        source: 'Bing Local'
                    });
                }
            });

            return results;
        });
        
        sendLog(`[Bing Engine] Extracted ${vendors.length} vendors for ${query}`);
        return vendors;
    } catch (e) {
        console.error('[Bing Error]', e.message);
        sendLog(`[Bing Engine] Error: ${e.message}`);
        return [];
    } finally {
        if (page) await page.close().catch(()=>{});
        if (context) await context.close().catch(()=>{});
    }
}

module.exports = { scrapeBingLocal };
