# Delivery Roadmap

## Order

1. service foundations
2. `Wallet Service` core
3. `Game Service` core
4. async settlement
5. gameplay REST completion
6. real-time WebSocket sync
7. frontend core experience
8. end-to-end local readiness
9. BONUS items

## Why This Order

The early milestones must include service bootstrap, persistence, auth, and API foundations before the first meaningful vertical slices. Without those prerequisites, `Wallet Service` and `Game Service` milestones look smaller than the real implementation path.

## Required Milestones

### M0. Service Foundations

- scaffold both services with the repo structure rules
- wire MikroORM for separate `games` and `wallets` databases
- define migration/bootstrap workflow for local startup
- establish JWT validation approach for authenticated endpoints
- add Swagger / OpenAPI baseline from the start

Done when:

- both services boot with persistence scaffolding in place
- database access follows the selected stack and architecture rules
- authenticated endpoints have a defined validation path
- API documentation support is ready for feature endpoints

### M1. Wallet Service Core

- implement `Wallet`
- enforce exact cents-based money handling
- enforce non-negative balance invariants
- deliver `POST /wallets` and `GET /wallets/me`
- keep `Wallet Service` as the only balance authority

Done when:

- wallet behavior is test-backed
- wallet persistence is covered at integration level
- wallet creation and wallet lookup work for the authenticated player
- balance cannot go negative

### M2. Game Service Core

- implement `Round`, `Bet`, and `Crash Point` behavior
- enforce one bet per player per round
- enforce betting window and crash completion rules
- deliver `GET /games/rounds/current`

Done when:

- round lifecycle is covered by unit tests
- current round state is readable

### M3. Async Settlement

- define broker contracts between services
- implement wallet debit and credit behavior through the broker
- implement compensation-safe settlement flow

Done when:

- wallet-impacting gameplay actions cross the broker only
- failure handling is documented and tested

### M4. Gameplay REST Completion

- deliver the remaining required game REST endpoints
- deliver wallet and game API behavior aligned with `README.md`

Done when:

- REST matches `README.md`
- gameplay validation failures are covered at the appropriate test levels

### M5. Real-Time Sync

- define the WebSocket event model
- deliver required server-to-client synchronization for rounds, bets, cash outs, and crash completion

Done when:

- multiple clients stay synchronized during an active round
- WebSocket payloads support the required frontend state updates

### M6. Frontend Core

- scaffold `frontend`
- implement login, wallet-aware gameplay screen, and live synchronization

Done when:

- a player can complete the main gameplay flow in the browser
- frontend login and authenticated API usage work with the chosen auth path

### M7. End-To-End Local Readiness

- make `bun run docker:up` work end to end

Done when:

- local setup matches the docs
- migrations, auth bootstrap, gateway routing, and service startup work together without manual steps
- meaningful integration and e2e coverage supports the required path

## Bonus

- outbox/inbox hardening
- auto cashout
- auto bet
- observability
- deterministic e2e seed tooling
- Playwright, Storybook, leaderboard, rate limiting, CI extras

## Risk Hotspots

- broker contract mistakes
- money arithmetic mistakes
- round timing races
- real-time synchronization drift
- unclear provably fair verification design
