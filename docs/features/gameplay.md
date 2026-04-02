# Gameplay Feature

## Objective

Deliver `Game Service` behavior for `Round`, `Bet`, `Crash Point`, cash out, history, and provably fair verification.

## REQUIRED

- configurable betting phase and active round phase
- one bet per player per round
- minimum bet `1.00`
- maximum bet `1.000,00`
- no betting after the round starts
- insufficient balance rejects a bet
- no cash out without a valid bet in the round
- cash out payout uses the accepted round multiplier
- crash completion causes loss for bets that did not cash out
- `GET /games/rounds/current`
- `GET /games/rounds/history`
- `GET /games/rounds/:roundId/verify`
- `GET /games/bets/me`
- `POST /games/bet`
- `POST /games/bet/cashout`

## BONUS

- auto cashout
- extra fairness visualization
- leaderboard or analytics extras

## Boundaries

- REST handles player actions and reads
- WebSocket is server-to-client only
- wallet-impacting actions cross the broker, not direct database writes
- M2 round lifecycle progression is local single-instance behavior only; distributed coordination is deferred to later milestones
- `M3.2` wires `POST /games/bet` through RabbitMQ request/completion events for `bet_debit`
- `Game Service` persists bet and settlement state before waiting for the completion event
- `M3.3` replays unpublished settlement requests on startup and ignores duplicate completion events
- `M3.4` adds `POST /games/bet/cashout`, settles `cashout_credit` through RabbitMQ, and publishes `crash_loss` requests for accepted bets when a round crashes
- the active-round multiplier is server-authoritative and deterministic: linear interpolation from `1.00x` to `Crash Point` across `ACTIVE_ROUND_PHASE_MS`
- cash out payout uses integer cents only and floors fractional cents

## Test Focus

- `Round` state transitions
- `Bet` invariants and payout calculation
- provably fair determinism and verification
- invalid gameplay actions

## Open Questions

- exact provably fair formula details
