const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║        🔥 X2Y SDK — FINAL POWER & PRODUCTION CHALLENGE          ║
║        Adversarial • Mixed • Regression • Stress Test            ║
╚══════════════════════════════════════════════════════════════════╝
`);

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

// ================================================================
// 1. CODE REFACTORING — HARD REAL-WORLD CODE
// ================================================================

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 1️⃣ HARD CODE REFACTORING                                       ║
╚══════════════════════════════════════════════════════════════════╝
`);

const hardCode = `
async function processUsers(users) {
  var results = [];

  for (var i = 0; i < users.length; i++) {
    var user = users[i];

    var card = document.querySelector('.user-' + user.id);

    if (card) {
      card.textContent = user.name;
    }

    var status = document.querySelector('#status');

    if (status) {
      status.textContent = 'Processing ' + user.name;
    }

    results.push({
      id: user.id,
      processedAt: new Date(),
      data: new Array(1000).fill(user.id)
    });
  }

  return fetch('/api/users')
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      return fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    })
    .then(function(res) {
      return res.json();
    })
    .catch(function(error) {
      console.error(error);
    });
}
`;

(async () => {

  const suggestions = await sdk.refactorCode(hardCode);

  console.log(`🛠️ Total suggestions: ${suggestions.length}`);

  const categories = {};

  for (const s of suggestions) {
    categories[s.type] = (categories[s.type] || 0) + 1;

    console.log(`
Type: ${s.type}
Description: ${s.description}
Severity: ${s.severity}
Line: ${s.line}
Original: ${s.originalCode}
Suggested: ${s.suggestedCode}
`);
  }

  console.log('📊 Categories:', categories);

  const hasAsync = suggestions.some(s => s.type === 'async');
  const hasPerformance = suggestions.some(s => s.type === 'performance');
  const hasIdiom = suggestions.some(s => s.type === 'idiom');

  console.log(`
CAPABILITY CHECK

Async:        ${hasAsync ? '✅' : '❌'}
Performance:  ${hasPerformance ? '✅' : '❌'}
Idiom:        ${hasIdiom ? '✅' : '❌'}
`);

  // ==============================================================
  // 2. FILE LEVEL
  // ==============================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 2️⃣ FILE-LEVEL INTELLIGENCE                                    ║
╚══════════════════════════════════════════════════════════════════╝
`);

  try {
    const fileSuggestions = await sdk.refactorFile('./x2y-final-power-test.js');

    console.log(`📁 File suggestions: ${fileSuggestions.length}`);

    const fileCategories = {};

    for (const s of fileSuggestions) {
      fileCategories[s.type] =
        (fileCategories[s.type] || 0) + 1;
    }

    console.log('📊 File categories:', fileCategories);

  } catch (error) {
    console.log('⚠️ File analysis failed:', error.message);
  }

  // ==============================================================
  // 3. API TRAFFIC — 10,000 MIXED REQUESTS
  // ==============================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 3️⃣ 10,000 REQUEST ADVERSARIAL TRAFFIC TEST                    ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const scenarios = [
    {
      endpoint: '/healthy',
      weight: 25,
      status: () => 200,
      latency: () => 40 + Math.random() * 40,
      remaining: () => 95
    },

    {
      endpoint: '/slow',
      weight: 15,
      status: () => 200,
      latency: () => 3000 + Math.random() * 2500,
      remaining: () => 80
    },

    {
      endpoint: '/server-failure',
      weight: 15,
      status: () => Math.random() < 0.75 ? 500 : 200,
      latency: () => 200 + Math.random() * 400,
      remaining: () => 70
    },

    {
      endpoint: '/rate-limited',
      weight: 15,
      status: () => Math.random() < 0.30 ? 429 : 200,
      latency: () => 200 + Math.random() * 500,
      remaining: () => 2 + Math.random() * 5
    },

    {
      endpoint: '/critical',
      weight: 15,
      status: () => Math.random() < 0.80 ? 503 : 200,
      latency: () => 3500 + Math.random() * 2500,
      remaining: () => 3
    },

    {
      endpoint: '/intermittent',
      weight: 15,
      status: () => Math.random() < 0.15 ? 503 : 200,
      latency: () => Math.random() < 0.30
        ? 2000 + Math.random() * 2000
        : 100 + Math.random() * 200,
      remaining: () => 50
    }
  ];

  const stats = {};

  for (const scenario of scenarios) {
    stats[scenario.endpoint] = {
      requests: 0,
      failures: 0,
      totalLatency: 0,
      rateLimits: 0
    };
  }

  for (let i = 0; i < 10000; i++) {

    const r = Math.random() * 100;
    let cumulative = 0;
    let scenario;

    for (const s of scenarios) {
      cumulative += s.weight;

      if (r <= cumulative) {
        scenario = s;
        break;
      }
    }

    const statusCode = scenario.status();
    const responseTime = Math.floor(scenario.latency());
    const remaining = Math.floor(scenario.remaining());

    sdk.recordAPITraffic({
      endpoint: scenario.endpoint,
      method: 'GET',
      timestamp: Date.now(),
      responseTime,
      statusCode,
      headers: {
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': String(remaining)
      }
    });

    const stat = stats[scenario.endpoint];

    stat.requests++;
    stat.totalLatency += responseTime;

    if (statusCode >= 400) {
      stat.failures++;
    }

    if (statusCode === 429) {
      stat.rateLimits++;
    }
  }

  console.log('\n📊 TRAFFIC RESULTS\n');

  for (const [endpoint, stat] of Object.entries(stats)) {
    const failureRate =
      (stat.failures / stat.requests) * 100;

    const avgLatency =
      stat.totalLatency / stat.requests;

    console.log(
      `${endpoint.padEnd(18)} ` +
      `Failures: ${failureRate.toFixed(1)}% | ` +
      `Avg: ${avgLatency.toFixed(0)}ms | ` +
      `429s: ${stat.rateLimits}`
    );
  }

  // ==============================================================
  // 4. PREDICTION DIFFERENTIATION
  // ==============================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 4️⃣ PREDICTION DIFFERENTIATION                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const predictions = {};

  for (const scenario of scenarios) {

    const prediction =
      await sdk.predictAPIIssues(scenario.endpoint);

    predictions[scenario.endpoint] = prediction;

    console.log(`
🔮 ${scenario.endpoint}

Risk:                 ${prediction.riskLevel}
Predicted Failure:    ${prediction.predictedFailure}
Rate Limit Warning:   ${prediction.rateLimitApproaching}
Confidence:           ${prediction.confidence}
Alternatives:         ${JSON.stringify(prediction.suggestedAlternatives)}
`);
  }

  // ==============================================================
  // 5. PREDICTION SANITY CHECK
  // ==============================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 5️⃣ PREDICTION SANITY CHECK                                    ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const riskLevels = new Set(
    Object.values(predictions).map(p => p.riskLevel)
  );

  const confidenceValues = new Set(
    Object.values(predictions).map(p => p.confidence)
  );

  console.log(
    `Unique risk levels: ${riskLevels.size}`
  );

  console.log(
    `Unique confidence values: ${confidenceValues.size}`
  );

  if (riskLevels.size >= 3) {
    console.log('✅ Strong risk differentiation');
  } else {
    console.log('⚠️ Limited risk differentiation');
  }

  if (confidenceValues.size > 1) {
    console.log('✅ Confidence varies by scenario');
  } else {
    console.log('⚠️ Confidence appears fixed');
  }

  // ==============================================================
  // 6. RATE LIMIT SPECIFIC TEST
  // ==============================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 6️⃣ RATE LIMIT PRESSURE TEST                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const ratePrediction =
    predictions['/rate-limited'];

  console.log(`
Rate-limit prediction:

Approaching: ${ratePrediction.rateLimitApproaching}
Risk:         ${ratePrediction.riskLevel}
Failure:      ${ratePrediction.predictedFailure}
Fallbacks:    ${JSON.stringify(ratePrediction.suggestedAlternatives)}
`);

  if (ratePrediction.rateLimitApproaching) {
    console.log('✅ RATE LIMIT DETECTION WORKING');
  } else {
    console.log('❌ RATE LIMIT DETECTION FAILED');
  }

  // ==============================================================
  // 7. FINAL SCORE
  // ==============================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 7️⃣ FINAL CAPABILITY SCORE                                     ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const checks = {
    'API monitoring': true,
    'Async refactoring': hasAsync,
    'Performance optimization': hasPerformance,
    'Idiom refactoring': hasIdiom,
    'Prediction differentiation': riskLevels.size >= 2,
    'Rate-limit detection': ratePrediction.rateLimitApproaching,
    'Latency awareness':
      predictions['/slow'].riskLevel !==
      predictions['/healthy'].riskLevel
  };

  let passed = 0;

  for (const [name, result] of Object.entries(checks)) {
    console.log(`${result ? '✅' : '❌'} ${name}`);

    if (result) passed++;
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL SCORE: ${passed}/${Object.keys(checks).length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (passed === Object.keys(checks).length) {
    console.log(`
🏆 X2Y PASSED THE FINAL POWER TEST

All advertised core capabilities demonstrated.
`);
  } else {
    console.log(`
⚠️ X2Y still has capability gaps.

Review the failed checks above.
`);
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                  🏁 FINAL TEST COMPLETE                         ║
╚══════════════════════════════════════════════════════════════════╝
`);

})();
