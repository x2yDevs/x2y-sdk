const { X2YSdk } = require('x2y-dev-tools-sdk');

const sdk = new X2YSdk({
  rateLimitThreshold: 80,
  predictionWindow: 60000,
  apiUrl: 'https://api.github.com'
});

async function monitorRealAPI() {
  console.log('🔍 Monitoring real API endpoints...\n');
  
  const endpoints = [
    { endpoint: '/users', method: 'GET', responseTime: 150, statusCode: 200 },
    { endpoint: '/repos', method: 'GET', responseTime: 300, statusCode: 200 },
    { endpoint: '/issues', method: 'POST', responseTime: 450, statusCode: 201 }
  ];
  
  endpoints.forEach(call => {
    sdk.recordAPITraffic({
      ...call,
      timestamp: Date.now(),
      headers: {
        'content-type': 'application/json'
      }
    });
    console.log(`✓ Recorded: ${call.method} ${call.endpoint} (${call.responseTime}ms)`);
  });
  
  console.log('\n📊 Analyzing patterns...');
  
  for (const call of endpoints) {
    try {
      const prediction = await sdk.predictAPIIssues(call.endpoint);
      console.log(`\n${call.endpoint}:`);
      console.log(`  Risk Level: ${prediction.riskLevel}`);
      console.log(`  Rate Limit Warning: ${prediction.rateLimitApproaching ? '⚠️ YES' : '✓ NO'}`);
    } catch (error) {
      console.log(`  ⚠️ Could not predict: ${error.message}`);
    }
  }
}

monitorRealAPI().catch(console.error);
