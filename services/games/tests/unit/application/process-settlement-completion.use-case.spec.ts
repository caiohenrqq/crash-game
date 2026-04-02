import { describe, expect, mock, test } from 'bun:test';
import type { BetRepository } from '@/application/ports/bet.repository';
import type { SettlementCompletionNotifier } from '@/application/ports/settlement-completion-notifier';
import type { SettlementOperationRepository } from '@/application/ports/settlement-operation.repository';
import { ProcessSettlementCompletionUseCase } from '@/application/process-settlement-completion.use-case';
import { Bet } from '@/domain/bet';
import { SettlementOperation } from '@/domain/settlement-operation';

describe('ProcessSettlementCompletionUseCase', () => {
	test('marks the bet as accepted and notifies waiters when a debit succeeds', async () => {
		const bet = Bet.place({
			id: 11,
			roundId: 7,
			playerId: 'player-123',
			amountInCents: 300,
			status: 'pending_debit',
		});
		const operation = SettlementOperation.request({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 300,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});
		const notifier: SettlementCompletionNotifier = {
			notify: mock(() => undefined),
		};
		const useCase = new ProcessSettlementCompletionUseCase(
			{
				findByRoundIdAndPlayerId: mock(async () => null),
				findById: mock(async () => bet),
				create: mock(async (currentBet) => currentBet),
				save: mock(async (currentBet) => currentBet),
				findAcceptedByRoundId: mock(async () => []),
			} as BetRepository,
			{
				create: mock(async (currentOperation) => currentOperation),
				save: mock(async (currentOperation) => currentOperation),
				findByOperationId: mock(async () => operation),
				findUnpublished: mock(async () => []),
			} as SettlementOperationRepository,
			notifier,
		);

		await useCase.execute({
			operationId: 'operation-1',
			status: 'succeeded',
			rejectionReason: null,
			completedAt: new Date('2026-04-02T12:00:01.000Z'),
		});

		expect(bet.status).toBe('accepted');
		expect(operation.status).toBe('succeeded');
		expect(notifier.notify).toHaveBeenCalledTimes(1);
	});

	test('marks the bet as rejected and notifies waiters when a debit fails', async () => {
		const bet = Bet.place({
			id: 11,
			roundId: 7,
			playerId: 'player-123',
			amountInCents: 300,
			status: 'pending_debit',
		});
		const operation = SettlementOperation.request({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 300,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});
		const useCase = new ProcessSettlementCompletionUseCase(
			{
				findByRoundIdAndPlayerId: mock(async () => null),
				findById: mock(async () => bet),
				create: mock(async (currentBet) => currentBet),
				save: mock(async (currentBet) => currentBet),
				findAcceptedByRoundId: mock(async () => []),
			} as BetRepository,
			{
				create: mock(async (currentOperation) => currentOperation),
				save: mock(async (currentOperation) => currentOperation),
				findByOperationId: mock(async () => operation),
				findUnpublished: mock(async () => []),
			} as SettlementOperationRepository,
			{
				notify: mock(() => undefined),
			} as SettlementCompletionNotifier,
		);

		await useCase.execute({
			operationId: 'operation-1',
			status: 'rejected',
			rejectionReason: 'insufficient_balance',
			completedAt: new Date('2026-04-02T12:00:01.000Z'),
		});

		expect(bet.status).toBe('debit_rejected');
		expect(operation.status).toBe('rejected');
		expect(operation.rejectionReason).toBe('insufficient_balance');
	});

	test('ignores duplicate completion events after the operation is already settled', async () => {
		const bet = Bet.place({
			id: 11,
			roundId: 7,
			playerId: 'player-123',
			amountInCents: 300,
			status: 'accepted',
		});
		const operation = SettlementOperation.rehydrate({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 300,
			status: 'succeeded',
			rejectionReason: null,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
			publishedAt: new Date('2026-04-02T12:00:00.500Z'),
			completedAt: new Date('2026-04-02T12:00:01.000Z'),
		});
		const saveBet = mock(async (currentBet) => currentBet);
		const saveOperation = mock(async (currentOperation) => currentOperation);
		const notifier: SettlementCompletionNotifier = {
			notify: mock(() => undefined),
		};
		const useCase = new ProcessSettlementCompletionUseCase(
			{
				findByRoundIdAndPlayerId: mock(async () => null),
				findById: mock(async () => bet),
				create: mock(async (currentBet) => currentBet),
				save: saveBet,
				findAcceptedByRoundId: mock(async () => []),
			} as BetRepository,
			{
				create: mock(async (currentOperation) => currentOperation),
				save: saveOperation,
				findByOperationId: mock(async () => operation),
				findUnpublished: mock(async () => []),
			} as SettlementOperationRepository,
			notifier,
		);

		await useCase.execute({
			operationId: 'operation-1',
			status: 'succeeded',
			rejectionReason: null,
			completedAt: new Date('2026-04-02T12:00:02.000Z'),
		});

		expect(saveBet).toHaveBeenCalledTimes(0);
		expect(saveOperation).toHaveBeenCalledTimes(0);
		expect(notifier.notify).toHaveBeenCalledTimes(1);
	});

	test('marks the bet as cashed out when a cashout credit succeeds', async () => {
		const bet = Bet.place({
			id: 11,
			roundId: 7,
			playerId: 'player-123',
			amountInCents: 300,
			status: 'accepted',
		});
		const operation = SettlementOperation.request({
			operationId: 'operation-2',
			operationType: 'cashout_credit',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 450,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});
		const useCase = new ProcessSettlementCompletionUseCase(
			{
				findByRoundIdAndPlayerId: mock(async () => null),
				findById: mock(async () => bet),
				create: mock(async (currentBet) => currentBet),
				save: mock(async (currentBet) => currentBet),
				findAcceptedByRoundId: mock(async () => []),
			} as BetRepository,
			{
				create: mock(async (currentOperation) => currentOperation),
				save: mock(async (currentOperation) => currentOperation),
				findByOperationId: mock(async () => operation),
				findUnpublished: mock(async () => []),
			} as SettlementOperationRepository,
			{
				notify: mock(() => undefined),
			} as SettlementCompletionNotifier,
		);

		await useCase.execute({
			operationId: 'operation-2',
			status: 'succeeded',
			rejectionReason: null,
			completedAt: new Date('2026-04-02T12:00:01.000Z'),
		});

		expect(bet.status).toBe('cashed_out');
		expect(bet.payoutInCents).toBe(450);
		expect(operation.status).toBe('succeeded');
	});

	test('marks the bet as lost when a crash loss succeeds', async () => {
		const bet = Bet.place({
			id: 11,
			roundId: 7,
			playerId: 'player-123',
			amountInCents: 300,
			status: 'accepted',
		});
		const operation = SettlementOperation.request({
			operationId: 'operation-3',
			operationType: 'crash_loss',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 300,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});
		const useCase = new ProcessSettlementCompletionUseCase(
			{
				findByRoundIdAndPlayerId: mock(async () => null),
				findById: mock(async () => bet),
				create: mock(async (currentBet) => currentBet),
				save: mock(async (currentBet) => currentBet),
				findAcceptedByRoundId: mock(async () => []),
			} as BetRepository,
			{
				create: mock(async (currentOperation) => currentOperation),
				save: mock(async (currentOperation) => currentOperation),
				findByOperationId: mock(async () => operation),
				findUnpublished: mock(async () => []),
			} as SettlementOperationRepository,
			{
				notify: mock(() => undefined),
			} as SettlementCompletionNotifier,
		);

		await useCase.execute({
			operationId: 'operation-3',
			status: 'succeeded',
			rejectionReason: null,
			completedAt: new Date('2026-04-02T12:00:01.000Z'),
		});

		expect(bet.status).toBe('lost');
		expect(operation.status).toBe('succeeded');
	});
});
