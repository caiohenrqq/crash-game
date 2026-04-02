# Architecture Direction

## System

- `Game Service`
- `Wallet Service`
- `frontend`
- Kong API Gateway
- RabbitMQ
- PostgreSQL
- Keycloak baseline

## Ownership

### Game Service

Owns:

- `Round` lifecycle
- `Bet` rules
- `Crash Point`
- provably fair verification data
- round history
- player bet history
- server-to-client WebSocket events

Must not own:

- wallet balance authority
- wallet database writes

### Wallet Service

Owns:

- `Wallet`
- wallet creation
- balance reads for the authenticated player
- gameplay-triggered credit and debit operations

Must not own:

- round timing
- crash logic
- player-facing round history

### Frontend

Owns:

- OIDC login flow
- game screen and interaction state
- rendering REST and WebSocket data

Must not own:

- gameplay authority
- settlement authority
- duplicated backend business rules

## Service Structure

Follow `AGENTS.md` for the layer definitions. This document defines dependency direction and service boundaries.

## Communication

### Synchronous

- frontend -> Kong -> REST endpoints
- frontend -> `Game Service` WebSocket endpoint
- each service -> its own database

### Asynchronous

- `Game Service` publishes broker events for wallet-impacting actions
- `Wallet Service` consumes them and applies credit/debit behavior
- settlement request and completion contracts are keyed by `operationId`
- `M3.2` currently wires `bet_debit` through RabbitMQ with one completion queue for `Game Service`
- `M3.3` replays unpublished settlement messages on startup and keeps completion handling idempotent
- `M3.4` extends the same broker flow to `cashout_credit` and `crash_loss`
- `Game Service` computes the authoritative live multiplier and payout, then asks `Wallet Service` to apply the resulting credit asynchronously
- `Wallet Service` stays the only wallet balance authority; `crash_loss` is recorded as a terminal broker completion without a wallet balance mutation

## Security Defaults

- JWT verification failures must return `401 Unauthorized`, not generic `500` errors
- Swagger `/docs` is enabled only outside `production` unless explicitly overridden by env
- both backend services apply app-level request throttling with shared env-driven defaults
- authenticated HTTP throttling keys by `playerId` when available before falling back to request IP

## Persistence

- separate `games` and `wallets` databases
- no shared tables across services

## Dependency Rules

- `domain/` must not import NestJS, MikroORM, broker, or HTTP types.
- `application/` may depend on `domain/` and explicit ports, not on concrete infrastructure implementations.
- `infrastructure/` implements ports and persistence or broker details; it must not define business rules.
- `presentation/` may map requests, responses, and events; it must not decide `Round`, `Bet`, `Crash Point`, or `Wallet` behavior.
- `Game Service` must not write to the `Wallet Service` database.
- `Wallet Service` is the only authority for wallet balance mutation.
- WebSocket payload assembly belongs to `presentation/`; gameplay rules belong to `domain/` and `application/`.
- Persistence models must not become the domain model by accident; keep boundary mapping explicit when needed.

## Allowed

- explicit repository and broker ports
- vertical slices by use case
- domain-focused types where they remove state or money mistakes

## Discouraged

- shared domain model across services
- business logic in controllers, gateways, or ORM code
- generic base layers without repeated need
- synchronous core settlement coupling
- leaking transport or persistence types into domain code

## Boundary Checklist

- Does `domain/` avoid framework, broker, ORM, and HTTP imports?
- Does `application/` depend on ports instead of concrete infrastructure?
- Does `presentation/` only map, validate, and delegate?
- Does `infrastructure/` avoid defining business rules?
- Does `Game Service` avoid wallet database writes?
- Does `Wallet Service` remain the only wallet balance authority?
- Do transport and persistence types stop at the boundary instead of leaking inward?

Use `AGENTS.md` for repo-wide rules and `docs/features/*.md` for slice-specific boundaries.
