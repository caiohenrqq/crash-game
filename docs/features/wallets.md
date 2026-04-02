# Wallets Feature

## Objective

Deliver `Wallet Service` as the source of truth for `Wallet` balance and gameplay-triggered credit/debit operations.

## REQUIRED

- `POST /wallets`
- `GET /wallets/me`
- exact money handling
- insufficient balance rejection
- broker-driven credit and debit behavior for gameplay actions

## BONUS

- extra wallet reporting or reconciliation tooling

## Boundaries

- one `Wallet` per player
- balance must never go negative
- Wallet Service is the only money authority
- credit and debit are not public REST endpoints
- `M3.2` consumes `bet_debit` settlement requests from RabbitMQ and publishes completion events
- duplicate `operationId` must not apply the same debit twice
- `M3.3` replays unpublished completion events on startup before new messages are consumed
- `M3.4` consumes `cashout_credit` and `crash_loss` settlement requests from RabbitMQ
- `cashout_credit` credits the wallet exactly once by `operationId`
- `crash_loss` publishes a terminal completion event without mutating wallet balance

## Test Focus

- `Wallet` credit and debit rules
- insufficient balance
- persistence mapping
- broker consumer behavior

## Open Questions

- exact operation model details
