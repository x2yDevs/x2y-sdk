const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log('⚡ Testing Async Pattern Improvements...\n');

const sdk = new X2YSdk({}, {
  targetLanguage: 'javascript',
  rules: ['async']
});

// A complex, nested promise chain with error handling and multiple fetches
const legacyPromiseChain = `
function getUserProfile(userId) {
  return fetch('/api/users/' + userId)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json();
    })
    .then(function(user) {
      return fetch('/api/posts?author=' + user.id)
        .then(function(postResponse) {
          return postResponse.json();
        })
        .then(function(posts) {
          return {
            name: user.name,
            email: user.email,
            recentPosts: posts.slice(0, 5)
          };
        });
    })
    .catch(function(error) {
      console.error('Failed to load profile:', error);
      return null;
    });
}
`;

console.log('📜 Original Legacy Code:');
console.log(legacyPromiseChain);
console.log('\n--- 🛠️ Analyzing & Refactoring ---\n');

(async () => {
  try {
    const suggestions = await sdk.refactorCode(legacyPromiseChain);
    
    console.log(`✅ Found ${suggestions.length} improvements:\n`);
    
    suggestions.forEach((s, index) => {
      console.log(`${index + 1}. [${s.type.toUpperCase()}] ${s.description}`);
      console.log(`   Severity: ${s.severity}`);
      console.log(`   Suggested Rewrite:`);
      console.log(s.suggestedCode);
      console.log('-----------------------------------');
    });

  } catch (error) {
    console.log('❌ Error during refactoring:', error.message);
  }
})();
