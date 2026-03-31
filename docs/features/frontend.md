# Frontend Feature

## Objective

Deliver the player-facing application for authentication, live gameplay, and round history.

## REQUIRED

- login flow against the configured IdP
- token handling after callback
- game page with bet input, place bet, cash out, timer, multiplier, and player info
- live updates for round state, bets, cash outs, and crash
- wallet balance display
- responsive layout
- dark casino-style UI

## Boundaries

- all gameplay commands go through REST
- WebSocket is server push only
- frontend is not the source of truth for timing or settlement
- avoid duplicating backend business rules

## Test Focus

- login callback behavior
- control enable and disable states
- API client and WebSocket client integration
- live state rendering

## Open Questions

- exact charting and animation implementation

For selected frontend technologies, follow `docs/stack.md`.
