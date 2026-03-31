# Platform Integration Feature

## Objective

Keep the repository runnable as one local system with Kong, Keycloak, RabbitMQ, PostgreSQL, `Game Service`, `Wallet Service`, and `frontend`.

## REQUIRED

- `bun run docker:up` starts the local stack without manual steps
- Kong routes `/games/*` and `/wallets/*`
- Keycloak realm bootstrap stays automatic
- services connect to their own databases and the broker
- frontend can join the same Docker flow once scaffolded

## Boundaries

- keep separate service databases
- keep asynchronous communication between services
- keep one public gateway entrypoint
- keep alignment with `README.md` if infra changes are proposed

## Test Focus

- service health and gateway routing
- auth-protected and public route coverage where practical
- broker-backed service interaction

## Open Questions

- exact broker topology
- exact migration and bootstrap details once implementation starts
