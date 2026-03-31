# Delivery Roadmap

## Order

1. `Wallet Service` foundation
2. `Game Service` round foundation
3. async service communication
4. gameplay REST API
5. real-time WebSocket sync
6. frontend core experience
7. end-to-end local readiness
8. BONUS items

## Required Milestones

### M1. Wallet Service

- implement `Wallet`
- deliver `POST /wallets` and `GET /wallets/me`
- keep money handling exact

Done when:

- wallet behavior is test-backed
- balance cannot go negative

### M2. Game Service

- implement `Round`, `Bet`, and `Crash Point` behavior
- enforce one bet per player per round
- enforce betting window and crash completion rules

Done when:

- round lifecycle is covered by unit tests
- current round state is readable

### M3. Async Flow

- define broker contracts between services
- implement compensation-safe settlement flow

Done when:

- wallet-impacting gameplay actions cross the broker only
- failure handling is documented and tested

### M4. API And Real Time

- deliver required REST endpoints
- deliver required WebSocket synchronization

Done when:

- REST matches `README.md`
- multiple clients stay synchronized during an active round

### M5. Frontend And Local Run

- scaffold `frontend`
- implement login, gameplay screen, and live synchronization
- make `bun run docker:up` work end to end

Done when:

- a player can complete the main flow in the browser
- local setup matches the docs

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
