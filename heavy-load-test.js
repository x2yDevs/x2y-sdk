const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log('🔥 X2Y SDK — ROOT-CAUSE DIFFERENTIATION CHALLENGE\n');

const sdk = new X2YSdk(
  {
    rateLimitThreshold: 50,
    predictionWindow: 10000,
    apiUrl: 'https://api.heavy-system.com'
  },
  {
    targetLanguage: 'typescript',
    rules: ['performance', 'idiom', 'async']
  }
);

const scenarios = {
  '/latency-problem': {
    requests: 1200,
    failureRate: 0.01,
    minTime: 2500,
    maxTime: 6000,
    statusCodes: [200, 200, 200, 200, 503],
    rateLimit: 90
  },

  '/server-failure': {
    requests: 1200,
    failureRate: 0.65,
    minTime: 100,
    maxTime: 500,
    statusCodes: [500, 502, 503],
    rateLimit: 90
  },

  '/rate-limit-problem': {
    requests: 1200,
    failureRate: 0.35,
    minTime: 100,
    maxTime: 600,
    statusCodes: [429, 429, 429, 200],
    rateLimit: 2
  },

  '/intermittent': {
    requests: 1200,
    failureRate: 0.20,
    minTime: 100,
    maxTime: 2500,
    statusCodes: [500, 503, 200, 200, 200],
    rateLimit: 70
  },

  '/traffic-spike': {
    requests: 1200,
    failureRate: 0.05,
    minTime: 50,
    maxTime: 300,
    statusCodes: [200, 200, 200, 503],
    rateLimit: 20
  },

  '/healthy-control': {
    requests: 1200,
    failureRate: 0.005,
    minTime: 20,
    maxTime: 100,
    statusCodes: [200],
    rateLimit: 95
  }
};

function random(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

const results = {};

(async () => {
  console.log('1️⃣ Generating distinct failure signatures...\n');

  for (const [endpoint, config] of Object.entries(scenarios)) {
    let failures = 0;
    let totalLatency = 0;
    const codes = {};

    for (let i = 0; i < config.requests; i++) {
      const failed =
        Math.random() < config.failureRate;

      let statusCode = 200;

      if (failed) {
        statusCode =
          config.statusCodes[
            random(
              0,
              config.statusCodes.length - 1
            )
          ];
      }

      const responseTime =
        random(
          config.minTime,
          config.maxTime
        );

      sdk.recordAPITraffic({
        endpoint,
        method: 'POST',
        timestamp: Date.now() + i,
        responseTime,
        statusCode,
        headers: {
          'x-ratelimit-remaining':
            String(config.rateLimit)
        }
      });

      totalLatency += responseTime;

      codes[statusCode] =
        (codes[statusCode] || 0) + 1;

      if (statusCode !== 200) {
        failures++;
      }
    }

    const failureRate =
      ((failures / config.requests) * 100)
        .toFixed(1);

    const averageLatency =
      (totalLatency / config.requests)
        .toFixed(0);

    console.log(
      `${endpoint}`
    );

    console.log(
      `   Failure rate: ${failureRate}%`
    );

    console.log(
      `   Average latency: ${averageLatency}ms`
    );

    console.log(
      `   Status codes: ${JSON.stringify(codes)}`
    );

    console.log(
      `   Rate-limit remaining: ${config.rateLimit}`
    );

    try {
      const prediction =
        await sdk.predictAPIIssues(endpoint);

      results[endpoint] = prediction;

      console.log(
        `   🔮 Risk: ${
          String(prediction.riskLevel)
            .toUpperCase()
        }`
      );

      console.log(
        `   🎯 Confidence: ${
          prediction.confidence
        }%`
      );
    } catch (error) {
      console.log(
        `   ❌ Prediction failed: ${
          error.message
        }`
      );
    }

    console.log('');
  }

  console.log(
    '2️⃣ CROSS-SCENARIO COMPARISON\n'
  );

  for (const endpoint of Object.keys(results)) {
    const prediction = results[endpoint];

    console.log(
      `${endpoint.padEnd(22)} → ` +
      `${String(prediction.riskLevel).toUpperCase()} ` +
      `(${prediction.confidence}%)`
    );
  }

  console.log(
    '\n3️⃣ DIFFERENTIATION CHECK\n'
  );

  const risks =
    Object.values(results)
      .map(x => x.riskLevel);

  const confidences =
    Object.values(results)
      .map(x => x.confidence);

  const uniqueRisks =
    new Set(risks);

  const uniqueConfidence =
    new Set(confidences);

  console.log(
    `Unique risk levels: ${uniqueRisks.size}`
  );

  console.log(
    `Unique confidence values: ${uniqueConfidence.size}`
  );

  if (uniqueRisks.size >= 4) {
    console.log(
      '🔥 Excellent differentiation — X2Y is strongly separating scenarios.'
    );
  } else if (uniqueRisks.size >= 3) {
    console.log(
      '✅ Good differentiation — X2Y is detecting several distinct risk classes.'
    );
  } else {
    console.log(
      '⚠️ Limited differentiation — investigate predictAPIIssues().'
    );
  }

  if (uniqueConfidence.size === 1) {
    console.log(
      '⚠️ Confidence is identical across all scenarios.'
    );
    console.log(
      '   This may indicate a fixed/default confidence value.'
    );
  } else {
    console.log(
      '✅ Confidence varies between scenarios.'
    );
  }

  console.log(
    '\n🏁 ROOT-CAUSE DIFFERENTIATION CHALLENGE COMPLETE!'
  );
})();
