import { TrafficData, APIMonitorConfig, PredictionResult } from '../types';
import axios from 'axios';

export class TrafficMonitor {
  private config: APIMonitorConfig;
  private trafficHistory: TrafficData[] = [];
  private rateLimitPredictor: RateLimitPredictor;

  constructor(config: APIMonitorConfig = {}) {
    this.config = {
      rateLimitThreshold: 80, // 80% of limit
      predictionWindow: 60000, // 1 minute in ms
      ...config
    };
    this.rateLimitPredictor = new RateLimitPredictor();
  }

  public recordTraffic(data: TrafficData): void {
    this.trafficHistory.push(data);
    // Keep only recent traffic data based on prediction window
    const now = Date.now();
    this.trafficHistory = this.trafficHistory.filter(
      item => now - item.timestamp < this.config.predictionWindow!
    );
  }

  public async predict(endpoint: string): Promise<PredictionResult> {
    const recentTraffic = this.trafficHistory.filter(
      item => item.endpoint === endpoint
    );

    // Analyze rate limit headers if present
    const rateLimitInfo = this.analyzeRateLimitHeaders(recentTraffic);
    const rateLimitApproaching = rateLimitInfo.remaining < (rateLimitInfo.limit * this.config.rateLimitThreshold! / 100);

    // Predict failure based on error patterns
    const predictedFailure = this.predictFailure(recentTraffic);

    // Analyze response time patterns
    const responseTimeIssues = this.analyzeResponseTime(recentTraffic);

    return {
      endpoint,
      riskLevel: this.calculateRiskLevel(rateLimitApproaching, predictedFailure, responseTimeIssues),
      predictedFailure,
      rateLimitApproaching,
      suggestedAlternatives: this.getSuggestedAlternatives(endpoint, recentTraffic),
      confidence: this.calculateConfidence(recentTraffic)
    };
  }

  private analyzeRateLimitHeaders(traffic: TrafficData[]): { limit: number, remaining: number, reset: number } {
    // Look for rate limit headers in recent traffic
    let limit = 100; // default
    let remaining = 100; // default
    let reset = Date.now() + 60000; // default reset in 1 minute

    // Find the most recent response with rate limit info
    const recentWithHeaders = traffic.filter(item => 
      item.headers['x-ratelimit-limit'] || 
      item.headers['x-ratelimit-remaining'] ||
      item.headers['ratelimit-limit']
    ).pop();

    if (recentWithHeaders) {
      const headers = recentWithHeaders.headers;
      limit = parseInt(headers['x-ratelimit-limit'] || headers['ratelimit-limit'] || '100') || 100;
      remaining = parseInt(headers['x-ratelimit-remaining'] || headers['ratelimit-remaining'] || '100') || 100;
      reset = parseInt(headers['x-ratelimit-reset'] || headers['ratelimit-reset'] || (Date.now() + 60000).toString()) || Date.now() + 60000;
    }

    return { limit, remaining, reset };
  }

  private predictFailure(traffic: TrafficData[]): boolean {
    if (traffic.length === 0) return false;

    // Calculate error rate (4xx and 5xx responses)
    const errorCount = traffic.filter(item => item.statusCode >= 400).length;
    const errorRate = errorCount / traffic.length;

    // If error rate is high, predict failure
    if (errorRate > 0.3) return true;

    // Check for increasing error trend
    const recentTraffic = traffic.slice(-10); // Last 10 requests
    const recentErrorRate = recentTraffic.filter(item => item.statusCode >= 400).length / recentTraffic.length;
    
    return recentErrorRate > 0.5; // If recent error rate is >50%, predict failure
  }

  private analyzeResponseTime(traffic: TrafficData[]): boolean {
    if (traffic.length < 5) return false;

    // Calculate average response time
    const avgResponseTime = traffic.reduce((sum, item) => sum + item.responseTime, 0) / traffic.length;
    
    // Check if recent response times are significantly higher
    const recentTraffic = traffic.slice(-5);
    const recentAvg = recentTraffic.reduce((sum, item) => sum + item.responseTime, 0) / recentTraffic.length;
    
    // If recent average is 2x higher than overall average, flag as issue
    return recentAvg > avgResponseTime * 2;
  }

  private calculateRiskLevel(rateLimitApproaching: boolean, predictedFailure: boolean, responseTimeIssues: boolean): 'low' | 'medium' | 'high' {
    const riskFactors = [rateLimitApproaching, predictedFailure, responseTimeIssues].filter(Boolean).length;
    
    if (riskFactors >= 2) return 'high';
    if (riskFactors >= 1) return 'medium';
    return 'low';
  }

  private getSuggestedAlternatives(endpoint: string, traffic: TrafficData[]): string[] {
    const alternatives: string[] = [];

    // Suggest API version upgrade if available
    if (endpoint.includes('/v1/')) {
      alternatives.push(endpoint.replace('/v1/', '/v2/'));
    }

    // Suggest load-balanced endpoints if available
    if (this.config.apiUrl) {
      const baseUrl = this.config.apiUrl.replace(/\/$/, '');
      alternatives.push(`${baseUrl}${endpoint}`);
    }

    // Suggest cached alternatives
    alternatives.push(`${endpoint}?cached=true`);

    // Add fallback endpoints based on traffic patterns
    if (traffic.length > 0) {
      const method = traffic[0].method;
      if (method === 'GET') {
        alternatives.push(endpoint.replace(/\/$/, '') + '?fallback=true');
      }
    }

    return alternatives;
  }

  private calculateConfidence(traffic: TrafficData[]): number {
    // Confidence increases with more data points
    const dataPoints = traffic.length;
    const confidence = Math.min(dataPoints * 10, 95); // Cap at 95%
    
    // Boost confidence if we have rate limit headers
    const hasRateLimitHeaders = traffic.some(item => 
      item.headers['x-ratelimit-limit'] || item.headers['ratelimit-limit']
    );
    
    return hasRateLimitHeaders ? confidence + 5 : confidence;
  }
}

class RateLimitPredictor {
  isApproachingLimit(traffic: TrafficData[], threshold: number): boolean {
    if (traffic.length === 0) return false;

    // Calculate request rate per minute
    const startTime = Math.min(...traffic.map(item => item.timestamp));
    const endTime = Math.max(...traffic.map(item => item.timestamp));
    const durationMinutes = (endTime - startTime) / 60000 || 1;
    const requestCount = traffic.length;
    const ratePerMinute = requestCount / durationMinutes;

    // If rate is approaching threshold, return true
    return ratePerMinute > threshold;
  }
}
