# Project Overview

## Project

This repository is a full-stack crash game challenge with:

- `Game Service` for `Round`, `Bet`, `Crash Point`, provably fair verification, and live game state
- `Wallet Service` for `Wallet`, balance, and credit/debit operations
- `frontend` for login, gameplay, history, and live updates

## Required First

Implement in this order:

1. `Wallet Service` balance safety and wallet endpoints
2. `Game Service` round lifecycle and bet rules
3. async communication between `Game Service` and `Wallet Service`
4. required REST endpoints
5. required WebSocket synchronization
6. frontend gameplay flow
7. `bun run docker:up` end-to-end readiness

## Success

- one valid bet per player per round
- exact money handling
- async settlement between services
- server-to-client real-time round synchronization
- provably fair verification for past rounds
- REQUIRED behavior covered by tests

## Scope Rule

Use `AGENTS.md` for REQUIRED vs BONUS rules, `docs/stack.md` for chosen tech, and `docs/roadmap.md` for delivery sequence.
