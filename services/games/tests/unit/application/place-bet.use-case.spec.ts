import { describe, expect, mock, test } from 'bun:test';
import { PlaceBetUseCase } from '@/application/place-bet.use-case';
import type { BetRepository } from '@/application/ports/bet.repository';
import type { RoundRepository } from '@/application/ports/round.repository';
import type { SettlementOperationRepository } from '@/application/ports/settlement-operation.repository';
import type { SettlementRequester } from '@/application/ports/settlement-requester';
import { Bet } from '@/domain/bet';
import { CrashPoint } from '@/domain/crash-point';
import { Round } from '@/domain/round';

describe('PlaceBetUseCase', () => {
	test('publishes a bet debit request and accepts the bet after a successful completion', async () => {
		const round = Round.start({
			id: 7,
			crashPoint: CrashPoint.fromHundredths(200),
			createdAt: new Date('2026-04-02T12:00:00.000Z'),
		});
		const betRepository: BetRepository = {
			findByRoundIdAndPlayerId: mock(async () => null),
			findById: mock(async (id) =>
				Bet.place({
					id,
					roundId: 7,
					playerId: 'player-123',
					amountInCents: 500,
					status: 'accepted',
				}),
			),
			create: mock(async (bet) =>
				Object.assign(bet, {
					id: 11,
				}),
			),
			save: mock(async (bet) => bet),
			findAcceptedByRoundId: mock(async () => []),
		};
		const settlementOperationRepository: SettlementOperationRepository = {
			create: mock(async (operation) => operation),
			save: mock(async (operation) => operation),
			findByOperationId: mock(async () => null),
			findUnpublished: mock(async () => []),
		};
		const settlementRequester: SettlementRequester = {
			publishRequested: mock(async () => undefined),
			waitForCompletion: mock(async (operationId) => ({
				operationId,
				status: 'succeeded' as const,
				rejectionReason: null,
				completedAt: new Date('2026-04-02T12:00:01.000Z'),
			})),
		};
		const useCase = new PlaceBetUseCase(
			{
				findCurrentRound: mock(async () => round),
				save: mock(async (currentRound) => currentRound),
				create: mock(async (currentRound) => currentRound),
				getNextRoundId: mock(async () => 8),
			} as RoundRepository,
			betRepository,
			settlementOperationRepository,
			settlementRequester,
		);

		const bet = await useCase.execute({
			playerId: 'player-123',
			amountInCents: 500,
		});

		expect(bet.status).toBe('accepted');
		expect(settlementRequester.publishRequested).toHaveBeenCalledTimes(1);
		expect(settlementRequester.waitForCompletion).toHaveBeenCalledTimes(1);
	});

	test('marks the bet as debit rejected when the wallet rejects the debit', async () => {
		const round = Round.start({
			id: 7,
			crashPoint: CrashPoint.fromHundredths(200),
			createdAt: new Date('2026-04-02T12:00:00.000Z'),
		});
		const betRepository: BetRepository = {
			findByRoundIdAndPlayerId: mock(async () => null),
			findById: mock(async () =>
				Bet.place({
					id: 11,
					roundId: 7,
					playerId: 'player-123',
					amountInCents: 500,
					status: 'debit_rejected',
				}),
			),
			create: mock(async (bet) =>
				Object.assign(bet, {
					id: 11,
				}),
			),
			save: mock(async (bet) => bet),
			findAcceptedByRoundId: mock(async () => []),
		};
		const useCase = new PlaceBetUseCase(
			{
				findCurrentRound: mock(async () => round),
				save: mock(async (currentRound) => currentRound),
				create: mock(async (currentRound) => currentRound),
				getNextRoundId: mock(async () => 8),
			} as RoundRepository,
			betRepository,
			{
				create: mock(async (operation) => operation),
				save: mock(async (operation) => operation),
				findByOperationId: mock(async () => null),
				findUnpublished: mock(async () => []),
			} as SettlementOperationRepository,
			{
				publishRequested: mock(async () => undefined),
				waitForCompletion: mock(async (operationId) => ({
					operationId,
					status: 'rejected' as const,
					rejectionReason: 'insufficient_balance',
					completedAt: new Date('2026-04-02T12:00:01.000Z'),
				})),
			} as SettlementRequester,
		);

		await expect(
			useCase.execute({
				playerId: 'player-123',
				amountInCents: 500,
			}),
		).rejects.toThrow('Wallet debit rejected: insufficient_balance');
	});
});
