let chromium, stealth;

const PLAYWRIGHT_ENABLED = process.env.ENABLE_PLAYWRIGHT === 'true' || process.env.NODE_ENV !== 'production';

if (PLAYWRIGHT_ENABLED) {
  try {
    const playwrightExtra = require('playwright-extra');
    chromium = playwrightExtra.chromium;
    stealth = require('puppeteer-extra-plugin-stealth')();
    chromium.use(stealth);
    console.log('[Playwright] Browser engine loaded with Stealth.');
  } catch (e) {
    console.warn('[Playwright] Not available on this server.');
  }
}

const { getProxyList, getRandomIP } = require('./proxyManager');

const STEALTH_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
];

async function launchStealthBrowser(useProxy = true) {
  if (!chromium) throw new Error('Playwright not available on this server.');

  const userAgent = STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)];
  const fakeIP = getRandomIP();

  let proxyConfig = undefined;
  const proxyList = getProxyList();
  if (useProxy && proxyList.length > 0) {
    const rawProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    try {
      new URL(rawProxy); // test valid url
      proxyConfig = { server: rawProxy };
    } catch(e) {}
  }

  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-http2',
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    `--user-agent=${userAgent}`,
  ];

  const browser = await chromium.launch({
    headless: true,
    args: launchArgs,
    ...(proxyConfig ? { proxy: proxyConfig } : {})
  });

  return { browser, userAgent, fakeIP };
}

let globalBrowser = null;

async function getBrowser() {
  if (!globalBrowser || !globalBrowser.isConnected()) {
    const { browser } = await launchStealthBrowser(false); 
    globalBrowser = browser;
  }
  return globalBrowser;
}

module.exports = {
  launchStealthBrowser,
  getBrowser,
  chromium
};
