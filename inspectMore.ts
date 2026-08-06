import https from 'https';

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspectMore() {
  const baseUrl = 'https://masatos007.github.io/SidraDEX-Live-Prices/';

  const tokensRaw = await fetchUrl(baseUrl + 'data/tokens.json');
  const tokens = JSON.parse(tokensRaw);
  console.log(`Tokens count: ${tokens.length}`);
  
  // Check which icons exist on the site
  const sampleIcons = tokens.slice(0, 15).map((t: any) => t.icon);
  console.log('Sample icons:', sampleIcons);

  for (const ic of sampleIcons) {
    if (!ic) continue;
    const url = baseUrl + 'img/' + ic;
    const res: any = await new Promise(r => {
      https.get(url, res => r({ status: res.statusCode }));
    });
    console.log(`Icon ${ic} -> HTTP ${res.status}`);
  }

  // Check history API
  try {
    const historyApi = "https://script.google.com/macros/s/AKfycbyjB5nxZMpMN7BrQoDFlrR-tQimj1bh6W5pkmaqIjn_nskhwjTGlVgCe4E4O-BauLDC/exec?type=history";
    console.log('Testing History API...');
    const histRes = await fetchUrl(historyApi);
    console.log('History API response length:', histRes.length);
    console.log('History API snippet:', histRes.slice(0, 500));
  } catch (e: any) {
    console.error('History API error:', e.message);
  }

  // Inspect factory-engine.js pricing functions
  const factoryEngine = await fetchUrl(baseUrl + 'js/factory-engine.js');
  console.log('=== factory-engine.js key functions ===');
  // Find function definitions
  const fnMatches = factoryEngine.match(/function\s+[a-zA-Z0-9_]+\s*\([^)]*\)/g) || [];
  console.log('Functions in factory-engine:', fnMatches);
}

inspectMore();
