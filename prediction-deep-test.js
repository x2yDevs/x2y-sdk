const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log('🔬 X2Y SDK — DEEP PREDICTION INSPECTION\n');

const sdk = new X2YSdk(
  {
    rateLimitThreshold: 80,
    predictionWindow: 60000,
    apiUrl: 'https://api.example.com'
  },
  {
    targetLanguage: 'typescript',
    rules: ['performance', 'idiom', 'async']
  }
);

const tests = [
  {
    endpoint: '/healthy',
    failureRate: 0.01,
    responseTime: 50,
    remaining: 95,
    statusCode: 200
  },
  {
    endpoint: '/slow',
    failureRate: 0.01,
    responseTime: 5000,
    remaining: 95,
    statusCode: 200
  },
  {
    endpoint: '/server-errors',
    failureRate: 0.70,
    responseTime: 300,
    remaining: 95,
    statusCode: 503
  },
  {
    endpoint: '/rate-limit',
    failureRate: 0.40,
    responseTime: 300,
    remaining: 2,
    statusCode: 429
  },
  {
    endpoint: '/critical',
    failureRate: 0.90,
    responseTime: 5000,
    remaining: 0,
    statusCode: 503
  }
];

(async () => {

  for (const test of tests) {

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Endpoint: ${test.endpoint}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    for (let i = 0; i < 1000; i++) {

      const failed =
        Math.random() < test.failureRate;

      sdk.recordAPITraffic({
        endpoint: test.endpoint,
        method: 'POST',
        timestamp: Date.now() + i,
        responseTime:
          test.responseTime +
          Math.floor(Math.random() * 50),
        statusCode:
          failed
            ? test.statusCode
            : 200,
        headers: {
          'x-ratelimit-limit': '100',
          'x-ratelimit-remaining':
            String(test.remaining)
        }
      });
    }

    try {

      const prediction =
        await sdk.predictAPIIssues(
          test.endpoint
        );

      console.log(
        '\n🧠 COMPLETE PREDICTION OBJECT:\n'
      );

      console.dir(
        prediction,
        {
          depth: null,
          colors: false
        }
      );

      console.log(
        '\n📋 JSON REPRESENTATION:\n'
      );

      console.log(
        JSON.stringify(
          prediction,
          null,
          2
        )
      );

    } catch (error) {

      console.error(
        '❌ Prediction failed:',
        error
      );
    }
  }

  console.log(
    '\n🏁 DEEP PREDICTION TEST COMPLETE'
  );

})();
