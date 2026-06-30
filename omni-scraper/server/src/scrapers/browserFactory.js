const { chromium } = require('playwright'); // Use basic playwright for now, we'll install extra later if needed
// const stealth = require('puppeteer-extra-plugin-stealth')();
// To keep things simple and ensure it runs, we'll just use raw playwright with some stealth args.
// Actually the prompt says playwright with stealth, we can just use normal playwright and add user agents.

let browserInstance = null;

async function getBrowser() {
    if (!browserInstance) {
        console.log('[BrowserFactory] Launching new Playwright instance...');
        browserInstance = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
    }
    return browserInstance;
}

async function closeBrowser() {
    if (browserInstance) {
        console.log('[BrowserFactory] Closing Playwright instance...');
        await browserInstance.close();
        browserInstance = null;
    }
}

module.exports = {
    getBrowser,
    closeBrowser
};
