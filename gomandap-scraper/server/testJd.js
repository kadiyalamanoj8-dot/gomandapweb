const { search, SafeSearchType } = require('duck-duck-scrape');

async function testJd() {
    try {
        console.log('Searching DuckDuckGo for Justdial...');
        const query = 'site:justdial.com wedding photographers in guntur';
        const searchResults = await search(query, { safeSearch: SafeSearchType.OFF });
        
        const results = searchResults.results;
        console.log(`Found ${results.length} Justdial results.`);

        for (const item of results) {
            console.log(`Title: ${item.title}`);
            console.log(`URL: ${item.url}`);
            console.log(`Description: ${item.description}`);
            console.log('---');
        }
    } catch(e) {
        console.error('Error:', e);
    }
}
testJd();
