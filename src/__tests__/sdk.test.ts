import { X2YSdk } from '../index';

describe('X2YSdk', () => {
  let sdk: X2YSdk;

  beforeEach(() => {
    sdk = new X2YSdk();
  });

  test('should initialize without errors', () => {
    expect(sdk).toBeDefined();
  });

  test('should record API traffic', () => {
    const trafficData = {
      endpoint: '/api/test',
      method: 'GET',
      timestamp: Date.now(),
      responseTime: 100,
      statusCode: 200,
      headers: {
        'x-ratelimit-remaining': '90',
        'x-ratelimit-limit': '100'
      }
    };

    expect(() => sdk.recordAPITraffic(trafficData)).not.toThrow();
  });

  test('should predict API issues', async () => {
    const trafficData = {
      endpoint: '/api/test',
      method: 'GET',
      timestamp: Date.now(),
      responseTime: 100,
      statusCode: 200,
      headers: {
        'x-ratelimit-remaining': '10',
        'x-ratelimit-limit': '100'
      }
    };

    sdk.recordAPITraffic(trafficData);
    
    const prediction = await sdk.predictAPIIssues('/api/test');
    expect(prediction).toHaveProperty('endpoint');
    expect(prediction).toHaveProperty('riskLevel');
    expect(prediction).toHaveProperty('predictedFailure');
    expect(prediction).toHaveProperty('rateLimitApproaching');
    expect(prediction).toHaveProperty('suggestedAlternatives');
    expect(prediction).toHaveProperty('confidence');
  });

  test('should refactor simple code', async () => {
    const code = `
      for (let i = 0; i < arr.length; i++) {
        console.log(arr[i]);
      }
    `;

    const suggestions = await sdk.refactorCode(code);
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThanOrEqual(0);
  });

  test('should suggest performance improvements', async () => {
    const code = `
      for (let i = 0; i < items.length; i++) {
        document.getElementById('myElement').innerHTML += items[i];
      }
    `;

    const suggestions = await sdk.refactorCode(code);
    const performanceSuggestions = suggestions.filter(s => s.type === 'performance');
    expect(performanceSuggestions.length).toBeGreaterThan(0);
  });

  test('should suggest modern idioms', async () => {
    const code = `
      var result = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].active) {
          result.push(items[i].name);
        }
      }
    `;

    const suggestions = await sdk.refactorCode(code);
    const idiomSuggestions = suggestions.filter(s => s.type === 'idiom');
    expect(idiomSuggestions.length).toBeGreaterThan(0);
  });

  test('should handle async/await suggestions', async () => {
    const code = `
      fetch('/api/data')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
    `;

    const suggestions = await sdk.refactorCode(code);
    const asyncSuggestions = suggestions.filter(s => s.type === 'optimization');
    expect(asyncSuggestions.length).toBeGreaterThan(0);
  });

  test('should return alternatives when rate limit approaching', async () => {
    const trafficData = {
      endpoint: '/api/test',
      method: 'GET',
      timestamp: Date.now(),
      responseTime: 100,
      statusCode: 200,
      headers: {
        'x-ratelimit-remaining': '5',
        'x-ratelimit-limit': '100'
      }
    };

    sdk.recordAPITraffic(trafficData);
    
    const prediction = await sdk.predictAPIIssues('/api/test');
    expect(prediction.suggestedAlternatives).toBeInstanceOf(Array);
    expect(prediction.suggestedAlternatives.length).toBeGreaterThan(0);
  });
});
