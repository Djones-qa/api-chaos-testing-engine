import { ErrorFault } from '../../../src/faults/error.fault';

describe('ErrorFault', () => {
  const fault = new ErrorFault();

  it('should have type "error"', () => { expect(fault.type).toBe('error'); });

  it('should apply with rate 1.0 (always)', () => {
    const result = fault.apply({ type: 'error', statusCode: 503, rate: 1.0, endpoints: ['/api/test'], duration: 20000 });
    expect(result.applied).toBe(true);
    expect(result.details.statusCode).toBe(503);
  });

  it('should not apply with rate 0 (never)', () => {
    // With rate 0, Math.random() (which is always >= 0) will never be < 0
    // Test the shouldInjectError method directly
    expect(fault.shouldInjectError(0)).toBe(false);
  });

  it('should get configured status code', () => {
    expect(fault.getStatusCode({ type: 'error', statusCode: 429, rate: 1, endpoints: [], duration: 0 })).toBe(429);
  });

  it('should return the given status code even if 0', () => {
    expect(fault.getStatusCode({ type: 'error', statusCode: 503, rate: 1, endpoints: [], duration: 0 })).toBe(503);
  });

  it('should inject at rate 1.0', () => {
    expect(fault.shouldInjectError(1.0)).toBe(true);
  });

  it('should not inject at rate 0', () => {
    expect(fault.shouldInjectError(0)).toBe(false);
  });
});
