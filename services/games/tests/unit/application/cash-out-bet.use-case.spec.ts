import { describe, expect, mock, test } from 'bun:test';
import { CashOutBetUseCase } from '@/application/cash-out-bet.use-case';
import { CurrentRoundMultiplierService } from '@/application/current-round-multiplier.service';
import type { BetRepository } from '@/application/ports/bet.repository';
import type { RoundRepository } from '@/application/ports/round.repository';
import type { SettlementOperationRepository } from '@/application/ports/settlement-operation.repository';
import type { SettlementRequester } from '@/application/ports/settlement-requester';
import { Bet } from '@/domain/bet';
import { CrashPoint } from '@/domain/crash-point';
import { Round } from '@/domain/round';

describe('CashOutBetUseCase', () => {
	test('publishes a cashout credit request with a floored payout and returns the cashed out bet', async () => {
		const round = Round.start({
			id: 7,
			crashPoint: CrashPoint.fromHundredths(250),
			createdAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		round.activate(new Date('2026-04-02T12:00:10.000Z'));

		const persistedBet = Bet.place({
			id: 11,
			roundId: 7,
			playerId: 'player-123',
			amountInCents: 501,
			status: 'accepted',
		});
		const settlementRequester: SettlementRequester = {
			publishRequested: mock(async () => undefined),
			waitForCompletion: mock(async (operationId) => ({
				operationId,
				status: 'succeeded' as const,
				rejectionReason: null,
				completedAt: new Date('2026-04-02T12:00:15.100Z'),
			})),
		};
		const useCase = new CashOutBetUseCase(
			{
				findCurrentRound: mock(async () => round),
				save: mock(async (currentRound) => currentRound),
				create: mock(async (currentRound) => currentRound),
				getNextRoundId: mock(async () => 8),
			} as RoundRepository,
			{
				findByRoundIdAndPlayerId: mock(async () => persistedBet),
				findById: mock(async () =>
					Bet.place({
						id: 11,
						roundId: 7,
						playerId: 'player-123',
						amountInCents: 501,
						status: 'cashed_out',
						payoutInCents: 876,
					}),
				),
				create: mock(async (bet) => bet),
				save: mock(async (bet) => bet),
				findAcceptedByRoundId: mock(async () => [persistedBet]),
			} as BetRepository,
			{
				create: mock(async (operation) => operation),
				save: mock(async (operation) => operation),
				findByOperationId: mock(async () => null),
				findUnpublished: mock(async () => []),
			} as SettlementOperationRepository,
			settlementRequester,
			new CurrentRoundMultiplierService(10_000),
		);

		const bet = await useCase.execute({
			playerId: 'player-123',
			cashedOutAt: new Date('2026-04-02T12:00:15.000Z'),
		});

		expect(bet.status).toBe('cashed_out');
		expect(bet.payoutInCents).toBe(876);
		expect(settlementRequester.publishRequested).toHaveBeenCalledTimes(1);
		expect(settlementRequester.publishRequested).toHaveBeenCalledWith(
			expect.objectContaining({
				operationType: 'cashout_credit',
				amountInCents: 876,
			}),
		);
	});
});
