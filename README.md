# x2y SDK

Advanced API monitoring and code refactoring SDK by x2y dev tools.

## Installation

```bash
npm install @x2ydevs/x2y-sdkimport { X2YSdk } from '@x2ydevs/x2y-sdk';

const sdk = new X2YSdk();

// Record API traffic
sdk.recordAPITraffic({
  endpoint: '/api/users',
  method: 'GET',
  timestamp: Date.now(),
  responseTime: 200,
  statusCode: 200,
  headers: {
    'x-ratelimit-limit': '100',
    'x-ratelimit-remaining': '85'
  }
});

// Predict issues before they happen
const prediction = await sdk.predictAPIIssues('/api/users');
console.log(prediction);
/*
Output:
{
  endpoint: '/api/users',
  riskLevel: 'medium',
  predictedFailure: false,
  rateLimitApproaching: true,
  suggestedAlternatives: ['/api/v2/users', '/api/users?cached=true'],
  confidence: 85
}
*/// Refactor code directly
const suggestions = await sdk.refactorCode(`
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
`);
console.log(suggestions);

// Refactor entire files
const fileSuggestions = await sdk.refactorFile('./src/example.js');const sdk = new X2YSdk(
  {
    // API monitoring config
    rateLimitThreshold: 80, // Percentage of rate limit before warning
    predictionWindow: 60000, // Time window in ms for analysis (1 minute)
    apiUrl: 'https://api.example.com'
  },
  {
    // Refactoring config
    targetLanguage: 'typescript',
    rules: ['performance', 'idiom', 'async']
  }
);
