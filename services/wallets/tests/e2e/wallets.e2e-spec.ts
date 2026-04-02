import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { WalletRepository } from '@/application/ports/wallet.repository';
import { Wallet } from '@/domain/wallet';
import { TOKEN_VERIFIER } from '@/infrastructure/auth/token-verifier';
import { RabbitMqWalletSettlementBroker } from '@/infrastructure/broker/rabbit-mq-wallet-settlement-broker';
import {
	configureApplication,
	createSwaggerDocument,
} from '@/presentation/configure-application';

describe('Wallets e2e', () => {
	let app: INestApplication;
	let walletRepository: WalletRepository;
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
		process.env.PORT = '4002';
		process.env.DATABASE_URL =
			'postgresql://admin:admin@localhost:5432/wallets';
		process.env.RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
		process.env.KEYCLOAK_ISSUER_URL = 'http://localhost:8080/realms/crash-game';
		process.env.KEYCLOAK_AUDIENCE = 'crash-game-client';

		const wallets = new Map<
			string,
			{ playerId: string; balanceInCents: number }
		>();
		walletRepository = {
			findByPlayerId: async (playerId) => {
				const wallet = wallets.get(playerId);

				if (!wallet) return null;

				return Wallet.rehydrate(wallet);
			},
			create: async (wallet) => {
				wallets.set(wallet.playerId, {
					playerId: wallet.playerId,
					balanceInCents: wallet.balanceInCents,
				});
				return wallet;
			},
			save: async (wallet) => {
				wallets.set(wallet.playerId, {
					playerId: wallet.playerId,
					balanceInCents: wallet.balanceInCents,
				});
				return wallet;
			},
		};

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(TOKEN_VERIFIER)
			.useValue({
				verify,
			})
			.overrideProvider(RabbitMqWalletSettlementBroker)
			.useValue({
				onModuleInit: mock(async () => undefined),
				onModuleDestroy: mock(async () => undefined),
				publishCompleted: mock(async () => undefined),
			})
			.overrideProvider(WalletRepository)
			.useValue(walletRepository)
			.compile();

		app = moduleRef.createNestApplication();
		configureApplication(app);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	test('keeps the health controller available', async () => {
		const controller = app.get(
			(await import('@/presentation/controllers/wallets.controller'))
				.WalletsController,
		);

		expect(controller.check()).toEqual({
			status: 'ok',
			service: 'wallets',
		});
	});

	test('creates a wallet for the authenticated player', async () => {
		const controller = app.get(
			(await import('@/presentation/controllers/wallets.controller'))
				.WalletsController,
		);

		const wallet = await controller.create({
			authenticatedPlayer: {
				playerId: 'player-123',
			},
			headers: {
				authorization: 'Bearer valid-token',
			},
		});

		expect(wallet).toEqual({
			playerId: 'player-123',
			balanceInCents: 0,
		});
	});

	test('rejects duplicate wallet creation with a conflict', async () => {
		const controller = app.get(
			(await import('@/presentation/controllers/wallets.controller'))
				.WalletsController,
		);

		await expect(
			controller.create({
				authenticatedPlayer: {
					playerId: 'player-123',
				},
				headers: {
					authorization: 'Bearer valid-token',
				},
			}),
		).rejects.toThrow('Wallet already exists for player "player-123"');
	});

	test('returns the authenticated player wallet', async () => {
		const controller = app.get(
			(await import('@/presentation/controllers/wallets.controller'))
				.WalletsController,
		);

		const wallet = await controller.me({
			authenticatedPlayer: {
				playerId: 'player-123',
			},
			headers: {
				authorization: 'Bearer valid-token',
			},
		});

		expect(wallet).toEqual({
			playerId: 'player-123',
			balanceInCents: 0,
		});
	});

	test('fails when the authenticated player has no wallet', async () => {
		const controller = app.get(
			(await import('@/presentation/controllers/wallets.controller'))
				.WalletsController,
		);

		await expect(
			controller.me({
				authenticatedPlayer: {
					playerId: 'player-404',
				},
				headers: {
					authorization: 'Bearer valid-token',
				},
			}),
		).rejects.toThrow('Wallet not found for player "player-404"');
	});

	test('documents bearer auth on wallet routes', () => {
		const document = createSwaggerDocument(app);

		expect(document.paths['/']?.post?.security).toEqual([{ bearer: [] }]);
		expect(document.paths['/me']?.get?.security).toEqual([{ bearer: [] }]);
	});
});
