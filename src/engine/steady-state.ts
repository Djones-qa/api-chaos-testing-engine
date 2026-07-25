import { logger } from '../config/logger';

export interface SteadyStateCheck {
  endpoint: string;
  method: string;
  expect: { status: number; maxLatency: number };
}

export interface SteadyStateResult {
  endpoint: string;
  passed: boolean;
  avgLatency: number;
  maxLatency: number;
  successRate: number;
  samples: number;
  details: string;
}

/**
 * Verify steady-state behavior by checking baseline responses.
 * This runs BEFORE chaos to establish what "normal" looks like.
 */
export function verifySteadyState(
  checks: SteadyStateCheck[],
  responses: Array<{ endpoint: string; status: number; latency: number }>,
): SteadyStateResult[] {
  const results: SteadyStateResult[] = [];

  for (const check of checks) {
    const matching = responses.filter((r) => r.endpoint === check.endpoint);

    if (matching.length === 0) {
      results.push({
        endpoint: check.endpoint,
        passed: false,
        avgLatency: 0,
        maxLatency: 0,
        successRate: 0,
        samples: 0,
        details: 'No responses recorded for this endpoint',
      });
      continue;
    }

    const successCount = matching.filter((r) => r.status === check.expect.status).length;
    const successRate = successCount / matching.length;
    const latencies = matching.map((r) => r.latency);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);

    const latencyPassed = maxLatency <= check.expect.maxLatency;
    const statusPassed = successRate >= 0.95;
    const passed = latencyPassed && statusPassed;

    results.push({
      endpoint: check.endpoint,
      passed,
      avgLatency: Math.round(avgLatency),
      maxLatency: Math.round(maxLatency),
      successRate: Math.round(successRate * 100),
      samples: matching.length,
      details: passed
        ? `Steady state verified: ${successRate * 100}% success, avg ${Math.round(avgLatency)}ms`
        : `Steady state FAILED: success=${Math.round(successRate * 100)}%, maxLatency=${Math.round(maxLatency)}ms (limit: ${check.expect.maxLatency}ms)`,
    });

    logger.debug(`Steady state ${check.endpoint}: ${passed ? 'PASS' : 'FAIL'}`);
  }

  return results;
}

/**
 * Check if all steady state checks passed.
 */
export function allSteadyStatePassed(results: SteadyStateResult[]): boolean {
  return results.every((r) => r.passed);
}
