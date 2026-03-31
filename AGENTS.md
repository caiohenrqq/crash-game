# Repository Agent Guide

## Mission

Build the crash game described in `README.md` with:

- `Game Service`
- `Wallet Service`
- `frontend`
- local startup through `bun run docker:up`

## Source Of Truth

1. `README.md`
2. `AGENTS.md`
3. `docs/stack.md`
4. `TOOLS.md`
5. `CHANGELOG.md`
6. feature-specific docs in `docs/features/`

Rules:

- If repo state or another doc diverges from `README.md`, stop and ask the user how to proceed.
- Do not edit `README.md`. Treat it as the interview challenge problem statement and product overview unless the user explicitly says otherwise.
- If implementation requires a new assumption not already documented, stop and ask the user.
- Do not invent product rules, features, or acceptance criteria.
- Prefer official or primary sources when researching dependencies, frameworks, runtimes, cloud providers, or external tools.
- Prefer the most recent authoritative information, including current versioned docs, release notes, and changelogs.
- Cross-check at least two reputable sources when details are safety-sensitive or compatibility-sensitive.

## Stack

Follow `docs/stack.md` for all selected technologies, stack rules, and still-open technical choices.

## Non-Negotiable Rules

- TDD is mandatory.
- REQUIRED work comes before BONUS work.
- Never use floating-point arithmetic for money.
- Keep `Game Service` and `Wallet Service` as separate bounded contexts.
- Keep service-to-service communication asynchronous through the broker.
- Keep one public gateway entrypoint. Kong is the current baseline.
- Do not use git commands unless the user explicitly gives permission.
- Before running any `git add` or `git commit` command, read `docs/commits.md`.
- If an implementation would diverge from the docs or current repo constraints, stop and ask the user.

## Execution Checklist

Before coding:

1. Read `README.md`.
2. Read every doc directly related to the task.
3. Read `TOOLS.md` before running project commands, scripts, migrations, or local services.
4. Confirm the smallest useful vertical slice.

Doc loading order:

- behavior or contract change -> matching file in `docs/features/`
- architecture, boundary, or dependency change -> `docs/architecture.md`
- stack, framework, or tool choice -> `docs/stack.md`
- command, script, or CLI usage -> `TOOLS.md`
- test scope or TDD workflow -> `docs/testing.md`
- milestone or delivery sequence -> `docs/roadmap.md`

During implementation:

1. Write a failing test first.
2. Implement the minimum code to pass.
3. Refactor only with tests passing.
4. Update docs if architecture, contracts, stack, or scope changed.
5. Append one new entry to `CHANGELOG.md` only when the completed work is significant enough to matter in project history, such as a user-facing feature, a meaningful bug fix, an architectural change, or an important build or infrastructure fix.

Before finishing:

- tests were added or updated first where behavior changed
- no duplicated business rule was introduced
- no unnecessary abstraction or file was introduced
- boundaries in `docs/architecture.md` still hold
- stack and tool usage still match `docs/stack.md` and `TOOLS.md`
- run `bun run fix:all` and `bun run typecheck` before closing the task
- `CHANGELOG.md` received one new one-line entry when the completed task is significant enough to record
- no git command was used without explicit user permission

## Coding Rules

- Respect strict TypeScript.
- Prefer readable code over clever code.
- Prefer the fewest lines that preserve clarity, explicitness, and maintainability.
- Keep files focused on one responsibility.
- Use explicit names tied to the domain and use case.
- Avoid comment-dependent code.
- Avoid premature abstractions.
- Avoid shared packages until duplication is real.
- Do not weaken compiler settings or validation rules to make code pass.

## Code Design Rules

- A controller or gateway may validate, map, and delegate. It must not contain business rules.
- A use case must orchestrate one user or system action only.
- A domain entity or value object must enforce its own invariants.
- A function should compute, validate, or orchestrate. If it does more than one, split it.
- A file should have one reason to change. If it mixes transport, business, and persistence logic, split it.
- If two branches differ only by data, extract the data, not a new abstraction.
- Do not create reusable abstractions before a second real use case exists.
- Prefer composition over inheritance. Inheritance requires a concrete repeated need.
- If a type crosses a service boundary, define it explicitly at the boundary.
- Do not leak ORM entities, HTTP DTOs, or broker payload types into domain code.
- Keep one source of truth for each rule. Do not repeat the same business rule across controller, use case, and entity layers.
- If logic needs a comment to explain control flow, simplify the control flow first.
- Names must describe business intent, not technical mechanics.
- When changing behavior, update the closest existing module before creating a parallel structure.

## Editing Files

- Make the smallest safe change that solves the issue.
- Preserve existing style and conventions.
- Prefer patch-style edits with small, reviewable diffs over full-file rewrites.
- After making changes, run the project's standard checks when feasible, such as format/lint, unit tests, build, or typecheck.

## Before Creating A New File

- Prefer updating the closest existing module first.
- Create a new file only when the responsibility is clearly distinct.
- Do not split files only for style or anticipated future reuse.
- Do not create wrappers, helpers, or abstractions unless they remove a present repeated cost.
- If a new file changes the repo structure or introduces a new pattern, update the matching docs in the same change.

## Structure Rules

- `domain/`: domain rules, entities, value objects, invariants
- `application/`: use cases, orchestration, ports
- `infrastructure/`: ORM, repositories, broker, config, adapters
- `presentation/`: controllers, DTOs, gateways, OpenAPI decorators

Rules:

- Do not put business rules in controllers, gateways, or ORM code.
- Do not let one service read or write the other service's database.
- Prefer feature-oriented organization inside each layer as the service grows.

For dependency direction and boundary rules, follow `docs/architecture.md`.

## TDD Rules

- No production code before at least one relevant failing test exists.
- Bug fixes start with a reproducing test.
- Refactors keep behavior-level tests green.
- Missing tests block completion.

For test scope and levels, follow `docs/testing.md`.

## Definition Of Done

- Behavior matches `README.md` and the relevant feature doc.
- Tests exist at the correct level and pass.
- No REQUIRED behavior regressed.
- API, event, schema, and documentation changes stay aligned.
- The change keeps the current architecture and chosen stack coherent.

## Documentation Rules

- Keep docs concise, keyword-rich, and implementation-ready.
- Avoid filler, buzzwords, repeated explanations, and generic best-practice prose.
- Keep one primary home for each rule.
- Follow `README.md` nomenclature exactly: `Game Service`, `Wallet Service`, `Round`, `Bet`, `Crash Point`, `Wallet`.
- Make sure code, docs, scripts, and naming choices stay aligned with the terms used in `README.md`.
- Use relative repo paths only. Never hard-code machine-specific paths.
- Add one direct one-line entry to `CHANGELOG.md` only for significant completed work.
- Use one prefix only: `[FEATURE]`, `[FIX]`, `[REFACTOR]`, `[DOCS]`, `[TEST]`, `[BUILD]`, or `[CHORE]`.

## Secrets And Sensitive Data

- Never print secrets, tokens, private keys, or credentials to terminal output.
- Do not request users to paste secrets.
- Avoid commands that may expose secrets, such as broad environment dumps or reading private key directories.
- Prefer existing authenticated CLIs when available.
- Redact sensitive strings from any displayed output.

## Stop-And-Ask Conditions

- `README.md` conflicts with repo state
- docs conflict with code in a way that changes behavior
- a stack replacement is needed
- a new product rule seems necessary
- a database, broker, or contract choice is not already documented
- the required task docs are missing, stale, or unclear for the work being done
- any git command seems necessary
