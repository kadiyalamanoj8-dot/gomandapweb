let chromium, firefox, stealth;

const PLAYWRIGHT_ENABLED = process.env.ENABLE_PLAYWRIGHT === 'true' || process.env.NODE_ENV !== 'production';

if (PLAYWRIGHT_ENABLED) {
  try {
    const playwrightExtra = require('playwright-extra');
    chromium = playwrightExtra.chromium;
    firefox = playwrightExtra.firefox;
    stealth = require('puppeteer-extra-plugin-stealth')();
    if (chromium) chromium.use(stealth);
    if (firefox) firefox.use(stealth);
    console.log('[Playwright] Browser engines loaded with Stealth.');
  } catch (e) {
    console.warn('[Playwright] Not available on this server.');
  }
}

const { getProxyList, getRandomIP } = require('./proxyManager');

const STEALTH_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
];

const fs = require('fs');

async function launchStealthBrowser(useProxy = true, executablePath = null) {
  if (!chromium) throw new Error('Playwright Chromium not available on this server.');

  const userAgent = STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)];
  const fakeIP = getRandomIP();

  let proxyConfig = undefined;
  const proxyList = getProxyList();
  if (useProxy && proxyList.length > 0) {
    const rawProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    try {
      new URL(rawProxy);
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
    // Force Hardware Acceleration & Graphics Card
    '--enable-gpu',
    '--ignore-gpu-blocklist',
    '--enable-webgl',
    '--enable-accelerated-2d-canvas'
  ];

  const launchOptions = {
    headless: true,
    args: launchArgs,
    ...(proxyConfig ? { proxy: proxyConfig } : {})
  };

  if (executablePath && typeof executablePath === 'string') {
    launchOptions.executablePath = executablePath;
  } else {
    // Windows Auto-Detect Fallbacks to bypass Playwright executable bugs
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        launchOptions.executablePath = p;
        break;
      }
    }
  }
  
  const browser = await chromium.launch(launchOptions);

  return { browser, userAgent, fakeIP };
}

async function launchBraveBrowser(useProxy = true) {
  // Brave is typically located here on Windows
  const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
  
  // Try launching it with stealth
  try {
    return await launchStealthBrowser(useProxy, bravePath);
  } catch (error) {
    console.warn(`[Brave] Could not launch Brave from ${bravePath}. Ensure it is installed. Falling back to default chromium.`);
    return await launchStealthBrowser(useProxy);
  }
}

async function launchFirefoxBrowser(useProxy = false) {
  if (!firefox) throw new Error('Playwright Firefox not available on this server.');
  const fakeIP = getRandomIP();
  
  let proxyConfig = undefined;
  const proxyList = getProxyList();
  if (useProxy && proxyList.length > 0) {
    const rawProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    try {
      new URL(rawProxy);
      proxyConfig = { server: rawProxy };
    } catch(e) {}
  }

  const browser = await firefox.launch({
    headless: true,
    ...(proxyConfig ? { proxy: proxyConfig } : {})
  });
  
  return { browser, fakeIP };
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
  launchBraveBrowser,
  launchFirefoxBrowser,
  getBrowser,
  chromium,
  firefox
};
