const axios = require('axios');
const { getNvidiaApiKey } = require('../config/settingsManager');

/**
 * Intelligent Agent Extractor using Nvidia's DeepSeek-V4-Pro API
 */
async function extractData(rawText, domainHint = '') {
  const defaultData = {
    servicesOffered: [],
    pricingFound: null,
    emails: [],
    phones: [],
    aiCategory: 'Unknown',
    extractedAddress: '',
    socialLinks: {},
    businessSummary: '',
    score: 0
  };

  if (!rawText || rawText.trim().length === 0) return defaultData;

  const prompt = `You are a master data extraction AI. Extract the following from the raw website text: 
1. Phone numbers (phones - array of strings)
2. Email addresses (emails - array of strings)
3. Specific category of the vendor (aiCategory - string, e.g., "Candid Photographer", "Luxury Banquet", "Mehendi Artist")
4. Physical Address (extractedAddress - string, look for footers/contact info)
5. Social Media Links (socialLinks - object with keys like "instagram", "facebook", "youtube" if found)
6. Business Summary (businessSummary - string, write a 2-sentence pitch about what they do and their vibe)
7. Pricing details (pricingFound - string or null)

Raw text from ${domainHint}:
"""
${rawText.substring(0, 8000)}
"""

Return ONLY a valid JSON object matching the requested schema. No markdown formatting.`;

  try {
    const apiKey = getNvidiaApiKey();
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        top_p: 0.95,
        max_tokens: 1500,
        extra_body: { chat_template_kwargs: { thinking: false } },
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    const rawContent = response.data.choices[0].message.content;
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    let score = 0;
    if (parsed.phones && parsed.phones.length > 0) score += 40;
    if (parsed.emails && parsed.emails.length > 0) score += 20;
    if (parsed.extractedAddress) score += 20;
    if (parsed.socialLinks && Object.keys(parsed.socialLinks).length > 0) score += 10;
    if (parsed.businessSummary) score += 10;

    return {
      servicesOffered: parsed.servicesOffered || [],
      pricingFound: parsed.pricingFound || null,
      emails: parsed.emails || [],
      phones: parsed.phones || [],
      aiCategory: parsed.aiCategory || 'Unknown',
      extractedAddress: parsed.extractedAddress || '',
      socialLinks: parsed.socialLinks || {},
      businessSummary: parsed.businessSummary || '',
      score
    };

  } catch (error) {
    console.error(`[Intelligent Extractor] DeepSeek API failed: ${error.message}`);
    // Fallback to default heuristic if API fails
    return defaultData;
  }
}

/**
 * Evaluates Search Engine Results Pages (SERP) to pick the best direct vendor links.
 */
async function evaluateSERP(serpData) {
  if (!serpData || serpData.length === 0) return [];
  
  const prompt = `You are an AI research agent looking for DIRECT vendor websites (e.g., individual photographers, specific banquet halls).
Analyze the following search results. Ignore directories, aggregators, news sites, or broad lists (like JustDial, WedMeGood, WeddingWire, Pinterest).
Return ONLY a JSON array of the top 3 to 5 most promising direct vendor URLs.
Format: ["https://example.com", "https://another.com"]

Search Results:
${JSON.stringify(serpData, null, 2)}
`;

  try {
    const apiKey = getNvidiaApiKey();
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 500,
        extra_body: { chat_template_kwargs: { thinking: false } },
        stream: false
      },
      { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 45000 }
    );

    const rawContent = response.data.choices[0].message.content;
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[Intelligent Extractor] evaluateSERP failed: ${err.message}`);
    return serpData.slice(0, 3).map(s => s.url); // Fallback to top 3
  }
}

/**
 * Generates a refined search query if the previous one failed to find enough leads.
 */
async function generateRefinedQuery(previousQuery, resultsFound) {
  const prompt = `You are an AI research agent. You previously searched for "${previousQuery}" but only found ${resultsFound} high-quality leads.
Generate a NEW, refined search query to find more direct vendors. Consider adding words like "contact", "official website", "portfolio", or excluding directories (e.g., -justdial).
Return ONLY the new search query string. Do not use quotes or markdown.`;

  try {
    const apiKey = getNvidiaApiKey();
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 100,
        extra_body: { chat_template_kwargs: { thinking: false } },
        stream: false
      },
      { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 45000 }
    );

    let newQuery = response.data.choices[0].message.content.trim();
    newQuery = newQuery.replace(/^"/, '').replace(/"$/, '');
    return newQuery;
  } catch (err) {
    console.error(`[Intelligent Extractor] generateRefinedQuery failed: ${err.message}`);
    return `${previousQuery} contact info`; // Safe fallback
  }
}

/**
 * Breaks down a broad location (like a District or State) into an array of specific towns/localities.
 */
async function generateLocalities(broadLocation) {
  const prompt = `You are a geographic AI assistant. The user wants to search for vendors in "${broadLocation}".
If "${broadLocation}" is a broad district, state, or large region, return a JSON array of the top 15 major towns, cities, or prominent neighborhoods within that area.
If "${broadLocation}" is already a very specific small town or specific neighborhood, just return a JSON array with that single location.
Return ONLY a valid JSON array of strings. Do not include markdown formatting or any other text.
Example format: ["Guntur City", "Tenali", "Mangalagiri", "Bapatla"]`;

  try {
    const apiKey = getNvidiaApiKey();
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
        extra_body: { chat_template_kwargs: { thinking: false } },
        stream: false
      },
      { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 45000 }
    );

    const rawContent = response.data.choices[0].message.content;
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return Array.isArray(parsed) ? parsed : [broadLocation];
  } catch (err) {
    console.error(`[Intelligent Extractor] generateLocalities failed: ${err.message}`);
    return [broadLocation]; // Fallback to the original search
  }
}

/**
 * Generates nearby towns/localities within a given radius.
 */
async function generateNearbyLocations(location, radiusKm) {
  const prompt = `You are a geographic AI assistant. The user wants to search for vendors within ${radiusKm}km of "${location}".
Return a JSON array of 5 to 10 major towns, cities, or prominent neighborhoods that fall within this radius. Include the original location as the first element.
Return ONLY a valid JSON array of strings. Do not include markdown formatting or any other text.
Example format: ["Guntur City", "Tenali", "Mangalagiri", "Bapatla"]`;

  try {
    const apiKey = getNvidiaApiKey();
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
        extra_body: { chat_template_kwargs: { thinking: false } },
        stream: false
      },
      { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 45000 }
    );

    const rawContent = response.data.choices[0].message.content;
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return Array.isArray(parsed) ? parsed : [location];
  } catch (err) {
    console.error(`[Intelligent Extractor] generateNearbyLocations failed: ${err.message}`);
    return [location]; // Fallback to original
  }
}

/**
 * Analyzes a location to determine its geographic scope and returns culturally accurate subdivisions.
 */
async function analyzeGeographicScope(location) {
  const prompt = `You are a geographic intelligence AI. The user wants to search for vendors in "${location}".
Determine if this location is a broad region (like a District, State, County, or Province) or a specific localized town/city.
If it is a specific localized town/city, return: {"type": "specific"}
If it is a broad region, you must provide exactly 3 culturally accurate search scope options for the user. 
For example:
- If "Guntur", return: {"type": "broad", "options": ["Search Entire District", "Search Only Guntur City", "Search All Mandals"]}
- If "New York", return: {"type": "broad", "options": ["Search Entire State", "Search Only NYC", "Search All Counties"]}
- If "London", return: {"type": "broad", "options": ["Search Greater London", "Search City of London", "Search All Boroughs"]}
Return ONLY valid JSON format. Do not use markdown wrappers.`;

  try {
    const apiKey = getNvidiaApiKey();
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'deepseek-ai/deepseek-v4-pro',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
        extra_body: { chat_template_kwargs: { thinking: false } },
        stream: false
      },
      { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 45000 }
    );

    const rawContent = response.data.choices[0].message.content;
    const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error(`[Intelligent Extractor] analyzeGeographicScope failed: ${err.message}`);
    return { type: "specific" }; // Safe fallback
  }
}

module.exports = {
  extractData,
  evaluateSERP,
  generateRefinedQuery,
  generateLocalities,
  generateNearbyLocations,
  analyzeGeographicScope
};
