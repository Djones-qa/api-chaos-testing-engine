export interface FaultConfig {
  type: string;
  endpoints: string[];
  duration: number;
  rate?: number;
  [key: string]: unknown;
}

export interface FaultResult {
  faultType: string;
  applied: boolean;
  affectedRequests: number;
  duration: number;
  details: Record<string, unknown>;
}

export abstract class BaseFault {
  abstract readonly type: string;

  abstract apply(config: FaultConfig): FaultResult;

  abstract shouldApply(endpoint: string, config: FaultConfig): boolean;
}
