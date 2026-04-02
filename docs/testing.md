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
- live multiplier calculation and payout flooring
- cash out completion and crash-loss completion state transitions

### Integration

- database persistence
- broker publisher and consumer behavior
- settlement operation repository persistence
- bet debit request/completion orchestration
- startup replay for unpublished settlement messages
- duplicate completion idempotency
- cash out request/completion orchestration
- crash-loss request publication on round crash
- auth guard integration
- docs bootstrap gating by environment/config
- app-level throttling baseline and authenticated tracker behavior
- WebSocket event assembly
- M0 bootstrap coverage for app startup, Swagger wiring, and protected-route guard wiring

### E2E

- wallet creation and wallet lookup
- place bet -> round progresses -> cash out or crash -> settlement reflected
- validation failures: insufficient balance, duplicate bet, late bet, no-bet cashout
- gateway-path verification where practical

Notes:

- Current backend M0 coverage lives under `tests/e2e/` to match the scaffold defined in `README.md`, but the current assertions are still bootstrap-oriented rather than full request-path e2e.
- Real gateway-level e2e coverage should arrive with later milestones once more gameplay flows exist.
- `M3.4` is currently covered primarily with focused unit tests for multiplier calculation, payout flooring, wallet credit handling, cash out completion, and crash-loss publication.

## Test Design

- Prefer behavior and contract assertions over implementation trivia.
- Test money outcomes with exact values.
- Test timing boundaries around bet close, crash, and cash out.
- Keep fixtures explicit and readable.

For repo-wide completion rules, follow `AGENTS.md`.
