import { describe, expect, mock, test } from 'bun:test';
import { WalletSettlementOperation } from '@/domain/wallet-settlement-operation';
import { RabbitMqWalletSettlementBroker } from '@/infrastructure/broker/rabbit-mq-wallet-settlement-broker';

describe('RabbitMqWalletSettlementBroker', () => {
	test('publishes settlement completions with the shared exchange and routing key', async () => {
		const publish = mock(() => true);
		const broker = new RabbitMqWalletSettlementBroker(
			{
				execute: mock(async () => undefined),
			} as never,
			undefined,
			{
				publish,
				assertExchange: mock(async () => undefined),
				assertQueue: mock(async () => undefined),
				bindQueue: mock(async () => undefined),
				consume: mock(async () => undefined),
				ack: mock(() => undefined),
				close: mock(async () => undefined),
			} as never,
		);

		await broker.onModuleInit();

		await broker.publishCompleted({
			operationId: 'operation-1',
			status: 'succeeded',
			rejectionReason: null,
			completedAt: new Date('2026-04-02T12:00:01.000Z'),
		});

		expect(publish).toHaveBeenCalledTimes(1);
	});

	test('replays unpublished settlement completions on module init', async () => {
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
		const broker = new RabbitMqWalletSettlementBroker(
			{
				execute: mock(async () => undefined),
			} as never,
			{
				findUnpublished: mock(async () => [
					WalletSettlementOperation.rehydrate({
						operationId: 'operation-1',
						operationType: 'bet_debit',
						playerId: 'player-123',
						roundId: 7,
						betId: 11,
						amountInCents: 300,
						status: 'succeeded',
						rejectionReason: null,
						occurredAt: new Date('2026-04-02T12:00:00.000Z'),
						publishedAt: null,
					}),
				]),
				findByOperationId: mock(async () => null),
				create: mock(async (operation) => operation),
				save: mock(async (operation) => operation),
			} as never,
			channel as never,
		);

		await broker.onModuleInit();

		expect(publish).toHaveBeenCalledTimes(1);
	});
});
