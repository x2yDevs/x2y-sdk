const { X2YSdk } = require('x2y-dev-tools-sdk');

const sdk = new X2YSdk({}, {
  targetLanguage: 'javascript',
  rules: ['performance', 'idiom', 'async']
});

async function testComplexRefactor() {
  console.log('🚀 Testing Complex Async & Performance Refactoring...\n');

  // A complex legacy function with nested promises and performance issues
  const legacyCode = `
    function processUserData(userId) {
      return fetch('/api/users/' + userId)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          var items = [];
          for (var i = 0; i < data.posts.length; i++) {
            var post = data.posts[i];
            if (post.active == true) {
              items.push(post);
            }
          }
          return fetch('/api/stats')
            .then(function(res) { return res.json(); })
            .then(function(stats) {
              console.log('Processing ' + items.length + ' items');
              return { user: data.name, posts: items, stats: stats };
            });
        })
        .catch(function(err) {
          console.error('Something went wrong: ' + err);
        });
    }
  `;

  console.log('Original Legacy Code:');
  console.log(legacyCode);
  console.log('\n--- Analyzing ---\n');

  try {
    const suggestions = await sdk.refactorCode(legacyCode);
    
    if (suggestions && suggestions.length > 0) {
      console.log(`✅ Found ${suggestions.length} improvements:\n`);
      suggestions.forEach((s, index) => {
        console.log(`${index + 1}. [${s.type.toUpperCase()}] ${s.description}`);
        console.log(`   Line: ${s.line} | Severity: ${s.severity}`);
        console.log(`   Suggestion: ${s.suggestedCode.substring(0, 100)}...`);
        console.log('');
      });
    } else {
      console.log('No suggestions found.');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testComplexRefactor().catch(console.error);
