# Testing Strategy

## Mandatory Workflow

TDD is mandatory.

1. Write a failing test.
2. Implement the minimum code to pass.
3. Refactor with tests still passing.

## Required Rules

- No production code before a relevant failing test exists.
- Bug fixes start with a reproducing test.
- Refactors preserve passing behavior-level tests.
- Missing tests block completion.
- Prefer Bun test as the default runner for backend and frontend.

## Test Levels

### Unit

- `Round` transitions
- `Bet` validation and payout calculation
- `Wallet` credit, debit, and insufficient balance
- provably fair calculation and verification logic

### Integration

- database persistence
- broker publisher and consumer behavior
- auth guard integration
- WebSocket event assembly
- M0 bootstrap coverage for app startup, Swagger wiring, and protected-route guard wiring

### E2E

- wallet creation and wallet lookup
- place bet -> round progresses -> cash out or crash -> settlement reflected
- validation failures: insufficient balance, duplicate bet, late bet, no-bet cashout
- gateway-path verification where practical

Notes:

- Current backend M0 coverage lives under `tests/e2e/` to match the scaffold defined in `README.md`, but the current assertions are still bootstrap-oriented rather than full request-path e2e.
- Real HTTP and gateway-level e2e coverage should arrive with later milestones once feature flows exist.

## Test Design

- Prefer behavior and contract assertions over implementation trivia.
- Test money outcomes with exact values.
- Test timing boundaries around bet close, crash, and cash out.
- Keep fixtures explicit and readable.

For repo-wide completion rules, follow `AGENTS.md`.
