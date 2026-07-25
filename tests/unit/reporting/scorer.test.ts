import { calculateResilienceScore } from '../../../src/reporting/scorer';
import { AssertionResult } from '../../../src/engine/assertions';

describe('Resilience Scorer', () => {
  it('should score 100 when all assertions pass', () => {
    const results: AssertionResult[] = [
      { type: 'circuit_breaker', passed: true, expected: 'open', actual: 'open', message: 'ok' },
      { type: 'no_cascade', passed: true, expected: 0, actual: 0, message: 'ok' },
      { type: 'fallback_activated', passed: true, expected: true, actual: true, message: 'ok' },
    ];
    const score = calculateResilienceScore(results);
    expect(score.score).toBe(100);
    expect(score.grade).toBe('Excellent');
  });

  it('should score 0 when all assertions fail', () => {
    const results: AssertionResult[] = [
      { type: 'circuit_breaker', passed: false, expected: 'open', actual: 'closed', message: 'fail' },
      { type: 'no_cascade', passed: false, expected: 0, actual: 5, message: 'fail' },
    ];
    const score = calculateResilienceScore(results);
    expect(score.score).toBe(0);
    expect(score.grade).toBe('Poor');
  });

  it('should calculate partial scores correctly', () => {
    const results: AssertionResult[] = [
      { type: 'circuit_breaker', passed: true, expected: 'open', actual: 'open', message: 'ok' },
      { type: 'no_cascade', passed: false, expected: 0, actual: 3, message: 'fail' },
      { type: 'fallback_activated', passed: true, expected: true, actual: true, message: 'ok' },
      { type: 'retry_behavior', passed: true, expected: 'backoff', actual: 'backoff', message: 'ok' },
    ];
    const score = calculateResilienceScore(results);
    expect(score.score).toBe(75);
    expect(score.grade).toBe('Good');
  });

  it('should handle empty results', () => {
    const score = calculateResilienceScore([]);
    expect(score.score).toBe(0);
    expect(score.grade).toBe('Poor');
    expect(score.totalAssertions).toBe(0);
  });

  it('should report correct counts', () => {
    const results: AssertionResult[] = [
      { type: 'circuit_breaker', passed: true, expected: 'x', actual: 'x', message: '' },
      { type: 'no_cascade', passed: false, expected: 'x', actual: 'x', message: '' },
    ];
    const score = calculateResilienceScore(results);
    expect(score.passedAssertions).toBe(1);
    expect(score.failedAssertions).toBe(1);
    expect(score.totalAssertions).toBe(2);
  });
});
