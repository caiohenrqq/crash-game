import { describe, expect, mock, test } from 'bun:test';
import { SettlementOperation } from '@/domain/settlement-operation';
import { MikroOrmSettlementOperationRepository } from '@/infrastructure/database/mikro-orm-settlement-operation.repository';

describe('MikroOrmSettlementOperationRepository', () => {
	test('maps a persisted settlement operation into the domain model', async () => {
		const repository = new MikroOrmSettlementOperationRepository({
			fork: mock(() => ({
				findOne: mock(async () => ({
					operationId: 'operation-1',
					operationType: 'bet_debit',
					playerId: 'player-123',
					roundId: 7,
					betId: 11,
					amountInCents: 300,
					status: 'requested',
					rejectionReason: null,
					occurredAt: new Date('2026-04-02T12:00:00.000Z'),
					publishedAt: null,
					completedAt: null,
				})),
				find: mock(async () => []),
			})),
		} as never);

		const operation = await repository.findByOperationId('operation-1');

		expect(operation).toEqual(
			SettlementOperation.rehydrate({
				operationId: 'operation-1',
				operationType: 'bet_debit',
				playerId: 'player-123',
				roundId: 7,
				betId: 11,
				amountInCents: 300,
				status: 'requested',
				rejectionReason: null,
				occurredAt: new Date('2026-04-02T12:00:00.000Z'),
				publishedAt: null,
				completedAt: null,
			}),
		);
	});

	test('persists a new settlement operation with its idempotency key', async () => {
		const insert = mock(async () => undefined);
		const repository = new MikroOrmSettlementOperationRepository({
			fork: mock(() => ({
				findOne: mock(async () => null),
				find: mock(async () => []),
				insert,
				nativeUpdate: mock(async () => 1),
			})),
		} as never);

		await repository.create(
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

		expect(insert).toHaveBeenNthCalledWith(1, expect.anything(), {
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 300,
			status: 'requested',
			rejectionReason: null,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
			publishedAt: null,
			completedAt: null,
		});
	});
});
