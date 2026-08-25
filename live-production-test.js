const https = require('https');
const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log('🚀 X2Y SDK — LIVE PRODUCTION TEST (Real GitHub API)\n');

// Initialize SDK with all rules enabled
const sdk = new X2YSdk(
  { rateLimitThreshold: 70 }, // Warn if 70% of quota is used
  { targetLanguage: 'javascript', rules: ['performance', 'idiom', 'async'] }
);

// Helper to make real HTTPS requests
function fetchLive(endpoint) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    https.get(`https://api.github.com${endpoint}`, {
      headers: { 'User-Agent': 'X2Y-Live-Test' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          endpoint,
          method: 'GET',
          timestamp: Date.now(),
          responseTime: duration,
          statusCode: res.statusCode,
          headers: res.headers
        });
      });
    }).on('error', reject);
  });
}

(async () => {
  // ----------------------------------------------------------
  // 1. CODE REFACTORING & PERFORMANCE (Self-Analysis)
  // ----------------------------------------------------------
  console.log('1️⃣ Testing Code Refactoring & Performance on Live File...');
  try {
    const suggestions = await sdk.refactorFile('./live-production-test.js');
    const perfCount = suggestions.filter(s => s.type === 'performance').length;
    const asyncCount = suggestions.filter(s => s.type === 'async').length;
    const idiomCount = suggestions.filter(s => s.type === 'idiom').length;
    
    console.log(`   ✅ Found ${suggestions.length} improvements:`);
    console.log(`      - Performance: ${perfCount}`);
    console.log(`      - Async: ${asyncCount}`);
    console.log(`      - Idioms: ${idiomCount}`);
  } catch (e) { console.log('   ❌ Refactoring failed:', e.message); }

  // ----------------------------------------------------------
  // 2. LIVE API TRAFFIC MONITORING & RATE LIMIT DETECTION
  // ----------------------------------------------------------
  console.log('\n2️⃣ Monitoring Real API Traffic (GitHub)...');
  
  const endpoints = ['/users/octocat', '/repos/x2ydevs/x2y-sdk', '/rate_limit'];
  
  for (const ep of endpoints) {
    try {
      const record = await fetchLive(ep);
      sdk.recordAPITraffic(record);
      
      const remaining = record.headers['x-ratelimit-remaining'];
      console.log(`   📥 ${ep}: ${record.responseTime}ms | Status: ${record.statusCode} | Remaining: ${remaining}`);
    } catch (e) { console.log(`   ❌ Failed to fetch ${ep}`); }
  }

  // ----------------------------------------------------------
  // 3. PREDICTIVE ISSUE ANALYSIS
  // ----------------------------------------------------------
  console.log('\n3️⃣ Running Predictive Issue Analysis on Live Data...');
  
  for (const ep of endpoints) {
    const prediction = await sdk.predictAPIIssues(ep);
    console.log(`   🔮 ${ep}:`);
    console.log(`      Risk: ${prediction.riskLevel.toUpperCase()}`);
    console.log(`      Rate Limit Warning: ${prediction.rateLimitApproaching ? '⚠️ YES' : '✓ NO'}`);
    console.log(`      Confidence: ${prediction.confidence}%`);
    if (prediction.suggestedAlternatives.length > 0) {
      console.log(`      Fallbacks: ${prediction.suggestedAlternatives.join(', ')}`);
    }
  }

  console.log('\n🏁 LIVE PRODUCTION TEST COMPLETE');
})();
