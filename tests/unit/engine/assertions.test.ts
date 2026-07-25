import { evaluateAssertion, ChaosObservation } from '../../../src/engine/assertions';

const baseObs: ChaosObservation = {
  totalRequests: 100, successCount: 80, failureCount: 20, timeoutCount: 0,
  avgLatency: 200, maxLatency: 500, errorCodes: { 503: 20 }, retryCount: 10,
  circuitBreakerOpened: true, fallbackServed: true, downstreamErrors: 0,
};

describe('Assertion Engine', () => {
  it('should pass response_timeout when no timeouts', () => {
    const result = evaluateAssertion({ type: 'response_timeout', expect: 'graceful_timeout' }, baseObs);
    expect(result.passed).toBe(true);
  });

  it('should pass circuit_breaker when opened as expected', () => {
    const result = evaluateAssertion({ type: 'circuit_breaker', expect: 'open_after_threshold' }, baseObs);
    expect(result.passed).toBe(true);
  });

  it('should fail circuit_breaker when not opened', () => {
    const obs = { ...baseObs, circuitBreakerOpened: false };
    const result = evaluateAssertion({ type: 'circuit_breaker', expect: 'open_after_threshold' }, obs);
    expect(result.passed).toBe(false);
  });

  it('should pass fallback_activated when served', () => {
    const result = evaluateAssertion({ type: 'fallback_activated', expect: true }, baseObs);
    expect(result.passed).toBe(true);
  });

  it('should fail fallback_activated when not served', () => {
    const obs = { ...baseObs, fallbackServed: false };
    const result = evaluateAssertion({ type: 'fallback_activated', expect: true }, obs);
    expect(result.passed).toBe(false);
  });

  it('should pass no_cascade when no downstream errors', () => {
    const result = evaluateAssertion({ type: 'no_cascade', expect: true }, baseObs);
    expect(result.passed).toBe(true);
  });

  it('should fail no_cascade when downstream errors exist', () => {
    const obs = { ...baseObs, downstreamErrors: 5 };
    const result = evaluateAssertion({ type: 'no_cascade', expect: true }, obs);
    expect(result.passed).toBe(false);
  });

  it('should pass retry_behavior within bounds', () => {
    const result = evaluateAssertion({ type: 'retry_behavior', expect: 'exponential_backoff', maxRetries: 3 }, baseObs);
    expect(result.passed).toBe(true);
  });

  it('should pass error_rate_bounded when within limit', () => {
    const result = evaluateAssertion({ type: 'error_rate_bounded', expect: 0.3 }, baseObs);
    expect(result.passed).toBe(true);
  });

  it('should fail error_rate_bounded when exceeded', () => {
    const result = evaluateAssertion({ type: 'error_rate_bounded', expect: 0.1 }, baseObs);
    expect(result.passed).toBe(false);
  });

  it('should pass degraded_response when some succeed', () => {
    const result = evaluateAssertion({ type: 'degraded_response', expect: true }, baseObs);
    expect(result.passed).toBe(true);
  });
});
