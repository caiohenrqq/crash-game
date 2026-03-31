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

### E2E

- wallet creation and wallet lookup
- place bet -> round progresses -> cash out or crash -> settlement reflected
- validation failures: insufficient balance, duplicate bet, late bet, no-bet cashout
- gateway-path verification where practical

## Test Design

- Prefer behavior and contract assertions over implementation trivia.
- Test money outcomes with exact values.
- Test timing boundaries around bet close, crash, and cash out.
- Keep fixtures explicit and readable.

For repo-wide completion rules, follow `AGENTS.md`.
