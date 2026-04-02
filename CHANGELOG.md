# Changelog

Add one new line only for significant completed work.

Format:

`[TYPE] short direct summary`

Allowed prefixes:

- `[FEATURE]`
- `[FIX]`
- `[REFACTOR]`
- `[DOCS]`
- `[TEST]`
- `[BUILD]`
- `[CHORE]`

Rules:

- one line only per entry
- no paragraphs
- no bullets inside entries
- keep the summary direct and specific
- add entries only for changes that matter in project history
- examples: meaningful bug fixes, user-facing features, architectural changes, important build or infra fixes
- skip minor scaffolding, tiny cleanup, and routine doc touch-ups unless they materially change how the project works
- append new entries to the end of the file

[FIX] Point the Postgres Docker healthcheck at the bootstrap `postgres` database instead of the missing `admin` database
[FIX] Align Docker healthchecks with the actual container tools and Keycloak management health port
[BUILD] Add symmetric M0 service foundations for config, Swagger, JWT auth, and MikroORM migration wiring
[BUILD] Complete M0 auth integration with global JWT guards, public health routes, authenticated `me` endpoints, and Bun env-file migration scripts
[BUILD] Add repo typecheck scripts covering backend tests and require typecheck with Biome before task closeout
[REFACTOR] Consolidate M0 foundations through a shared backend package, explicit host/docker env files, and renamed integration bootstrap tests
[FEATURE] Add M1 Wallet Service core with wallet creation, authenticated lookup, integer-cent balances, and first wallet migration
[FEATURE] Add M2 Game Service core with Round, Bet, Crash Point, current round reads, and internal round lifecycle progression
[BUILD] Add M3.1 async settlement foundations with settlement contracts, bet settlement state, and persistent operation stores in both services
[FEATURE] Add M3.2 RabbitMQ bet debit settlement with `POST /games/bet`, wallet debit consumers, and completion-driven bet acceptance
[BUILD] Add M3.3 settlement replay hardening for unpublished RabbitMQ messages and idempotent duplicate completion handling
[FEATURE] Complete M3 with broker-backed cash out credits, crash-loss settlement, deterministic live multiplier calculation, and payout flooring
[BUILD] Harden backend security defaults with unauthorized JWT failure normalization, env-gated Swagger docs, and shared app-level throttling
