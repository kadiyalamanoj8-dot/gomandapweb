const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

let proxyList = [];

async function fetchProxies() {
  try {
    console.log('[Proxy Rotator] Fetching fresh open-source proxies from GitHub (TheSpeedX)...');
    const res = await axios.get('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt');
    const lines = res.data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    proxyList = lines.map(ipPort => `http://${ipPort}`);
    console.log(`[Proxy Rotator] Loaded ${proxyList.length} proxies.`);
  } catch (error) {
    console.error('[Proxy Rotator] Failed to fetch proxies:', error.message);
  }
}

// Fetch proxies on startup and every hour
fetchProxies();
setInterval(fetchProxies, 60 * 60 * 1000);

async function axiosWithProxy(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    // 80% chance to use proxy if available
    const useProxy = proxyList.length > 0 && Math.random() > 0.2; 
    let httpsAgent = null;
    let selectedProxy = null;

    if (useProxy) {
      selectedProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
      httpsAgent = new HttpsProxyAgent(selectedProxy);
    }

    try {
      const response = await axios.get(url, {
        ...options,
        httpsAgent: httpsAgent,
        proxy: false 
      });
      return response;
    } catch (error) {
      console.warn(`[Proxy Rotator] Proxy ${selectedProxy || 'Direct'} failed (${i+1}/${retries}). Retrying...`);
    }
  }
  
  // Final fallback
  console.log(`[Proxy Rotator] All proxies failed for ${url}. Falling back to direct connection.`);
  return axios.get(url, { ...options, httpsAgent: null, proxy: false });
}

function getRandomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

module.exports = {
  fetchProxies,
  axiosWithProxy,
  getRandomIP,
  getProxyList: () => proxyList
};
