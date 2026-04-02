import { describe, expect, mock, test } from 'bun:test';
import { SettlementOperation } from '@/domain/settlement-operation';

describe('RabbitMqGamesSettlementBroker', () => {
	test('publishes settlement requests with the shared exchange and routing key', async () => {
		process.env.PORT = '4001';
		process.env.DATABASE_URL = 'postgresql://admin:admin@localhost:5432/games';
		process.env.RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
		process.env.KEYCLOAK_ISSUER_URL = 'http://localhost:8080/realms/crash-game';
		process.env.KEYCLOAK_AUDIENCE = 'crash-game-client';
		process.env.BETTING_PHASE_MS = '1000';
		process.env.ACTIVE_ROUND_PHASE_MS = '1000';

		const publish = mock(() => true);
		const { RabbitMqGamesSettlementBroker } = await import(
			'@/infrastructure/broker/rabbit-mq-games-settlement-broker'
		);
		const channel = {
			publish,
			assertExchange: mock(async () => undefined),
			assertQueue: mock(async () => undefined),
			bindQueue: mock(async () => undefined),
			consume: mock(async () => undefined),
			ack: mock(() => undefined),
			close: mock(async () => undefined),
		};
		const broker = new RabbitMqGamesSettlementBroker(
			{
				execute: mock(async () => undefined),
			} as never,
			{
				waitForCompletion: mock(async () => {
					throw new Error('not used');
				}),
				notify: mock(() => undefined),
			} as never,
			undefined,
			channel as never,
		);

		await broker.onModuleInit();

		await broker.publishRequested(
			SettlementOperation.request({
				operationId: 'operation-1',
				operationType: 'bet_debit',
				playerId: 'player-123',
				roundId: 7,
				betId: 11,
				amountInCents: 300,
				occurredAt: new Date('2026-04-02T12:00:00.000Z'),
			}),
		);

		expect(publish).toHaveBeenCalledTimes(1);
	});

	test('replays unpublished settlement requests on module init', async () => {
		process.env.PORT = '4001';
		process.env.DATABASE_URL = 'postgresql://admin:admin@localhost:5432/games';
		process.env.RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
		process.env.KEYCLOAK_ISSUER_URL = 'http://localhost:8080/realms/crash-game';
		process.env.KEYCLOAK_AUDIENCE = 'crash-game-client';
		process.env.BETTING_PHASE_MS = '1000';
		process.env.ACTIVE_ROUND_PHASE_MS = '1000';

		const publish = mock(() => true);
		const channel = {
			publish,
			assertExchange: mock(async () => undefined),
			assertQueue: mock(async () => undefined),
			bindQueue: mock(async () => undefined),
			consume: mock(async () => undefined),
			ack: mock(() => undefined),
			close: mock(async () => undefined),
		};
		const { RabbitMqGamesSettlementBroker } = await import(
			'@/infrastructure/broker/rabbit-mq-games-settlement-broker'
		);
		const broker = new RabbitMqGamesSettlementBroker(
			{
				execute: mock(async () => undefined),
			} as never,
			{
				waitForCompletion: mock(async () => {
					throw new Error('not used');
				}),
				notify: mock(() => undefined),
			} as never,
			{
				findUnpublished: mock(async () => [
					SettlementOperation.request({
						operationId: 'operation-1',
						operationType: 'bet_debit',
						playerId: 'player-123',
						roundId: 7,
						betId: 11,
						amountInCents: 300,
						occurredAt: new Date('2026-04-02T12:00:00.000Z'),
					}),
				]),
				save: mock(async (operation) => operation),
				create: mock(async (operation) => operation),
				findByOperationId: mock(async () => null),
			} as never,
			channel as never,
		);

		await broker.onModuleInit();

		expect(publish).toHaveBeenCalledTimes(1);
	});
});
