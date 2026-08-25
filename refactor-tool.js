const { X2YSdk } = require('x2y-dev-tools-sdk');

const sdk = new X2YSdk({}, {
  targetLanguage: 'javascript',
  rules: ['performance', 'idiom', 'async']
});

async function refactorRealCode() {
  console.log('🛠️  Refactoring real code...\n');
  
  const unoptimizedCode = `
    function fetchData() {
      var results = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.active == true) {
          results.push(item);
        }
      }
      return results;
    }
  `;
  
  console.log('Original code:');
  console.log(unoptimizedCode);
  console.log('\n---\n');
  
  try {
    const suggestions = await sdk.refactorCode(unoptimizedCode);
    console.log('✅ Refactoring Suggestions:');
    console.log(JSON.stringify(suggestions, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
  }
}

refactorRealCode().catch(console.error);
