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
			{ RoundLifecycleService },
			{ RoundRepository },
			{ TOKEN_VERIFIER },
			{
				configureApplication,
				createSwaggerDocument: importedCreateSwaggerDocument,
			},
		] = await Promise.all([
			import('@/presentation/controllers/games.controller'),
			import('@/infrastructure/auth/jwt-authentication.guard'),
			import('@/application/get-current-round.use-case'),
			import('@/application/round-lifecycle.service'),
			import('@/application/ports/round.repository'),
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

		await Bun.sleep(45);
		const activeRound = await controller.currentRound?.();
		await Bun.sleep(25);
		const nextRound = await controller.currentRound?.();

		expect(activeRound?.state).toBe('active');
		expect(activeRound?.crashPoint).toBeNull();
		expect(nextRound?.state).toBe('betting');
		expect(nextRound?.roundId).toBe(2);
	});
});

declare global {
	var __gamesCreateHttpExecutionContext: (request: unknown) => ExecutionContext;
}
