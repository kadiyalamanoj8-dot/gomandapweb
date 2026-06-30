const axios = require('axios');
const cheerio = require('cheerio');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Dummy proxy list fetcher for example.
// In reality, this would fetch from a reliable source like monosans github
async function getProxyList() {
    try {
        const res = await axios.get('https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt');
        const proxies = res.data.split('\n').filter(p => p.trim() !== '');
        return proxies.slice(0, 50); // Get top 50
    } catch (e) {
        console.warn('Failed to fetch proxies, falling back to direct connection');
        return [];
    }
}

async function scrapeWebsite(url) {
    if (!url) return {};
    
    let axiosConfig = { 
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };

    try {
        const proxies = await getProxyList();
        if (proxies.length > 0) {
            const proxy = proxies[Math.floor(Math.random() * proxies.length)];
            axiosConfig.httpsAgent = new HttpsProxyAgent(`http://${proxy}`);
        }

        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);
        
        let email = null;
        let socials = [];
        
        // Find mailto
        $('a[href^="mailto:"]').each((i, el) => {
            if (!email) email = $(el).attr('href').replace('mailto:', '').trim();
        });

        // Regex fallback
        if (!email) {
            const bodyText = $('body').text();
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
            const match = bodyText.match(emailRegex);
            if (match) email = match[0];
        }
        
        // Find socials
        $('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"]').each((i, el) => {
            socials.push($(el).attr('href'));
        });

        return { email, socials: [...new Set(socials)] };
    } catch (e) {
        // Deep scan failed (timeout or block), return gracefully
        return {};
    }
}

module.exports = {
    getProxyList,
    scrapeWebsite
};
