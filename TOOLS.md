# Tools Guide

## Purpose

Use this file before running commands in this repository.

Rules:

- Prefer the documented command exactly as written before inventing variations.
- If a command fails because the tool is missing, stop and report the missing prerequisite.
- If command syntax, required flags, or expected behavior is unclear, stop and ask instead of guessing.
- Follow `AGENTS.md` for permission, escalation, and stop-and-ask rules.

## Working Directory

- Run workspace-wide commands from the repository root.
- Run service-specific commands from the relevant service directory only when the command is scoped to that service.
- Run frontend commands from `frontend/` once the frontend exists.

## Runtime And Package Manager

- Use Bun as the default runtime and package manager.
- Prefer `bun install` for dependency installation.
- Prefer `bun run <script>` for package scripts.
- Prefer `bun test` for tests.
- Do not switch to npm, pnpm, or yarn unless the user explicitly approves it.

## Repo Scripts

Run these from the repository root:

- `bun run test`
- `bun run lint`
- `bun run fix:all`
- `bun run typecheck`
- `bun run test:foundation`
- `bun run test:e2e`

Gotchas:

- `test` runs foundation unit tests, backend service unit tests, and backend e2e tests.
- `lint` should stay non-mutating.
- `fix:all` rewrites files through Biome.
- `typecheck` runs TypeScript checks for the shared foundation package and both backend services, including tests.

## Docker Commands

Run these from the repository root:

- `bun run docker:up`
- `bun run docker:down`
- `bun run docker:prune`

Gotchas:

- `docker:up` is the baseline local startup path described by `README.md`.
- Do not replace root startup commands with ad hoc `docker compose` variations unless the task requires it and the change is documented.

## Service Commands

Run these from `services/games/` or `services/wallets/`:

- `bun run dev`
- `bun run start`
- `bun run typecheck`
- `bun run test:e2e`
- `bun run migration:create`
- `bun run migration:up`
- `bun run migration:down`
- `bun run migration:list`
- `bun test ./tests/unit`
- `bun test ./tests/e2e/bootstrap.e2e-spec.ts`

Gotchas:

- Service `package.json` files currently expose `dev`, `start`, `typecheck`, `test`, `test:e2e`, and migration scripts.
- Migrations are service-local and use each service's own MikroORM config.
- Prefer existing scripts over raw CLI invocations when both exist.
- Host-side service scripts load `.env.host`.
- Docker runtime loads `.env.docker`.

## Frontend Commands

Run these from `frontend/` after the frontend is scaffolded:

- prefer `bun install`
- prefer `bun run <script>` for frontend scripts
- prefer `bun test` for frontend tests

Gotchas:

- If the frontend is not scaffolded yet, do not guess command names.
- Add frontend command documentation here when the frontend `package.json` exists.

## Search And Inspection

- Prefer `rg` for text search.
- Prefer `rg --files` for file listing.
- Prefer `sed -n '<start>,<end>p' <file>` for targeted file reads.
- Prefer `find` only when path structure matters more than text search.

Gotchas:

- Read targeted sections instead of entire large files when possible.
- Prefer fast, precise inspection commands over broad scans to reduce wasted turns and tokens.

## Editing

- Use patch-based edits for tracked files.
- Keep edits scoped to the task.
- Do not create new files or abstractions unless they are necessary for the documented task.

## Documentation Updates

- Update `AGENTS.md` when repo-wide agent behavior changes.
- Update `TOOLS.md` when command conventions, scripts, or CLI usage changes.
- Update `docs/stack.md` when selected technologies change.
- Update the matching feature doc when behavior, contract, or boundaries change.

## Stop And Ask

Stop and ask the user when:

- a command is ambiguous
- a required script does not exist
- the documented command conflicts with the repo state
- a tool must be replaced
- a command would require a policy decision covered by `AGENTS.md`
