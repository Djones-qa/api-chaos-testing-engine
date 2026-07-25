export { BaseFault, FaultConfig, FaultResult } from './base.fault';
export { LatencyFault, LatencyFaultConfig } from './latency.fault';
export { ErrorFault, ErrorFaultConfig } from './error.fault';

import { BaseFault } from './base.fault';
import { LatencyFault } from './latency.fault';
import { ErrorFault } from './error.fault';

const faultRegistry: Record<string, BaseFault> = {
  latency: new LatencyFault(),
  error: new ErrorFault(),
};

export function getFault(type: string): BaseFault {
  const fault = faultRegistry[type];
  if (!fault) throw new Error(`Unknown fault type: ${type}. Available: ${Object.keys(faultRegistry).join(', ')}`);
  return fault;
}

export function getAvailableFaults(): string[] {
  return Object.keys(faultRegistry);
}
