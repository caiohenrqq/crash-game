import { describe, expect, test } from 'bun:test';
import { WalletSettlementOperation } from '@/domain/wallet-settlement-operation';

describe('WalletSettlementOperation', () => {
	test('starts as requested and can be marked succeeded', () => {
		const operation = WalletSettlementOperation.request({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 4,
			betId: 12,
			amountInCents: 500,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		operation.markSucceeded();
		operation.markPublished(new Date('2026-04-02T12:00:01.000Z'));

		expect(operation.status).toBe('succeeded');
		expect(operation.publishedAt?.toISOString()).toBe(
			'2026-04-02T12:00:01.000Z',
		);
	});

	test('can be marked rejected with a rejection reason', () => {
		const operation = WalletSettlementOperation.request({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 4,
			betId: 12,
			amountInCents: 500,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		operation.markRejected('duplicate_operation');

		expect(operation.status).toBe('rejected');
		expect(operation.rejectionReason).toBe('duplicate_operation');
	});
});
