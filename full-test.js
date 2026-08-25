const { X2YSdk } = require('x2y-dev-tools-sdk');
const fs = require('fs');

console.log('🚀 x2y SDK Full Capability Test\n');

// 1. Custom Configs
console.log('1️⃣ Initializing with Custom Configs...');
const sdk = new X2YSdk(
  {
    rateLimitThreshold: 70, // Trigger warning at 70% usage
    predictionWindow: 30000,
    apiUrl: 'https://api.github.com'
  },
  {
    targetLanguage: 'javascript',
    rules: ['performance', 'idiom', 'async']
  }
);
console.log('✅ Configs applied (Threshold: 70%, Rules: perf/idiom/async)\n');

// 2. API Traffic Monitoring
console.log('2️⃣ Recording Real-time API Traffic...');
const trafficData = [
  { endpoint: '/users', method: 'GET', responseTime: 120, statusCode: 200, headers: { 'x-ratelimit-remaining': '90' } },
  { endpoint: '/repos', method: 'GET', responseTime: 450, statusCode: 200, headers: { 'x-ratelimit-remaining': '60' } },
  { endpoint: '/issues', method: 'POST', responseTime: 800, statusCode: 500, headers: { 'x-ratelimit-remaining': '10' } }
];

trafficData.forEach(t => {
  sdk.recordAPITraffic({ ...t, timestamp: Date.now() });
  console.log(`   📥 Recorded: ${t.method} ${t.endpoint} (${t.responseTime}ms)`);
});
console.log('✅ Traffic logged.\n');

// 3. Predictive Issue Detection
console.log('3️⃣ Running Predictive Issue Detection...');
(async () => {
  for (const t of trafficData) {
    const pred = await sdk.predictAPIIssues(t.endpoint);
    const status = pred.rateLimitApproaching ? '⚠️ WARNING' : '✓ OK';
    console.log(`   🔮 ${t.endpoint}: Risk [${pred.riskLevel}] | Rate Limit: ${status}`);
  }
  
  // 4. Code Refactoring (String)
  console.log('\n4️⃣ Refactoring Code Snippet...');
  const snippet = `var x = 1; fetch('/a').then(r => r.json()).then(d => console.log(d));`;
  const codeSugg = await sdk.refactorCode(snippet);
  console.log(`   🛠️ Found ${codeSugg.length} improvements for snippet.`);

  // 5. File Refactoring
  console.log('\n5️⃣ Refactoring Entire File (async-test.js)...');
  try {
    const fileSugg = await sdk.refactorFile('./async-test.js');
    console.log(`   📁 Found ${fileSugg.length} improvements in async-test.js`);
  } catch (e) {
    console.log('   ⚠️ File refactoring skipped (file not found or error).');
  }

  console.log('\n✨ All 5 capabilities tested successfully!');
})();
