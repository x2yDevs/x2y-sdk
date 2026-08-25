const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log('🚀 X2Y SDK — ULTIMATE CAPABILITY STRESS TEST\n');

// 1. Initialize with ALL rules enabled
const sdk = new X2YSdk(
  { rateLimitThreshold: 50, predictionWindow: 10000 },
  { targetLanguage: 'typescript', rules: ['performance', 'idiom', 'async'] }
);

// 2. Define Complex Scenarios
const scenarios = {
  '/legacy-monolith': { failureRate: 0.6, minTime: 2000, maxTime: 5000, count: 2000 },
  '/modern-microservice': { failureRate: 0.01, minTime: 50, maxTime: 150, count: 2000 },
  '/throttled-gateway': { failureRate: 0.3, minTime: 100, maxTime: 800, count: 2000, is429: true }
};

console.log('1️⃣ Simulating 6,000 requests across 3 distinct architectures...\n');

// 3. Heavy Load Simulation
for (const [ep, config] of Object.entries(scenarios)) {
  for (let i = 0; i < config.count; i++) {
    const isFail = Math.random() < config.failureRate;
    const status = isFail ? (config.is429 ? 429 : 503) : 200;
    const time = Math.floor(Math.random() * (config.maxTime - config.minTime) + config.minTime);
    
    sdk.recordAPITraffic({
      endpoint: ep, method: 'POST', timestamp: Date.now(),
      responseTime: time, statusCode: status,
      headers: { 'x-ratelimit-remaining': String(Math.max(0, 100 - i/20)) }
    });
  }
}

// 4. Dynamic Confidence & Root Cause Check
(async () => {
  console.log('2️⃣ Analyzing Predictions & Dynamic Confidence:\n');
  for (const ep of Object.keys(scenarios)) {
    const pred = await sdk.predictAPIIssues(ep);
    console.log(`${ep.padEnd(25)} | Risk: ${pred.riskLevel.toUpperCase().padEnd(6)} | Confidence: ${pred.confidence}%`);
  }

  // 5. The "Nightmare" Code Refactor Challenge
  console.log('\n3️⃣ Refactoring "Nightmare" Legacy TypeScript Code:\n');
  
  const nightmareCode = `
    function processBatch(ids: string[]) {
      var results = [];
      return fetch('/api/batch')
        .then(function(res) { return res.json(); })
        .then(function(data) {
          for (var i = 0; i < data.length; i++) {
            if (data[i].id == ids[i]) {
              results.push(data[i]);
            }
          }
          return fetch('/api/save')
            .then(function(s) { return s.json(); })
            .catch(function(e) { console.error(e); });
        });
    }
  `;

  const suggestions = await sdk.refactorCode(nightmareCode);
  
  console.log(`✅ Found ${suggestions.length} critical improvements:`);
  suggestions.forEach((s, i) => {
    console.log(`   ${i+1}. [${s.type.toUpperCase()}] ${s.description} (Severity: ${s.severity})`);
  });

  // 6. Self-Analysis of this very script
  console.log('\n4️⃣ Running Self-Analysis on ultimate-test.js:\n');
  const selfCheck = await sdk.refactorFile('./ultimate-test.js');
  console.log(`📁 Script contains ${selfCheck.length} potential optimizations.`);

  console.log('\n🏁 ULTIMATE STRESS TEST COMPLETE!');
})();
