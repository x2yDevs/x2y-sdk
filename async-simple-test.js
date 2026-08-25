const { X2YSdk } = require('x2y-dev-tools-sdk');

console.log('⚡ Testing Async Detection with All Rules...\n');

const sdk = new X2YSdk({}, {
  targetLanguage: 'javascript',
  rules: ['performance', 'idiom', 'async'] // Enable all rules
});

// A simpler legacy promise chain
const simpleLegacy = `
function getData() {
  return fetch('/api/data')
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      console.log(data);
    })
    .catch(function(err) {
      console.error(err);
    });
}
`;

console.log('📜 Original Code:');
console.log(simpleLegacy);
console.log('\n--- 🛠️ Analyzing ---\n');

(async () => {
  try {
    const suggestions = await sdk.refactorCode(simpleLegacy);
    
    if (suggestions.length === 0) {
      console.log('⚠️ Still 0 improvements. The SDK may not support full async/await rewrites in v1.0.3.');
    } else {
      console.log(`✅ Found ${suggestions.length} improvements:`);
      suggestions.forEach(s => {
        console.log(`- [${s.type}] ${s.description}`);
        console.log(`  Suggestion: ${s.suggestedCode.substring(0, 150)}...`);
      });
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
})();
