const { PlaywrightCrawler, Dataset } = require('crawlee');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');

const DOWNLOADS_DIR = path.join(__dirname, '../../downloads');

async function downloadPdf(url, jobId) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const fileName = `${jobId}_${hash}.pdf`;
    const filePath = path.join(DOWNLOADS_DIR, fileName);
    fs.writeFileSync(filePath, response.data);
    
    // Parse text from PDF
    const data = await pdfParse(response.data);
    return {
      type: 'pdf',
      title: fileName,
      url,
      localFilePath: `/downloads/${fileName}`,
      content: data.text.substring(0, 50000) // Keep first 50k chars to prevent memory issues
    };
  } catch (err) {
    console.error(`Failed to download PDF: ${url}`, err.message);
    return null;
  }
}

async function runDeepCrawler(query, jobId, updateProgress) {
  const dataset = await Dataset.open(`research_${jobId}`);
  
  // Create search URLs for DuckDuckGo
  const encodedQuery = encodeURIComponent(query);
  const startUrls = [
    `https://html.duckduckgo.com/html/?q=${encodedQuery}`,
    `https://html.duckduckgo.com/html/?q=${encodedQuery}+filetype:pdf`
  ];

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 50, // Crawl up to 50 pages total
    async requestHandler({ request, page, enqueueLinks, log }) {
      log.info(`Processing ${request.url}`);
      
      // If we're on DuckDuckGo search results
      if (request.url.includes('duckduckgo.com')) {
        const links = await page.$$eval('a.result__url', els => els.map(a => a.href));
        log.info(`Found ${links.length} links on search page.`);
        
        // Enqueue the found links
        await enqueueLinks({
          urls: links,
          strategy: 'all' // Scrape everything we find
        });
        
        if (updateProgress) updateProgress(10); // arbitrary progress bump
        return;
      }
      
      // If it's a direct PDF link
      if (request.url.toLowerCase().endsWith('.pdf')) {
        log.info(`Found PDF: ${request.url}`);
        const pdfData = await downloadPdf(request.url, jobId);
        if (pdfData) {
          await dataset.pushData(pdfData);
        }
        return;
      }

      // It's a standard webpage
      const html = await page.content();
      const $ = cheerio.load(html);
      
      // Remove junk
      $('script, style, nav, footer, header, noscript, iframe').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      const title = $('title').text() || request.url;

      if (text.length > 200) {
        await dataset.pushData({
          type: 'html',
          title,
          url: request.url,
          content: text.substring(0, 50000)
        });
      }
    },
    failedRequestHandler({ request, log }) {
      log.error(`Request ${request.url} failed too many times.`);
    },
  });

  await crawler.run(startUrls);
  
  // Return all gathered data
  const data = await dataset.getData();
  return data.items;
}

module.exports = { runDeepCrawler };
