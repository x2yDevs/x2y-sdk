const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log('🧪 X2Y SDK — ASYNC PATTERN IMPROVEMENT CHALLENGE\n');

const sdk = new X2YSdk(
  {
    rateLimitThreshold: 80,
    predictionWindow: 60000,
    apiUrl: 'https://api.example.com'
  },
  {
    targetLanguage: 'typescript',
    rules: ['async']
  }
);

// ============================================================
// INTENTIONALLY LEGACY ASYNC CODE
// ============================================================

const asyncChallenge = `

// TEST 1: Simple Promise chain
function getUser(id) {
  return fetch('/api/users/' + id)
    .then(function(response) {
      return response.json();
    })
    .then(function(user) {
      return user;
    });
}


// TEST 2: Promise chain with error handling
function loadProfile(id) {
  return fetch('/api/profile/' + id)
    .then(function(response) {
      return response.json();
    })
    .then(function(profile) {
      return processProfile(profile);
    })
    .catch(function(error) {
      console.error('Profile error:', error);
      throw error;
    });
}


// TEST 3: Nested Promise chains
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


// TEST 4: Sequential API calls
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


// TEST 5: Promise.all mixed with .then()
function loadParallelData() {

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


// TEST 6: Multiple chained transformations
function calculateData() {

  return fetch('/api/data')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      return data.items;
    })
    .then(function(items) {
      return items.filter(function(item) {
        return item.active;
      });
    })
    .then(function(activeItems) {
      return activeItems.map(function(item) {
        return item.value * 2;
      });
    });
}

`;

// ============================================================
// TEST 1 — DIRECT CODE ANALYSIS
// ============================================================

(async () => {

  console.log('1️⃣ Running refactorCode() with ONLY async rules...\n');

  try {

    const suggestions =
      await sdk.refactorCode(asyncChallenge);

    console.log(
      `🛠️ X2Y returned ${suggestions.length} suggestions.\n`
    );

    if (suggestions.length === 0) {
      console.log('⚠️ NO SUGGESTIONS RETURNED.\n');
    }

    suggestions.forEach((suggestion, index) => {

      console.log(
        `━━━━━━━━ Suggestion ${index + 1} ━━━━━━━━`
      );

      console.log(
        `Type: ${suggestion.type}`
      );

      console.log(
        `Description: ${suggestion.description}`
      );

      console.log(
        `Severity: ${suggestion.severity}`
      );

      console.log(
        `Line: ${suggestion.line}`
      );

      console.log(
        `Original:\n${suggestion.originalCode}`
      );

      console.log(
        `Suggested:\n${suggestion.suggestedCode}`
      );

      console.log('');

    });

    // ========================================================
    // CATEGORY ANALYSIS
    // ========================================================

    const categories = {};

    for (const suggestion of suggestions) {

      const type =
        String(
          suggestion.type || 'unknown'
        ).toLowerCase();

      categories[type] =
        (categories[type] || 0) + 1;
    }

    console.log(
      '📊 Suggestion categories:\n'
    );

    console.log(categories);

    // ========================================================
    // ASYNC DETECTION
    // ========================================================

    const asyncSuggestions =
      suggestions.filter(
        suggestion =>
          String(
            suggestion.type || ''
          ).toLowerCase() === 'async'
      );

    console.log(
      `\n🔵 Async suggestions detected: ${
        asyncSuggestions.length
      }`
    );

    if (asyncSuggestions.length > 0) {

      console.log(
        '✅ X2Y detected async modernization opportunities.'
      );

    } else {

      console.log(
        '❌ X2Y did NOT return any async suggestions.'
      );

    }

  } catch (error) {

    console.error(
      '❌ refactorCode() failed:'
    );

    console.error(error);

  }

  // ============================================================
  // TEST 2 — FILE ANALYSIS
  // ============================================================

  console.log(
    '\n2️⃣ Running refactorFile()...\n'
  );

  try {

    const fileSuggestions =
      await sdk.refactorFile(
        './async-capability-test.js'
      );

    console.log(
      `📁 X2Y returned ${
        fileSuggestions.length
      } file suggestions.\n`
    );

    fileSuggestions.forEach(
      (suggestion, index) => {

        console.log(
          `━━━━━━━━ File Suggestion ${
            index + 1
          } ━━━━━━━━`
        );

        console.log(
          `Type: ${suggestion.type}`
        );

        console.log(
          `Description: ${suggestion.description}`
        );

        console.log(
          `Severity: ${suggestion.severity}`
        );

        console.log(
          `Line: ${suggestion.line}`
        );

        console.log(
          `Original:\n${suggestion.originalCode}`
        );

        console.log(
          `Suggested:\n${suggestion.suggestedCode}`
        );

        console.log('');

      }
    );

    const fileAsyncSuggestions =
      fileSuggestions.filter(
        suggestion =>
          String(
            suggestion.type || ''
          ).toLowerCase() === 'async'
      );

    console.log(
      `🔵 Async suggestions from file analysis: ${
        fileAsyncSuggestions.length
      }`
    );

  } catch (error) {

    console.error(
      '❌ refactorFile() failed:'
    );

    console.error(error);

  }

  // ============================================================
  // TEST 3 — FINAL VERDICT
  // ============================================================

  console.log(
    '\n3️⃣ ASYNC CAPABILITY VERDICT\n'
  );

  console.log(
    'The test contains:'
  );

  console.log(
    '   🔹 Simple .then() chains'
  );

  console.log(
    '   🔹 .catch() error handling'
  );

  console.log(
    '   🔹 Nested Promise chains'
  );

  console.log(
    '   🔹 Sequential fetch operations'
  );

  console.log(
    '   🔹 Promise.all()'
  );

  console.log(
    '   🔹 Multiple chained transformations'
  );

  console.log(
    '\nExpected capability:'
  );

  console.log(
    '   .then() chains → async/await'
  );

  console.log(
    '\n🏁 ASYNC PATTERN IMPROVEMENT TEST COMPLETE!'
  );

})();
