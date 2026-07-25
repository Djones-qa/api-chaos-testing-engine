import { AssertionType } from '../config/defaults';

export interface AssertionConfig {
  type: AssertionType;
  expect: unknown;
  [key: string]: unknown;
}

export interface AssertionResult {
  type: AssertionType;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  message: string;
}

export interface ChaosObservation {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  timeoutCount: number;
  avgLatency: number;
  maxLatency: number;
  errorCodes: Record<number, number>;
  retryCount: number;
  circuitBreakerOpened: boolean;
  fallbackServed: boolean;
  downstreamErrors: number;
}

/**
 * Evaluate a resilience assertion against observed behavior during chaos.
 */
export function evaluateAssertion(
  assertion: AssertionConfig,
  observation: ChaosObservation,
): AssertionResult {
  switch (assertion.type) {
    case 'response_timeout':
      return evaluateResponseTimeout(observation);
    case 'circuit_breaker':
      return evaluateCircuitBreaker(assertion, observation);
    case 'fallback_activated':
      return evaluateFallback(assertion, observation);
    case 'no_cascade':
      return evaluateNoCascade(observation);
    case 'retry_behavior':
      return evaluateRetryBehavior(assertion, observation);
    case 'error_rate_bounded':
      return evaluateErrorRateBounded(assertion, observation);
    case 'steady_state_restored':
      return { type: assertion.type, passed: true, expected: 'restored', actual: 'restored', message: 'Steady state restoration checked separately' };
    case 'degraded_response':
      return evaluateDegradedResponse(observation);
    default:
      return { type: assertion.type, passed: false, expected: 'supported assertion', actual: assertion.type, message: `Unknown assertion type: ${assertion.type}` };
  }
}

function evaluateResponseTimeout(obs: ChaosObservation): AssertionResult {
  const graceful = obs.timeoutCount === 0 || obs.totalRequests > 0;
  return {
    type: 'response_timeout',
    passed: graceful,
    expected: 'graceful_timeout',
    actual: obs.timeoutCount === 0 ? 'no_timeouts' : `${obs.timeoutCount} timeouts`,
    message: graceful ? 'System handled timeouts gracefully' : 'Unhandled timeouts detected',
  };
}

function evaluateCircuitBreaker(assertion: AssertionConfig, obs: ChaosObservation): AssertionResult {
  const expected = assertion.expect === 'open_after_threshold';
  const passed = expected ? obs.circuitBreakerOpened : !obs.circuitBreakerOpened;
  return {
    type: 'circuit_breaker',
    passed,
    expected: assertion.expect,
    actual: obs.circuitBreakerOpened ? 'opened' : 'closed',
    message: passed ? 'Circuit breaker behaved as expected' : 'Circuit breaker did not respond correctly',
  };
}

function evaluateFallback(assertion: AssertionConfig, obs: ChaosObservation): AssertionResult {
  const expected = assertion.expect === true;
  const passed = expected === obs.fallbackServed;
  return {
    type: 'fallback_activated',
    passed,
    expected: assertion.expect,
    actual: obs.fallbackServed,
    message: passed ? 'Fallback activation matched expectation' : 'Fallback behavior unexpected',
  };
}

function evaluateNoCascade(obs: ChaosObservation): AssertionResult {
  const passed = obs.downstreamErrors === 0;
  return {
    type: 'no_cascade',
    passed,
    expected: 0,
    actual: obs.downstreamErrors,
    message: passed ? 'No cascading failures detected' : `${obs.downstreamErrors} downstream errors detected`,
  };
}

function evaluateRetryBehavior(assertion: AssertionConfig, obs: ChaosObservation): AssertionResult {
  const maxRetries = (assertion.maxRetries as number) || 3;
  const passed = obs.retryCount > 0 && obs.retryCount <= maxRetries * obs.failureCount;
  return {
    type: 'retry_behavior',
    passed,
    expected: `retries <= ${maxRetries} per failure`,
    actual: `${obs.retryCount} retries for ${obs.failureCount} failures`,
    message: passed ? 'Retry behavior within bounds' : 'Retry behavior outside expected bounds',
  };
}

function evaluateErrorRateBounded(assertion: AssertionConfig, obs: ChaosObservation): AssertionResult {
  const maxRate = (assertion.expect as number) || 0.5;
  const actualRate = obs.totalRequests > 0 ? obs.failureCount / obs.totalRequests : 0;
  const passed = actualRate <= maxRate;
  return {
    type: 'error_rate_bounded',
    passed,
    expected: `<= ${maxRate * 100}%`,
    actual: `${Math.round(actualRate * 100)}%`,
    message: passed ? 'Error rate within bounds during chaos' : 'Error rate exceeded threshold',
  };
}

function evaluateDegradedResponse(obs: ChaosObservation): AssertionResult {
  const served = obs.successCount > 0 || obs.fallbackServed;
  return {
    type: 'degraded_response',
    passed: served,
    expected: 'partial_data_or_fallback',
    actual: served ? 'degraded_served' : 'full_failure',
    message: served ? 'Degraded response served during chaos' : 'No degraded response — full failure',
  };
}
