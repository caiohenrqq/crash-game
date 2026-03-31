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

## Test Focus

- `Wallet` credit and debit rules
- insufficient balance
- persistence mapping
- broker consumer behavior

## Open Questions

- exact broker contracts
- exact operation model details
