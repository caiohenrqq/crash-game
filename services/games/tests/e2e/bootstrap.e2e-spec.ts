import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { createHttpExecutionContext } from '@crash/foundation/testing/http-execution-context';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { Round } from '@/domain/round';
import type { JwtAuthenticationGuard } from '@/infrastructure/auth/jwt-authentication.guard';
import type { GamesController } from '@/presentation/controllers/games.controller';

describe('application bootstrap integration', () => {
	let app: INestApplication;
	let ControllerClass: typeof GamesController;
	let GuardClass: typeof JwtAuthenticationGuard;
	let createSwaggerDocument: typeof import('@/presentation/configure-application').createSwaggerDocument;
	const verify = mock(async (token: string) => {
		if (token === 'valid-token') {
			return {
				sub: 'player-123',
				preferred_username: 'player',
				email: 'player@crash-game.dev',
			};
		}

		throw new Error('Invalid token');
	});

	beforeAll(async () => {
		process.env.PORT = '4001';
		process.env.DATABASE_URL = 'postgresql://admin:admin@localhost:5432/games';
		process.env.RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
		process.env.KEYCLOAK_ISSUER_URL = 'http://localhost:8080/realms/crash-game';
		process.env.KEYCLOAK_AUDIENCE = 'crash-game-client';
		process.env.BETTING_PHASE_MS = '40';
		process.env.ACTIVE_ROUND_PHASE_MS = '20';

		const [
			{ GamesController: ImportedGamesController },
			{ JwtAuthenticationGuard: ImportedJwtAuthenticationGuard },
			{ GetCurrentRoundUseCase },
			{ PlaceBetUseCase },
			{ CashOutBetUseCase },
			{ RoundLifecycleService },
			{ BetRepository },
			{ RoundRepository },
			{ SettlementOperationRepository },
			{ SettlementRequester },
			{ TOKEN_VERIFIER },
			{
				configureApplication,
				createSwaggerDocument: importedCreateSwaggerDocument,
			},
		] = await Promise.all([
			import('@/presentation/controllers/games.controller'),
			import('@/infrastructure/auth/jwt-authentication.guard'),
			import('@/application/get-current-round.use-case'),
			import('@/application/place-bet.use-case'),
			import('@/application/cash-out-bet.use-case'),
			import('@/application/round-lifecycle.service'),
			import('@/application/ports/bet.repository'),
			import('@/application/ports/round.repository'),
			import('@/application/ports/settlement-operation.repository'),
			import('@/application/ports/settlement-requester'),
			import('@/infrastructure/auth/token-verifier'),
			import('@/presentation/configure-application'),
		]);

		class InMemoryRoundRepository extends RoundRepository {
			private currentRound: Round | null = null;
			private nextRoundId = 1;

			async findCurrentRound(): Promise<Round | null> {
				return this.currentRound;
			}

			async save(round: Round): Promise<Round> {
				this.currentRound = round;
				return round;
			}

			async create(round: Round): Promise<Round> {
				this.currentRound = round;
				this.nextRoundId = round.id + 1;
				return round;
			}

			async getNextRoundId(): Promise<number> {
				return this.nextRoundId;
			}
		}

		ControllerClass = ImportedGamesController;
		GuardClass = ImportedJwtAuthenticationGuard;
		createSwaggerDocument = importedCreateSwaggerDocument;
		globalThis.__gamesCreateHttpExecutionContext = createHttpExecutionContext;

		const moduleRef = await Test.createTestingModule({
			controllers: [ImportedGamesController],
			providers: [
				GetCurrentRoundUseCase,
				{
					provide: PlaceBetUseCase,
					useValue: {
						execute: mock(async ({ playerId, amountInCents }) => ({
							id: 11,
							roundId: 1,
							playerId,
							amountInCents,
							status: 'accepted',
						})),
					},
				},
				{
					provide: CashOutBetUseCase,
					useValue: {
						execute: mock(async ({ playerId }) => ({
							id: 11,
							roundId: 1,
							playerId,
							amountInCents: 500,
							status: 'cashed_out',
							payoutInCents: 875,
						})),
					},
				},
				RoundLifecycleService,
				ImportedJwtAuthenticationGuard,
				InMemoryRoundRepository,
				{
					provide: APP_GUARD,
					useExisting: ImportedJwtAuthenticationGuard,
				},
				{
					provide: RoundRepository,
					useExisting: InMemoryRoundRepository,
				},
				{
					provide: BetRepository,
					useValue: {
						findByRoundIdAndPlayerId: mock(async () => null),
						findById: mock(async () => null),
						create: mock(async (bet) => bet),
						save: mock(async (bet) => bet),
						findAcceptedByRoundId: mock(async () => []),
					},
				},
				{
					provide: SettlementOperationRepository,
					useValue: {
						create: mock(async (operation) => operation),
						save: mock(async (operation) => operation),
						findByOperationId: mock(async () => null),
						findUnpublished: mock(async () => []),
					},
				},
				{
					provide: SettlementRequester,
					useValue: {
						publishRequested: mock(async () => undefined),
						waitForCompletion: mock(async () => ({
							operationId: 'unused',
							status: 'succeeded' as const,
							rejectionReason: null,
							completedAt: new Date('2026-04-02T12:00:00.000Z'),
						})),
					},
				},
				{
					provide: TOKEN_VERIFIER,
					useValue: {
						verify,
					},
				},
			],
		}).compile();

		app = moduleRef.createNestApplication();
		configureApplication(app);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	test('keeps the health controller available', () => {
		const controller = app.get(ControllerClass);

		expect(controller.check()).toEqual({
			status: 'ok',
			service: 'games',
		});
	});

	test('wires the authentication guard through Nest dependency injection', async () => {
		const guard = app.get(GuardClass);

		await expect(
			guard.canActivate(
				globalThis.__gamesCreateHttpExecutionContext({
					headers: {},
				}),
			),
		).rejects.toBeInstanceOf(Error);
	});

	test('returns the authenticated player for the me controller action', async () => {
		const guard = app.get(GuardClass);
		const controller = app.get(ControllerClass) as GamesController & {
			me?: (request: { authenticatedPlayer: unknown }) => unknown;
		};
		const request = {
			headers: {
				authorization: 'Bearer valid-token',
			},
		};

		await guard.canActivate(
			globalThis.__gamesCreateHttpExecutionContext(request),
		);

		expect(controller.me?.(request)).toEqual({
			playerId: 'player-123',
			username: 'player',
			email: 'player@crash-game.dev',
		});
	});

	test('builds the OpenAPI document with bearer auth on the me route', () => {
		const document = createSwaggerDocument(app);

		expect(document.paths['/me']?.get?.security).toEqual([{ bearer: [] }]);
		expect(document.paths['/bet']?.post?.security).toEqual([{ bearer: [] }]);
		expect(document.paths['/bet/cashout']?.post?.security).toEqual([
			{ bearer: [] },
		]);
	});

	test('returns the current round state with public bets', async () => {
		const controller = app.get(ControllerClass) as GamesController & {
			currentRound?: () => Promise<{
				roundId: number;
				state: string;
				crashPoint: string | null;
				bets: Array<{ playerId: string; amountInCents: number }>;
			}>;
		};

		const round = await controller.currentRound?.();

		expect(round).toEqual({
			roundId: 1,
			state: 'betting',
			crashPoint: null,
			bets: [],
		});
	});

	test('progresses the current round through active and crashed states', async () => {
		const controller = app.get(ControllerClass) as GamesController & {
			currentRound?: () => Promise<{
				roundId: number;
				state: string;
				crashPoint: string | null;
				bets: Array<{ playerId: string; amountInCents: number }>;
			}>;
		};

		const activeRound = await waitForRoundState(controller, 'active', 120);
		const nextRound = await waitForNextBettingRound(
			controller,
			activeRound?.roundId ?? 1,
			120,
		);

		expect(activeRound?.state).toBe('active');
		expect(activeRound?.crashPoint).toBeNull();
		expect(nextRound?.state).toBe('betting');
		expect(nextRound?.roundId).toBe(2);
	});

	test('places a bet for the authenticated player', async () => {
		const controller = app.get(ControllerClass) as GamesController & {
			placeBet?: (
				body: { amountInCents: number },
				request: { authenticatedPlayer: { playerId: string } },
			) => Promise<{
				betId: number;
				playerId: string;
				amountInCents: number;
				status: string;
			}>;
		};

		const bet = await controller.placeBet?.(
			{
				amountInCents: 500,
			},
			{
				authenticatedPlayer: {
					playerId: 'player-123',
				},
			},
		);

		expect(bet).toEqual({
			betId: 11,
			playerId: 'player-123',
			amountInCents: 500,
			status: 'accepted',
		});
	});

	test('cashes out the accepted bet for the authenticated player', async () => {
		const controller = app.get(ControllerClass) as GamesController & {
			cashOutBet?: (request: {
				authenticatedPlayer: { playerId: string };
			}) => Promise<{
				betId: number;
				playerId: string;
				amountInCents: number;
				status: string;
				payoutInCents: number;
			}>;
		};

		const bet = await controller.cashOutBet?.({
			authenticatedPlayer: {
				playerId: 'player-123',
			},
		});

		expect(bet).toEqual({
			betId: 11,
			playerId: 'player-123',
			amountInCents: 500,
			status: 'cashed_out',
			payoutInCents: 875,
		});
	});
});

async function waitForRoundState(
	controller: GamesController & {
		currentRound?: () => Promise<{
			roundId: number;
			state: string;
			crashPoint: string | null;
			bets: Array<{ playerId: string; amountInCents: number }>;
		}>;
	},
	expectedState: string,
	timeoutMs: number,
) {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() <= deadline) {
		const round = await controller.currentRound?.();

		if (round?.state === expectedState) return round;

		await Bun.sleep(5);
	}

	return controller.currentRound?.();
}

async function waitForNextBettingRound(
	controller: GamesController & {
		currentRound?: () => Promise<{
			roundId: number;
			state: string;
			crashPoint: string | null;
			bets: Array<{ playerId: string; amountInCents: number }>;
		}>;
	},
	previousRoundId: number,
	timeoutMs: number,
) {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() <= deadline) {
		const round = await controller.currentRound?.();

		if (round?.state === 'betting' && round.roundId > previousRoundId)
			return round;

		await Bun.sleep(5);
	}

	return controller.currentRound?.();
}

declare global {
	var __gamesCreateHttpExecutionContext: (request: unknown) => ExecutionContext;
}
