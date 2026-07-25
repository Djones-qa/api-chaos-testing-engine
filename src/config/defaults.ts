export const DEFAULT_PORT = 3004;
export const DEFAULT_REQUEST_TIMEOUT_MS = 10000;
export const MAX_CONCURRENT_FAULTS = 5;
export const STEADY_STATE_SAMPLES = 10;
export const ASSERTION_TIMEOUT_MS = 30000;

export const FAULT_TYPES = ['latency', 'error', 'drop', 'corrupt', 'rate-limit'] as const;
export type FaultType = (typeof FAULT_TYPES)[number];

export const ASSERTION_TYPES = ['response_timeout', 'circuit_breaker', 'fallback_activated', 'no_cascade', 'retry_behavior', 'steady_state_restored', 'error_rate_bounded', 'degraded_response'] as const;
export type AssertionType = (typeof ASSERTION_TYPES)[number];
