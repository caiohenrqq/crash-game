import { describe, expect, mock, test } from 'bun:test';
import { WalletSettlementOperation } from '@/domain/wallet-settlement-operation';
import { MikroOrmWalletSettlementOperationRepository } from '@/infrastructure/database/mikro-orm-wallet-settlement-operation.repository';

describe('MikroOrmWalletSettlementOperationRepository', () => {
	test('maps a persisted wallet settlement operation into the domain model', async () => {
		const repository = new MikroOrmWalletSettlementOperationRepository({
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
				})),
				insert: mock(async () => undefined),
				nativeUpdate: mock(async () => 1),
				find: mock(async () => []),
			})),
		} as never);

		const operation = await repository.findByOperationId('operation-1');

		expect(operation).toEqual(
			WalletSettlementOperation.rehydrate({
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
			}),
		);
	});

	test('persists a new wallet settlement operation with its idempotency key', async () => {
		const insert = mock(async () => undefined);
		const repository = new MikroOrmWalletSettlementOperationRepository({
			fork: mock(() => ({
				findOne: mock(async () => null),
				insert,
				nativeUpdate: mock(async () => 1),
				find: mock(async () => []),
			})),
		} as never);

		await repository.create(
			WalletSettlementOperation.request({
				operationId: 'operation-1',
				operationType: 'bet_debit',
				playerId: 'player-123',
				roundId: 7,
				betId: 11,
				amountInCents: 300,
				occurredAt: new Date('2026-04-02T12:00:00.000Z'),
			}),
		);

		expect(insert).toHaveBeenCalledTimes(1);
	});
});
