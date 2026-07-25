import { LatencyFault } from '../../../src/faults/latency.fault';

describe('LatencyFault', () => {
  const fault = new LatencyFault();

  it('should have type "latency"', () => { expect(fault.type).toBe('latency'); });

  it('should apply delay', () => {
    const result = fault.apply({ type: 'latency', delay: 2000, endpoints: ['/api/test'], duration: 30000 });
    expect(result.applied).toBe(true);
    expect(result.faultType).toBe('latency');
    expect(result.duration).toBeGreaterThanOrEqual(2000);
  });

  it('should add jitter to delay', () => {
    const result = fault.apply({ type: 'latency', delay: 1000, jitter: 500, endpoints: ['/api/test'], duration: 30000 });
    expect(result.duration).toBeGreaterThanOrEqual(1000);
    expect(result.duration).toBeLessThanOrEqual(1500);
  });

  it('should match configured endpoints', () => {
    const config = { type: 'latency', delay: 1000, endpoints: ['/api/payments', '/api/orders'], duration: 30000 };
    expect(fault.shouldApply('/api/payments', config)).toBe(true);
    expect(fault.shouldApply('/api/users', config)).toBe(false);
  });

  it('should match wildcard endpoints', () => {
    const config = { type: 'latency', delay: 1000, endpoints: ['*'], duration: 30000 };
    expect(fault.shouldApply('/any/endpoint', config)).toBe(true);
  });

  it('should calculate delay with jitter', () => {
    const delay = fault.calculateDelay({ type: 'latency', delay: 500, jitter: 200, endpoints: [], duration: 0 });
    expect(delay).toBeGreaterThanOrEqual(500);
    expect(delay).toBeLessThanOrEqual(700);
  });
});
