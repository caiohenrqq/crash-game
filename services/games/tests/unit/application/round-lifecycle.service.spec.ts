import { afterEach, describe, expect, mock, test } from 'bun:test';
import type { BetRepository } from '@/application/ports/bet.repository';
import type { RoundRepository } from '@/application/ports/round.repository';
import type { SettlementOperationRepository } from '@/application/ports/settlement-operation.repository';
import type { SettlementRequester } from '@/application/ports/settlement-requester';
import { Bet } from '@/domain/bet';
import { CrashPoint } from '@/domain/crash-point';
import { Round } from '@/domain/round';

describe('RoundLifecycleService', () => {
	afterEach(() => {
		delete process.env.PORT;
		delete process.env.DATABASE_URL;
		delete process.env.RABBITMQ_URL;
		delete process.env.KEYCLOAK_ISSUER_URL;
		delete process.env.KEYCLOAK_AUDIENCE;
		delete process.env.BETTING_PHASE_MS;
		delete process.env.ACTIVE_ROUND_PHASE_MS;
	});

	test('publishes crash loss requests for accepted bets when an active round reaches crash time', async () => {
		process.env.PORT = '4001';
		process.env.DATABASE_URL = 'postgresql://games:games@localhost:5432/games';
		process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
		process.env.KEYCLOAK_ISSUER_URL = 'http://localhost:8080/realms/crash';
		process.env.KEYCLOAK_AUDIENCE = 'games-service';
		process.env.BETTING_PHASE_MS = '10000';
		process.env.ACTIVE_ROUND_PHASE_MS = '10000';

		const { RoundLifecycleService } = await import(
			'@/application/round-lifecycle.service'
		);

		const round = Round.rehydrate({
			id: 7,
			crashPoint: CrashPoint.fromHundredths(200),
			createdAt: new Date('2026-04-02T12:00:00.000Z'),
			state: 'active',
			bets: [],
			activatedAt: new Date('2026-04-02T12:00:00.000Z'),
			crashedAt: null,
		});
		const acceptedBet = Bet.place({
			id: 11,
			roundId: 7,
			playerId: 'player-123',
			amountInCents: 500,
			status: 'accepted',
		});
		const settlementRequester: SettlementRequester = {
			publishRequested: mock(async () => undefined),
			waitForCompletion: mock(async () => ({
				operationId: 'unused',
				status: 'succeeded' as const,
				rejectionReason: null,
				completedAt: new Date('2026-04-02T12:00:10.000Z'),
			})),
		};
		const service = new RoundLifecycleService(
			{
				findCurrentRound: mock(async () => round),
				save: mock(async (currentRound) => currentRound),
				create: mock(async (currentRound) => currentRound),
				getNextRoundId: mock(async () => 8),
			} as RoundRepository,
			{
				findByRoundIdAndPlayerId: mock(async () => acceptedBet),
				findById: mock(async () => acceptedBet),
				create: mock(async (bet) => bet),
				save: mock(async (bet) => bet),
				findAcceptedByRoundId: mock(async () => [acceptedBet]),
			} as BetRepository,
			{
				create: mock(async (operation) => operation),
				save: mock(async (operation) => operation),
				findByOperationId: mock(async () => null),
				findUnpublished: mock(async () => []),
			} as SettlementOperationRepository,
			settlementRequester,
		);

		await service.onModuleInit();

		expect(settlementRequester.publishRequested).toHaveBeenCalledTimes(1);
		expect(settlementRequester.publishRequested).toHaveBeenCalledWith(
			expect.objectContaining({
				operationType: 'crash_loss',
				betId: 11,
				amountInCents: 500,
			}),
		);

		service.onModuleDestroy();
		Reflect.set(RoundLifecycleService, 'ownsLifecycle', false);
	});
});
