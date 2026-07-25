#!/usr/bin/env node
import { startServer } from './api/server';
import { logger } from './config/logger';

const command = process.argv[2];

async function main(): Promise<void> {
  switch (command) {
    case 'serve': startServer(); break;
    default:
      console.log(`
API Chaos Testing Engine v1.0.0

Usage:
  api-chaos-testing-engine serve                  Start the API server
  api-chaos-testing-engine run --scenario <yml>   Execute a chaos scenario
  api-chaos-testing-engine verify --scenario <yml> Verify steady state only
  api-chaos-testing-engine report --scenario <yml> Generate resilience report
      `);
      break;
  }
}

main().catch((err) => { logger.error(`Fatal: ${err.message}`); process.exit(1); });
