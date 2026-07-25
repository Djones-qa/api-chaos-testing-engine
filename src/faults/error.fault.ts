import { BaseFault, FaultConfig, FaultResult } from './base.fault';

export interface ErrorFaultConfig extends FaultConfig {
  type: 'error';
  statusCode: number;
  rate: number;
}

export class ErrorFault extends BaseFault {
  readonly type = 'error';

  apply(config: FaultConfig): FaultResult {
    const errorConfig = config as ErrorFaultConfig;
    const shouldInject = Math.random() < (errorConfig.rate || 1.0);

    return {
      faultType: this.type,
      applied: shouldInject,
      affectedRequests: shouldInject ? 1 : 0,
      duration: 0,
      details: {
        statusCode: errorConfig.statusCode,
        rate: errorConfig.rate,
        injected: shouldInject,
        endpoints: config.endpoints,
      },
    };
  }

  shouldApply(endpoint: string, config: FaultConfig): boolean {
    const errorConfig = config as ErrorFaultConfig;
    const matchesEndpoint = config.endpoints.includes(endpoint) || config.endpoints.includes('*');
    const withinRate = Math.random() < (errorConfig.rate || 1.0);
    return matchesEndpoint && withinRate;
  }

  /**
   * Determine if a specific request should receive an error based on rate.
   */
  shouldInjectError(rate: number): boolean {
    return Math.random() < rate;
  }

  /**
   * Get the HTTP status code to inject.
   */
  getStatusCode(config: ErrorFaultConfig): number {
    return config.statusCode || 500;
  }
}
