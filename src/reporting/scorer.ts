import { AssertionResult } from '../engine/assertions';

export interface ResilienceScore {
  score: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  details: AssertionResult[];
}

/**
 * Calculate a resilience confidence score from assertion results.
 */
export function calculateResilienceScore(results: AssertionResult[]): ResilienceScore {
  if (results.length === 0) {
    return { score: 0, grade: 'Poor', totalAssertions: 0, passedAssertions: 0, failedAssertions: 0, details: [] };
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const score = Math.round((passed / results.length) * 100);

  return {
    score,
    grade: getGrade(score),
    totalAssertions: results.length,
    passedAssertions: passed,
    failedAssertions: failed,
    details: results,
  };
}

function getGrade(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}
