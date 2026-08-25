export interface APIMonitorConfig {
  apiKey?: string;
  apiUrl?: string;
  rateLimitThreshold?: number;
  predictionWindow?: number;
}

export interface TrafficData {
  endpoint: string;
  method: string;
  timestamp: number;
  responseTime: number;
  statusCode: number;
  headers: Record<string, string>;
}

export interface PredictionResult {
  endpoint: string;
  riskLevel: 'low' | 'medium' | 'high';
  predictedFailure: boolean;
  rateLimitApproaching: boolean;
  suggestedAlternatives: string[];
  confidence: number;
}

export interface RefactorSuggestion {
  type: 'performance' | 'idiom' | 'optimization';
  description: string;
  originalCode: string;
  suggestedCode: string;
  line: number;
  severity: 'low' | 'medium' | 'high';
}

export interface RefactorConfig {
  targetLanguage?: 'javascript' | 'typescript';
  rules?: string[];
}
