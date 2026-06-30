const { getBrowser } = require('./browserFactory');

async function scrapeYahooLocal(query, sendLog, proxyUrl = null) {
    sendLog(`[Yahoo Engine] Launching Stealth Context for: ${query}`);
    let context = null;
    let page = null;
    
    try {
        const browser = await getBrowser();
        const contextOptions = {};
        if (proxyUrl) {
            contextOptions.proxy = { server: proxyUrl };
            sendLog(`[Yahoo Engine] Using proxy: ${proxyUrl}`);
        }
        
        context = await browser.newContext(contextOptions);
        page = await context.newPage();
        
        // Go to Yahoo Local search
        const searchUrl = `https://search.yahoo.com/local/s?p=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

        // Wait for results
        await page.waitForSelector('.List, .local-results, h3', { timeout: 10000 }).catch(() => {});

        // Evaluate to extract basic elements
        const vendors = await page.evaluate(() => {
            const results = [];
            // Yahoo local items
            const items = document.querySelectorAll('.List-item, .local-result-item, .algo');
            
            items.forEach(item => {
                const nameEl = item.querySelector('.title, h3');
                const addressEl = item.querySelector('.address, .location');
                const phoneEl = item.querySelector('.phone, .tel');
                const websiteEl = item.querySelector('a.url, a.website');
                
                if (nameEl && nameEl.innerText) {
                    results.push({
                        name: nameEl.innerText.trim(),
                        address: addressEl ? addressEl.innerText.trim() : null,
                        phone: phoneEl ? phoneEl.innerText.trim() : null,
                        website: websiteEl ? websiteEl.href : null,
                        source: 'Yahoo Local'
                    });
                }
            });

            return results;
        });
        
        sendLog(`[Yahoo Engine] Extracted ${vendors.length} vendors for ${query}`);
        return vendors;
    } catch (e) {
        console.error('[Yahoo Error]', e.message);
        sendLog(`[Yahoo Engine] Error: ${e.message}`);
        return [];
    } finally {
        if (page) await page.close().catch(()=>{});
        if (context) await context.close().catch(()=>{});
    }
}

module.exports = { scrapeYahooLocal };
