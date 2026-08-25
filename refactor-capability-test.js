const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log('🧪 X2Y SDK — REFACTORING / PERFORMANCE / ASYNC CHALLENGE\n');

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

// Deliberately problematic code.
// Each section targets a different advertised capability.

const challengeCode = `
function processUsers(users) {

  var results = [];

  // 1. IDIOM / MODERN JAVASCRIPT
  for (var i = 0; i < users.length; i++) {

    var user = users[i];

    // 2. PERFORMANCE: DOM query inside loop
    var elements = document.querySelectorAll('.user-card');

    for (var j = 0; j < elements.length; j++) {

      // 3. PERFORMANCE: repeated DOM access
      if (
        document.querySelector('#status').textContent ===
        'active'
      ) {
        elements[j].classList.add('highlight');
      }
    }

    // 4. PERFORMANCE: repeated allocation
    var userResult = {
      id: user.id,
      name: user.name,
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'system',
        processed: true
      }
    };

    results.push(userResult);
  }

  // 5. ASYNC: nested Promise chain
  return fetch('/api/users')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      return fetch('/api/users/details')
        .then(function(detailsResponse) {
          return detailsResponse.json();
        })
        .then(function(details) {
          return {
            users: data,
            details: details
          };
        });
    })
    .then(function(result) {
      return fetch('/api/users/save', {
        method: 'POST',
        body: JSON.stringify(result)
      });
    })
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      console.error('Processing failed:', error);
    });
}
`;

(async () => {

  // ==========================================================
  // TEST 1 — Direct Code Refactoring
  // ==========================================================

  console.log('1️⃣ Testing refactorCode()...\n');

  try {

    const suggestions =
      await sdk.refactorCode(challengeCode);

    console.log(
      `🛠️ X2Y returned ${suggestions.length} suggestions.\n`
    );

    suggestions.forEach((suggestion, index) => {

      console.log(`──── Suggestion ${index + 1} ────`);

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
        `Original: ${suggestion.originalCode}`
      );

      console.log(
        `Suggested: ${suggestion.suggestedCode}`
      );

      console.log('');

    });

    // Categorize results
    const types = {};

    for (const suggestion of suggestions) {

      const type =
        String(suggestion.type || 'unknown');

      types[type] =
        (types[type] || 0) + 1;
    }

    console.log('📊 Suggestion categories:');
    console.log(types);

  } catch (error) {

    console.error(
      '❌ refactorCode() failed:',
      error.message
    );
  }

  // ==========================================================
  // TEST 2 — File Refactoring
  // ==========================================================

  console.log('\n2️⃣ Testing refactorFile()...\n');

  try {

    const fileSuggestions =
      await sdk.refactorFile(
        './refactor-capability-test.js'
      );

    console.log(
      `📁 X2Y returned ${fileSuggestions.length} file suggestions.\n`
    );

    fileSuggestions.forEach(
      (suggestion, index) => {

        console.log(
          `──── File Suggestion ${index + 1} ────`
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
          `Original: ${suggestion.originalCode}`
        );

        console.log(
          `Suggested: ${suggestion.suggestedCode}`
        );

        console.log('');
      }
    );

  } catch (error) {

    console.error(
      '❌ refactorFile() failed:',
      error.message
    );
  }

  // ==========================================================
  // FINAL ASSESSMENT
  // ==========================================================

  console.log('\n3️⃣ CAPABILITY CHECK\n');

  console.log(
    'The challenge contains deliberately introduced:'
  );

  console.log(
    '   🔹 var usage / legacy idioms'
  );

  console.log(
    '   🔹 DOM queries inside loops'
  );

  console.log(
    '   🔹 repeated DOM access'
  );

  console.log(
    '   🔹 repeated object/date allocations'
  );

  console.log(
    '   🔹 nested Promise .then() chains'
  );

  console.log(
    '   🔹 multiple sequential fetch operations'
  );

  console.log('\nExpected useful categories:');

  console.log(
    '   idiom       → var → let/const'
  );

  console.log(
    '   performance → DOM/query/allocation/batching improvements'
  );

  console.log(
    '   async       → Promise chains → async/await'
  );

  console.log(
    '\n🏁 REFACTORING CAPABILITY TEST COMPLETE!'
  );

})();
