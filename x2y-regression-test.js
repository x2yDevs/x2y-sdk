const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║        🔥 X2Y SDK — FULL REGRESSION TEST SUITE             ║
║        Testing previously weak / unverified capabilities     ║
╚══════════════════════════════════════════════════════════════╝
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


// ============================================================
// SECTION 1
// ASYNC MODERNIZATION
// ============================================================

const asyncChallenge = `

async function placeholder() {
  console.log('test');
}

// Simple Promise chain
function getUser(id) {
  return fetch('/api/users/' + id)
    .then(function(response) {
      return response.json();
    })
    .then(function(user) {
      return user;
    });
}

// Promise chain with catch
function loadProfile(id) {
  return fetch('/api/profile/' + id)
    .then(function(response) {
      return response.json();
    })
    .then(function(profile) {
      return processProfile(profile);
    })
    .catch(function(error) {
      console.error(error);
      throw error;
    });
}

// Nested Promise chains
function loadDashboard(id) {
  return fetch('/api/users/' + id)
    .then(function(response) {
      return response.json();
    })
    .then(function(user) {

      return fetch('/api/orders/' + user.id)
        .then(function(response) {
          return response.json();
        })
        .then(function(orders) {

          return fetch('/api/payments/' + user.id)
            .then(function(response) {
              return response.json();
            })
            .then(function(payments) {

              return {
                user: user,
                orders: orders,
                payments: payments
              };

            });
        });
    });
}

// Sequential requests
function loadEverything() {

  return fetch('/api/users')
    .then(function(response) {
      return response.json();
    })
    .then(function(users) {

      return fetch('/api/products')
        .then(function(response) {
          return response.json();
        })
        .then(function(products) {

          return fetch('/api/orders')
            .then(function(response) {
              return response.json();
            })
            .then(function(orders) {

              return {
                users: users,
                products: products,
                orders: orders
              };

            });
        });
    });
}

// Promise.all
function loadParallel() {

  return Promise.all([
    fetch('/api/users'),
    fetch('/api/products'),
    fetch('/api/orders')
  ])
  .then(function(responses) {

    return Promise.all(
      responses.map(function(response) {
        return response.json();
      })
    );

  })
  .then(function(data) {

    return {
      users: data[0],
      products: data[1],
      orders: data[2]
    };

  });
}

`;


// ============================================================
// SECTION 2
// PERFORMANCE OPTIMIZATION
// ============================================================

const performanceChallenge = `

function renderUsers(users) {

  var results = [];

  for (var i = 0; i < users.length; i++) {

    var user = users[i];

    // DOM query inside loop
    var cards =
      document.querySelectorAll('.user-card');

    // Repeated DOM query inside inner loop
    for (var j = 0; j < cards.length; j++) {

      var status =
        document.querySelector('#status');

      if (status.textContent === 'active') {
        cards[j].classList.add('active');
      }

      document
        .querySelector('#counter')
        .textContent = i;
    }

    // Repeated allocations
    var item = {
      id: user.id,
      name: user.name,
      created: new Date().toISOString(),
      metadata: {
        active: true,
        source: 'system'
      }
    };

    results.push(item);
  }

  return results;
}

`;


// ============================================================
// SECTION 3
// IDIOM TEST
// ============================================================

const idiomChallenge = `

function process(items) {

  var results = [];

  for (var i = 0; i < items.length; i++) {

    var item = items[i];

    var value = item.value;

    results.push(value);
  }

  return results;
}

`;


// ============================================================
// SECTION 4
// MIXED CODE
// PERFORMANCE + IDIOM + ASYNC
// ============================================================

const mixedChallenge = `

function processUsers(users) {

  var results = [];

  for (var i = 0; i < users.length; i++) {

    var user = users[i];

    var element =
      document.querySelector('.user-' + user.id);

    if (element) {
      element.textContent = user.name;
    }

    results.push({
      id: user.id,
      name: user.name
    });
  }

  return fetch('/api/save')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {

      return fetch('/api/audit')
        .then(function(response) {
          return response.json();
        })
        .then(function(audit) {

          return {
            data: data,
            audit: audit
          };

        });
    });
}

`;


// ============================================================
// HELPER
// ============================================================

function printSuggestions(title, suggestions) {

  console.log(`\n${title}`);
  console.log('='.repeat(70));

  console.log(
    `Total suggestions: ${suggestions.length}`
  );

  if (!suggestions.length) {
    console.log('⚠️ No suggestions returned.');
    return;
  }

  const categories = {};

  suggestions.forEach((s, index) => {

    const type =
      String(s.type || 'unknown').toLowerCase();

    categories[type] =
      (categories[type] || 0) + 1;

    console.log(`
──── Suggestion ${index + 1} ────
Type: ${s.type}
Description: ${s.description}
Severity: ${s.severity}
Line: ${s.line}
Original: ${s.originalCode}
Suggested: ${s.suggestedCode}
`);
  });

  console.log('Categories:', categories);
}


// ============================================================
// MAIN
// ============================================================

(async () => {

  // ----------------------------------------------------------
  // TEST 1 — ASYNC
  // ----------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 1️⃣ ASYNC PATTERN IMPROVEMENTS                              ║
╚══════════════════════════════════════════════════════════════╝
`);

  try {

    const asyncResults =
      await sdk.refactorCode(asyncChallenge);

    printSuggestions(
      '🔵 ASYNC ANALYSIS',
      asyncResults
    );

    const asyncCount =
      asyncResults.filter(
        s =>
          String(s.type || '')
            .toLowerCase() === 'async'
      ).length;

    console.log(
      `\n🔵 Async suggestions: ${asyncCount}`
    );

    if (asyncCount > 0) {
      console.log(
        '✅ ASYNC CAPABILITY DETECTED'
      );
    } else {
      console.log(
        '❌ NO ASYNC CAPABILITY DETECTED'
      );
    }

  } catch (e) {

    console.error(
      '❌ Async test failed:',
      e.message
    );
  }


  // ----------------------------------------------------------
  // TEST 2 — PERFORMANCE
  // ----------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 2️⃣ PERFORMANCE OPTIMIZATION                               ║
╚══════════════════════════════════════════════════════════════╝
`);

  try {

    const performanceResults =
      await sdk.refactorCode(
        performanceChallenge
      );

    printSuggestions(
      '⚡ PERFORMANCE ANALYSIS',
      performanceResults
    );

    const performanceCount =
      performanceResults.filter(
        s =>
          String(s.type || '')
            .toLowerCase() === 'performance'
      ).length;

    console.log(
      `\n⚡ Performance suggestions: ${performanceCount}`
    );

    if (performanceCount > 0) {
      console.log(
        '✅ PERFORMANCE CAPABILITY DETECTED'
      );
    } else {
      console.log(
        '❌ PERFORMANCE CAPABILITY NOT DETECTED'
      );
    }

  } catch (e) {

    console.error(
      '❌ Performance test failed:',
      e.message
    );
  }


  // ----------------------------------------------------------
  // TEST 3 — IDIOM
  // ----------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 3️⃣ CODE IDIOM REFACTORING                                  ║
╚══════════════════════════════════════════════════════════════╝
`);

  try {

    const idiomResults =
      await sdk.refactorCode(
        idiomChallenge
      );

    printSuggestions(
      '🛠️ IDIOM ANALYSIS',
      idiomResults
    );

    const idiomCount =
      idiomResults.filter(
        s =>
          String(s.type || '')
            .toLowerCase() === 'idiom'
      ).length;

    console.log(
      `\n🛠️ Idiom suggestions: ${idiomCount}`
    );

  } catch (e) {

    console.error(
      '❌ Idiom test failed:',
      e.message
    );
  }


  // ----------------------------------------------------------
  // TEST 4 — MIXED
  // ----------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 4️⃣ MIXED REFACTORING CHALLENGE                            ║
╚══════════════════════════════════════════════════════════════╝
`);

  try {

    const mixedResults =
      await sdk.refactorCode(
        mixedChallenge
      );

    printSuggestions(
      '🔥 MIXED ANALYSIS',
      mixedResults
    );

  } catch (e) {

    console.error(
      '❌ Mixed test failed:',
      e.message
    );
  }


  // ----------------------------------------------------------
  // TEST 5 — FILE REFACTORING
  // ----------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 5️⃣ FILE-LEVEL REFACTORING                                  ║
╚══════════════════════════════════════════════════════════════╝
`);

  try {

    const fileResults =
      await sdk.refactorFile(
        './x2y-regression-test.js'
      );

    printSuggestions(
      '📁 FILE ANALYSIS',
      fileResults
    );

    const fileAsync =
      fileResults.filter(
        s =>
          String(s.type || '')
            .toLowerCase() === 'async'
      ).length;

    const filePerformance =
      fileResults.filter(
        s =>
          String(s.type || '')
            .toLowerCase() === 'performance'
      ).length;

    const fileIdiom =
      fileResults.filter(
        s =>
          String(s.type || '')
            .toLowerCase() === 'idiom'
      ).length;

    console.log(`
📊 FILE CAPABILITY BREAKDOWN

Async:        ${fileAsync}
Performance:  ${filePerformance}
Idiom:        ${fileIdiom}
`);

  } catch (e) {

    console.error(
      '❌ File test failed:',
      e.message
    );
  }


  // ==========================================================
  // API PREDICTION REGRESSION
  // ==========================================================

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 6️⃣ API PREDICTION REGRESSION                               ║
╚══════════════════════════════════════════════════════════════╝
`);

  const scenarios = [

    {
      name: 'HEALTHY',
      endpoint: '/test-healthy',
      failureRate: 0.01,
      latency: 60,
      remaining: 95,
      failureCode: 503
    },

    {
      name: 'LATENCY',
      endpoint: '/test-latency',
      failureRate: 0.01,
      latency: 4500,
      remaining: 95,
      failureCode: 503
    },

    {
      name: 'SERVER FAILURE',
      endpoint: '/test-server-failure',
      failureRate: 0.70,
      latency: 300,
      remaining: 90,
      failureCode: 503
    },

    {
      name: 'RATE LIMITED',
      endpoint: '/test-rate-limit',
      failureRate: 0.40,
      latency: 300,
      remaining: 2,
      failureCode: 429
    },

    {
      name: 'CRITICAL',
      endpoint: '/test-critical',
      failureRate: 0.90,
      latency: 5000,
      remaining: 0,
      failureCode: 503
    }

  ];


  for (const scenario of scenarios) {

    console.log(`
──────────────────────────────────────────────────────────────
${scenario.name}
Endpoint: ${scenario.endpoint}
──────────────────────────────────────────────────────────────
`);

    for (let i = 0; i < 1000; i++) {

      const failed =
        Math.random() <
        scenario.failureRate;

      sdk.recordAPITraffic({

        endpoint: scenario.endpoint,

        method: 'GET',

        timestamp:
          Date.now() + i,

        responseTime:
          scenario.latency +
          Math.floor(Math.random() * 50),

        statusCode:
          failed
            ? scenario.failureCode
            : 200,

        headers: {

          'x-ratelimit-limit':
            '100',

          'x-ratelimit-remaining':
            String(
              scenario.remaining
            )

        }

      });

    }

    try {

      const prediction =
        await sdk.predictAPIIssues(
          scenario.endpoint
        );

      console.log(
        '🧠 Prediction:'
      );

      console.log(
        JSON.stringify(
          prediction,
          null,
          2
        )
      );

    } catch (e) {

      console.error(
        '❌ Prediction failed:',
        e.message
      );
    }

  }


  // ==========================================================
  // FINAL
  // ==========================================================

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🏁 TEST COMPLETE                         ║
╚══════════════════════════════════════════════════════════════╝

Review especially:

🔵 Async
   → Does X2Y now detect .then() chains?

⚡ Performance
   → Does it detect DOM queries inside loops?

🛠️ Idiom
   → Does it detect var → let/const?

🔮 Prediction
   → Does risk differentiate between scenarios?

🚦 Rate limiting
   → Does it detect remaining-limit pressure?

⏱️ Latency
   → Does extremely high latency affect risk?

🎯 Confidence
   → Is confidence still always the same?

`);
})();
