import * as dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  requestTimeoutMs: number;
  maxConcurrentFaults: number;
  steadyStateSamples: number;
  assertionTimeoutMs: number;
}

export function loadAppConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '3004', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10),
    maxConcurrentFaults: parseInt(process.env.MAX_CONCURRENT_FAULTS || '5', 10),
    steadyStateSamples: parseInt(process.env.STEADY_STATE_SAMPLES || '10', 10),
    assertionTimeoutMs: parseInt(process.env.ASSERTION_TIMEOUT_MS || '30000', 10),
  };
}
