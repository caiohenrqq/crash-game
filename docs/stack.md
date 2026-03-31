# Stack Baseline

## Selected Stack

- Runtime: Bun
- Backend: NestJS + TypeScript
- ORM: MikroORM
- Database: PostgreSQL
- Broker: RabbitMQ
- API Gateway: Kong
- IdP baseline: Keycloak
- WebSocket: `@nestjs/websockets` + `socket.io`
- Frontend: TanStack Start
- Frontend server state: TanStack Query
- Frontend client state: Zustand
- Testing: Bun test
- API docs: Swagger / OpenAPI
- Container orchestration: Docker Compose
- Money representation: integer cents

## Repo Baseline Notes

- Kong, RabbitMQ, and Keycloak are the current repo baseline, not new scope.
- Keep separate `games` and `wallets` databases.
- The frontend container is not scaffolded yet.
- Keep Bun-first workflows unless a concrete documented blocker appears.
- A small shared backend foundation package is acceptable for stable cross-service infrastructure helpers, but business and service-specific config remain local.

## Stack Rules

- Use MikroORM consistently in both services.
- Use `socket.io` consistently for real-time communication.
- Keep authentication aligned with OIDC and JWT validation.
- Do not replace current infra components unless the user approves the change and docs are updated.
- Do not use floating-point arithmetic for money.

## Still Open

- exact provably fair formula and verification payload
- exact broker event contracts and compensation flow
- exact frontend charting and animation implementation

## Updated Stack Docs

- Selected ORM: MikroORM in both services, with separate `games` and `wallets` databases.
- Selected frontend framework: TanStack Start.
- Selected WebSocket adapter: `socket.io`.
- Selected frontend state tools: TanStack Query + Zustand.
- Selected test runner: Bun test.
- Selected money representation: integer cents.
- Swagger / OpenAPI should be added from the start.

## Official Documentation

- Bun: https://bun.com/docs
- NestJS: https://docs.nestjs.com/
- TypeScript: https://www.typescriptlang.org/docs/
- MikroORM: https://mikro-orm.io/docs/quick-start
- PostgreSQL: https://www.postgresql.org/docs/
- RabbitMQ: https://www.rabbitmq.com/docs
- Kong Gateway: https://developer.konghq.com/index/gateway/
- Keycloak: https://www.keycloak.org/documentation
- `socket.io`: https://socket.io/docs/v4/
- TanStack Start: https://tanstack.com/start/latest/docs/framework/react/overview
- TanStack Query: https://tanstack.com/query/v5/docs/framework/react/overview
- Zustand: https://zustand.docs
- Swagger / OpenAPI: https://swagger.io/docs/
- Docker Compose: https://docs.docker.com/compose/
