import { BaseFault, FaultConfig, FaultResult } from './base.fault';

export interface LatencyFaultConfig extends FaultConfig {
  type: 'latency';
  delay: number;
  jitter?: number;
}

export class LatencyFault extends BaseFault {
  readonly type = 'latency';

  apply(config: FaultConfig): FaultResult {
    const latencyConfig = config as LatencyFaultConfig;
    const delay = latencyConfig.delay || 1000;
    const jitter = latencyConfig.jitter || 0;

    const actualDelay = delay + Math.floor(Math.random() * jitter);

    return {
      faultType: this.type,
      applied: true,
      affectedRequests: 1,
      duration: actualDelay,
      details: {
        configuredDelay: delay,
        jitter,
        actualDelay,
        endpoints: config.endpoints,
      },
    };
  }

  shouldApply(endpoint: string, config: FaultConfig): boolean {
    return config.endpoints.includes(endpoint) || config.endpoints.includes('*');
  }

  /**
   * Calculate the delay to inject for a specific request.
   */
  calculateDelay(config: LatencyFaultConfig): number {
    const jitter = config.jitter || 0;
    return config.delay + Math.floor(Math.random() * jitter);
  }
}
