# x2y SDK Usage Guide

## API Monitoring

### Basic Setup
```typescript
import { X2YSdk } from '@x2ydevs/x2y-sdk';

const sdk = new X2YSdk({
  rateLimitThreshold: 85, // Warn when 85% of rate limit is reached
  predictionWindow: 30000 // Analyze last 30 seconds of traffic
});// Typically you'd integrate this with your HTTP client
sdk.recordAPITraffic({
  endpoint: '/api/users',
  method: 'POST',
  timestamp: Date.now(),
  responseTime: 250,
  statusCode: 201,
  headers: {
    'x-ratelimit-remaining': '45',
    'x-ratelimit-limit': '100',
    'content-type': 'application/json'
  }
});const prediction = await sdk.predictAPIIssues('/api/users');
if (prediction.riskLevel === 'high') {
  // Use alternative endpoint or implement fallback
  console.log('High risk detected:', prediction.suggestedAlternatives);
}const originalCode = `
  var result = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].active) {
      result.push(items[i].name);
    }
  }
`;

const suggestions = await sdk.refactorCode(originalCode);
console.log(suggestions);
/*
Output:
[
  {
    type: 'idiom',
    description: 'Use array methods like filter() and map() for better readability',
    originalCode: 'for (var i = 0; i < items.length; i++) { ... }',
    suggestedCode: 'const result = items.filter(item => item.active).map(item => item.name);',
    line: 2,
    severity: 'medium'
  }
]
*/const fileSuggestions = await sdk.refactorFile('./src/example.js');
console.log(`${fileSuggestions.length} suggestions found`);import axios from 'axios';
import { X2YSdk } from '@x2ydevs/x2y-sdk';

const sdk = new X2YSdk();

// Create an axios interceptor
axios.interceptors.response.use(
  (response) => {
    // Record successful requests
    sdk.recordAPITraffic({
      endpoint: response.config.url || '',
      method: response.config.method || 'GET',
      timestamp: Date.now(),
      responseTime: response.headers['x-response-time'] || 0,
      statusCode: response.status,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    // Record failed requests
    sdk.recordAPITraffic({
      endpoint: error.config.url || '',
      method: error.config.method || 'GET',
      timestamp: Date.now(),
      responseTime: 0, // Failed request
      statusCode: error.response?.status || 500,
      headers: error.response?.headers || {}
    });
    return Promise.reject(error);
  }
);const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const start = Date.now();
  const response = await originalFetch(...args);
  const duration = Date.now() - start;
  
  // Record the traffic
  sdk.recordAPITraffic({
    endpoint: args[0].toString(),
    method: 'GET', // You'd need to extract from args[1] if provided
    timestamp: Date.now(),
    responseTime: duration,
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries())
  });
  
  return response;
};const sdk = new X2YSdk(
  {}, // API config
  {
    targetLanguage: 'typescript',
    rules: ['performance', 'idiom', 'async'] // Available rule sets
  }
);# Set environment variable to enable auto-refactoring
export X2Y_AUTO_REFACTOR=true// This will automatically apply high-severity refactoring suggestions
await sdk.refactorFile('./src/example.js');import { X2YSdk } from '@x2ydevs/x2y-sdk';

// Initialize SDK
const sdk = new X2YSdk({
  rateLimitThreshold: 80,
  predictionWindow: 60000
});

// Monitor your API calls
async function makeAPICall(url) {
  const start = Date.now();
  try {
    const response = await fetch(url);
    const duration = Date.now() - start;
    
    // Record traffic for monitoring
    sdk.recordAPITraffic({
      endpoint: url,
      method: 'GET',
      timestamp: Date.now(),
      responseTime: duration,
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Predict if next calls might fail
    const prediction = await sdk.predictAPIIssues(url);
    if (prediction.riskLevel === 'high') {
      console.warn('High risk detected for:', url, 'Consider using:', prediction.suggestedAlternatives);
    }
    
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    sdk.recordAPITraffic({
      endpoint: url,
      method: 'GET',
      timestamp: Date.now(),
      responseTime: duration,
      statusCode: 500,
      headers: {}
    });
    throw error;
  }
}
