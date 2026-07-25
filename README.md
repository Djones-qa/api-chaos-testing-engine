# API Chaos Testing Engine

[![CI Pipeline](https://github.com/Djones-qa/api-chaos-testing-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/Djones-qa/api-chaos-testing-engine/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io/)
[![Jest](https://img.shields.io/badge/Jest-29-red.svg)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Chaos testing engine for APIs — injects controlled failures (latency, errors, dropped connections, payload corruption) into API traffic, validates resilience patterns (retries, circuit breakers, fallbacks), and produces confidence reports with resilience scoring.

## Features

- **Fault Injection** — Latency spikes, HTTP error codes, connection drops, payload corruption, rate limiting
- **Scenario DSL** — YAML-defined chaos scenarios with conditions, fault sequences, and assertions
- **Circuit Breaker Validation** — Verify breakers open under failure and recover on success
- **Resilience Assertions** — Assert graceful degradation, proper fallbacks, no cascading failures
- **Steady-State Verification** — Confirm baseline behavior before and after chaos injection
- **Confidence Scoring** — Resilience score (0–100) based on how well the system handles failures
- **Multi-Fault Composition** — Chain multiple faults: latency + errors + partial outage
- **Report Generation** — Detailed failure analysis with pass/fail per assertion

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    API Chaos Testing Engine                       │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────┐                    │
│  │  YAML Scenario  │───▶│  Scenario Parser │                    │
│  │  Definitions    │    │  & Validator     │                    │
│  └─────────────────┘    └────────┬─────────┘                    │
│                                  │                               │
│                       ┌──────────▼─────────┐                    │
│                       │  Chaos Orchestrator│                    │
│                       │  (Execution Plan)  │                    │
│                       └──────────┬─────────┘                    │
│                                  │                               │
│     ┌────────────────────────────┼────────────────────┐         │
│     ▼                ▼           ▼          ▼         ▼         │
│ ┌────────┐   ┌──────────┐  ┌────────┐  ┌───────┐  ┌───────┐  │
│ │Latency │   │  Error   │  │  Drop  │  │Corrupt│  │ Rate  │  │
│ │Injector│   │ Injector │  │Injector│  │Inject.│  │Limiter│  │
│ └────┬───┘   └────┬─────┘  └───┬────┘  └───┬───┘  └───┬───┘  │
│      └─────────────┴────────────┴───────────┴──────────┘        │
│                                  │                               │
│                       ┌──────────▼─────────┐                    │
│                       │  Target API Client │                    │
│                       │  (HTTP Requests)   │                    │
│                       └──────────┬─────────┘                    │
│                                  │                               │
│                       ┌──────────▼─────────┐                    │
│                       │ Assertion Engine   │                    │
│                       │ (Resilience Check) │                    │
│                       └──────────┬─────────┘                    │
│                                  │                               │
│                       ┌──────────▼─────────┐                    │
│                       │  Report Generator  │                    │
│                       │  (Confidence Score)│                    │
│                       └────────────────────┘                    │
└──────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
api-chaos-testing-engine/
├── .github/workflows/ci.yml
├── src/
│   ├── faults/
│   │   ├── base.fault.ts              # Abstract fault interface
│   │   ├── latency.fault.ts           # Delay injection
│   │   ├── error.fault.ts             # HTTP error code injection
│   │   ├── drop.fault.ts             # Connection drop simulation
│   │   ├── corrupt.fault.ts          # Payload corruption
│   │   ├── rate-limit.fault.ts       # Rate limiting simulation
│   │   └── index.ts                   # Fault registry
│   ├── scenarios/
│   │   ├── parser.ts                  # YAML scenario parser
│   │   ├── types.ts                   # Scenario type definitions
│   │   └── index.ts
│   ├── engine/
│   │   ├── orchestrator.ts           # Chaos execution orchestrator
│   │   ├── assertions.ts            # Resilience assertion engine
│   │   ├── steady-state.ts          # Baseline verification
│   │   └── index.ts
│   ├── reporting/
│   │   ├── scorer.ts                 # Resilience confidence scoring
│   │   ├── reporter.ts              # Report generation
│   │   └── index.ts
│   ├── api/
│   │   ├── server.ts
│   │   └── routes/health.routes.ts
│   ├── config/
│   │   ├── loader.ts
│   │   ├── logger.ts
│   │   └── defaults.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   │   ├── faults/
│   │   │   ├── latency.fault.test.ts
│   │   │   └── error.fault.test.ts
│   │   ├── engine/
│   │   │   ├── assertions.test.ts
│   │   │   └── steady-state.test.ts
│   │   └── reporting/
│   │       └── scorer.test.ts
│   └── fixtures/
│       └── sample-scenario.yml
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── tsconfig.eslint.json
├── jest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- Docker & Docker Compose

### Installation

```bash
git clone https://github.com/Djones-qa/api-chaos-testing-engine.git
cd api-chaos-testing-engine
npm install
cp .env.example .env
npm run dev
```

### Running Tests

```bash
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:coverage # With coverage
npm run lint          # ESLint
```

## Scenario Definition

Chaos scenarios are defined in YAML:

```yaml
version: "1.0"
name: "Payment API Resilience"
target:
  baseUrl: http://localhost:3000
  healthEndpoint: /health

steady_state:
  - endpoint: /api/payments
    method: POST
    expect:
      status: 200
      maxLatency: 500

faults:
  - type: latency
    delay: 3000
    endpoints: ["/api/payments"]
    duration: 30s
    assertions:
      - type: response_timeout
        expect: graceful_timeout
      - type: circuit_breaker
        expect: open_after_threshold

  - type: error
    statusCode: 503
    rate: 0.8
    endpoints: ["/api/payments/process"]
    duration: 20s
    assertions:
      - type: fallback_activated
        expect: true
      - type: no_cascade
        downstream: ["/api/orders", "/api/inventory"]

  - type: drop
    rate: 0.5
    endpoints: ["/api/payments"]
    duration: 15s
    assertions:
      - type: retry_behavior
        expect: exponential_backoff
        maxRetries: 3

recovery:
  timeout: 60s
  assertions:
    - type: steady_state_restored
      within: 30s
```

## Fault Types

| Fault | Description | Parameters |
|-------|-------------|-----------|
| `latency` | Inject delay before response | `delay` (ms), `jitter` (ms) |
| `error` | Return HTTP error codes | `statusCode`, `rate` (0-1) |
| `drop` | Drop connection without response | `rate` (0-1) |
| `corrupt` | Corrupt response payload | `strategy`: truncate, randomize, empty |
| `rate-limit` | Simulate 429 Too Many Requests | `limit` (req/s), `burstSize` |

## Resilience Assertions

| Assertion | What It Checks |
|-----------|----------------|
| `response_timeout` | System returns graceful timeout, not hang |
| `circuit_breaker` | Breaker opens after failure threshold |
| `fallback_activated` | Fallback response served during outage |
| `no_cascade` | Downstream services unaffected by upstream failure |
| `retry_behavior` | Retries use exponential backoff |
| `steady_state_restored` | System returns to normal after chaos stops |
| `error_rate_bounded` | Error rate stays below threshold during chaos |
| `degraded_response` | Returns partial data instead of full failure |

## Confidence Scoring

```
Score = (passed_assertions / total_assertions) × 100

90-100: Excellent — System handles failures gracefully
70-89:  Good — Most resilience patterns working
50-69:  Fair — Some gaps in failure handling
0-49:   Poor — System is fragile under failure conditions
```

## CLI Usage

```bash
# Run a chaos scenario
npx api-chaos-testing-engine run --scenario scenarios/payment-resilience.yml

# Verify steady state only (no chaos)
npx api-chaos-testing-engine verify --scenario scenarios/payment-resilience.yml

# Generate resilience report
npx api-chaos-testing-engine report --scenario scenarios/payment-resilience.yml --output report.json
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3004` |
| `REQUEST_TIMEOUT_MS` | HTTP request timeout | `10000` |
| `MAX_CONCURRENT_FAULTS` | Parallel fault limit | `5` |
| `STEADY_STATE_SAMPLES` | Baseline sample count | `10` |
| `ASSERTION_TIMEOUT_MS` | Assertion check timeout | `30000` |

## CI/CD Pipeline

1. **Lint & Type Check** — ESLint + TypeScript compiler
2. **Unit Tests** — Jest with coverage
3. **Docker Build** — Multi-stage production image

## Author

**Darrius Jones**

- GitHub: [@Djones-qa](https://github.com/Djones-qa)
- LinkedIn: [darrius-jones-28226b350](https://www.linkedin.com/in/darrius-jones-28226b350)

## License

MIT © 2026 Darrius Jones

See [LICENSE](./LICENSE) for details.
