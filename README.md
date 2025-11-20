# x2y SDK 🚀

[![npm version](https://img.shields.io/npm/v/@x2ydevs/x2y-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@x2ydevs/x2y-sdk)
[![License](https://img.shields.io/npm/l/@x2ydevs/x2y-sdk.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/@x2ydevs/x2y-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@x2ydevs/x2y-sdk)

**Advanced API monitoring and code refactoring SDK** by **x2y Dev Tools**  

> All rights reserved © x2y Dev Tools. For more developer tools, visit [x2ydevs.xyz](https://x2ydevs.xyz)

---

## Features ✨

- **API Traffic Monitoring:** Record and analyze API requests/responses in real time.  
- **Predictive Issue Detection:** Detect potential API issues before they occur.  
- **Code Refactoring:** Optimize code with actionable suggestions.  
- **File Refactoring:** Refactor entire files with best-practice rules.  
- **Custom Configs:** Tailor API monitoring and refactoring behavior to your project.

---

## Requirements 📦

- Node.js >= 16  
- npm >= 8  
- Internet connection for SDK API features  

---

## Installation 💿

```bash
npm install @x2ydevs/x2y-sdk
```

---

## Quick Start ⚡

### Import the SDK

```javascript
import { X2YSdk } from '@x2ydevs/x2y-sdk';

const sdk = new X2YSdk();
```

---

### Record API Traffic

```javascript
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
```

---

### Predict API Issues

```javascript
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
*/
```

---

### Refactor Code Directly

```javascript
const suggestions = await sdk.refactorCode(`
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
`);
console.log(suggestions);
```

---

### Refactor Entire Files

```javascript
const fileSuggestions = await sdk.refactorFile('./src/example.js');
console.log(fileSuggestions);
```

---

### Advanced SDK Configuration

```javascript
const sdk = new X2YSdk(
  {
    // API monitoring config
    rateLimitThreshold: 80,       // % of rate limit before warning
    predictionWindow: 60000,      // Time window in ms for analysis (1 minute)
    apiUrl: 'https://api.example.com'
  },
  {
    // Refactoring config
    targetLanguage: 'typescript',
    rules: ['performance', 'idiom', 'async']
  }
);
```

---

## Example Project

```bash
# Initialize new project
mkdir my-app && cd my-app
npm init -y
npm install @x2ydevs/x2y-sdk
```

```javascript
import { X2YSdk } from '@x2ydevs/x2y-sdk';

const sdk = new X2YSdk();

// Monitor API and refactor code
sdk.recordAPITraffic({ endpoint: '/api/data', method: 'GET', timestamp: Date.now() });
const issues = await sdk.predictAPIIssues('/api/data');
console.log(issues);
```

---

## Changelog 📝

- **v1.0.0:** Initial release with API monitoring and code refactoring.  
- **v1.1.0:** Added predictive API issue detection and custom configuration options.  
- **v1.2.0:** Optimized refactoring engine and improved performance logging.

---

## Documentation & Support

For full documentation, tutorials, and more developer tools, visit: [https://x2ydevs.xyz](https://x2ydevs.xyz)  

---

**x2y SDK** is a property of **x2y Dev Tools**. Use responsibly.
