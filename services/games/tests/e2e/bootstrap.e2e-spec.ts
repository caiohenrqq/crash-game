import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { createHttpExecutionContext } from '@crash/foundation/testing/http-execution-context';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AppModule as GamesAppModule } from '@/app.module';
import type { JwtAuthenticationGuard } from '@/infrastructure/auth/jwt-authentication.guard';
import { TOKEN_VERIFIER } from '@/infrastructure/auth/token-verifier';
import type { GamesController } from '@/presentation/controllers/games.controller';

describe('application bootstrap integration', () => {
	let app: INestApplication;
	let AppModule: typeof GamesAppModule;
	let ControllerClass: typeof GamesController;
	let GuardClass: typeof JwtAuthenticationGuard;
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

		const [
			{ AppModule: ImportedAppModule },
			{ configureApplication, createSwaggerDocument },
			{ GamesController: ImportedControllerClass },
			{ JwtAuthenticationGuard: ImportedGuardClass },
		] = await Promise.all([
			import('@/app.module'),
			import('@/presentation/configure-application').then((module) => ({
				configureApplication: module.configureApplication,
				createSwaggerDocument: module.createSwaggerDocument,
			})),
			import('@/presentation/controllers/games.controller'),
			import('@/infrastructure/auth/jwt-authentication.guard'),
		]);

		AppModule = ImportedAppModule;
		ControllerClass = ImportedControllerClass;
		GuardClass = ImportedGuardClass;
		globalThis.__gamesCreateSwaggerDocument = createSwaggerDocument;
		globalThis.__gamesCreateHttpExecutionContext = createHttpExecutionContext;

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(TOKEN_VERIFIER)
			.useValue({
				verify,
			})
			.compile();

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
		const document = globalThis.__gamesCreateSwaggerDocument(app);

		expect(document.paths['/me']?.get?.security).toEqual([{ bearer: [] }]);
	});
});

declare global {
	var __gamesCreateSwaggerDocument: (
		app: INestApplication,
	) => ReturnType<
		typeof import('@/presentation/configure-application').createSwaggerDocument
	>;
	var __gamesCreateHttpExecutionContext: (request: unknown) => ExecutionContext;
}
