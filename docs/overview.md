# Project Overview

## Project

This repository is a full-stack crash game challenge with:

- `Game Service` for `Round`, `Bet`, `Crash Point`, provably fair verification, and live game state
- `Wallet Service` for `Wallet`, balance, and credit/debit operations
- `frontend` for login, gameplay, history, and live updates

## Required First

Implement in this order:

1. service foundations for auth, persistence, migrations, and API docs
2. `Wallet Service` balance safety and wallet endpoints
3. `Game Service` round lifecycle and current round state
4. async communication between `Game Service` and `Wallet Service`
5. required gameplay REST endpoints
6. required WebSocket synchronization
7. frontend gameplay flow
8. `bun run docker:up` end-to-end readiness

## Current State

The repository is still in `M2` foundation work.

Today the codebase should provide:

- a shared backend foundation package for config parsing, Swagger/bootstrap helpers, MikroORM bootstrap helpers, and test helpers
- one explicit service-local config entrypoint per backend service
- explicit host-shell env files and Docker env files per backend service
- `tests/unit/` and `tests/e2e/` scaffolding in each service, with current e2e coverage focused on bootstrap wiring

Later milestones should build on top of this foundation rather than replacing it with parallel setup paths.

## Success

- one valid bet per player per round
- exact money handling
- async settlement between services
- server-to-client real-time round synchronization
- provably fair verification for past rounds
- REQUIRED behavior covered by tests

## Scope Rule

Use `AGENTS.md` for REQUIRED vs BONUS rules, `docs/stack.md` for chosen tech, and `docs/roadmap.md` for delivery sequence.
