import { TrafficMonitor } from './monitoring/trafficMonitor';
import { RefactorEngine } from './refactor/refactorEngine';
import { APIMonitorConfig, RefactorConfig, PredictionResult, RefactorSuggestion } from './types';

export class X2YSdk {
  private trafficMonitor: TrafficMonitor;
  private refactorEngine: RefactorEngine;

  constructor(
    apiConfig: APIMonitorConfig = {},
    refactorConfig: RefactorConfig = {}
  ) {
    this.trafficMonitor = new TrafficMonitor(apiConfig);
    this.refactorEngine = new RefactorEngine(refactorConfig);
  }

  // API Monitoring Methods
  public recordAPITraffic(data: any): void {
    this.trafficMonitor.recordTraffic(data);
  }

  public async predictAPIIssues(endpoint: string): Promise<PredictionResult> {
    return await this.trafficMonitor.predict(endpoint);
  }

  // Code Refactoring Methods
  public async refactorCode(code: string): Promise<RefactorSuggestion[]> {
    return await this.refactorEngine.refactorCode(code);
  }

  public async refactorFile(filePath: string): Promise<RefactorSuggestion[]> {
    return await this.refactorEngine.refactorFile(filePath);
  }

  // Utility Methods
  public async suggestOptimizations(filePath: string): Promise<RefactorSuggestion[]> {
    return await this.refactorCode(await this.readFile(filePath));
  }

  private async readFile(filePath: string): Promise<string> {
    const fs = await import('fs-extra');
    return await fs.readFile(filePath, 'utf8');
  }
}

// Export types for users
export * from './types';
