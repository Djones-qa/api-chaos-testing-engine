import { verifySteadyState, allSteadyStatePassed, SteadyStateCheck } from '../../../src/engine/steady-state';

describe('Steady State Verification', () => {
  const checks: SteadyStateCheck[] = [
    { endpoint: '/api/payments', method: 'POST', expect: { status: 200, maxLatency: 500 } },
  ];

  it('should pass when responses are within bounds', () => {
    const responses = Array.from({ length: 10 }, () => ({ endpoint: '/api/payments', status: 200, latency: 150 }));
    const results = verifySteadyState(checks, responses);
    expect(results[0].passed).toBe(true);
    expect(results[0].avgLatency).toBe(150);
  });

  it('should fail when latency exceeds max', () => {
    const responses = [{ endpoint: '/api/payments', status: 200, latency: 800 }];
    const results = verifySteadyState(checks, responses);
    expect(results[0].passed).toBe(false);
  });

  it('should fail when success rate is too low', () => {
    const responses = [
      { endpoint: '/api/payments', status: 200, latency: 100 },
      { endpoint: '/api/payments', status: 500, latency: 100 },
      { endpoint: '/api/payments', status: 500, latency: 100 },
    ];
    const results = verifySteadyState(checks, responses);
    expect(results[0].passed).toBe(false);
  });

  it('should fail when no responses recorded', () => {
    const results = verifySteadyState(checks, []);
    expect(results[0].passed).toBe(false);
  });

  it('should check allSteadyStatePassed', () => {
    const good = [{ endpoint: '/api/payments', status: 200, latency: 100 }];
    const results = verifySteadyState(checks, good);
    expect(allSteadyStatePassed(results)).toBe(true);
  });
});
