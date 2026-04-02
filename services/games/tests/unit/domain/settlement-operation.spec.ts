import { describe, expect, test } from 'bun:test';
import { SettlementOperation } from '@/domain/settlement-operation';

describe('SettlementOperation', () => {
	test('starts as requested and can be marked published then succeeded', () => {
		const operation = SettlementOperation.request({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 4,
			betId: 12,
			amountInCents: 500,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		operation.markPublished(new Date('2026-04-02T12:00:01.000Z'));
		operation.markSucceeded(new Date('2026-04-02T12:00:02.000Z'));

		expect(operation.status).toBe('succeeded');
		expect(operation.publishedAt?.toISOString()).toBe(
			'2026-04-02T12:00:01.000Z',
		);
		expect(operation.completedAt?.toISOString()).toBe(
			'2026-04-02T12:00:02.000Z',
		);
	});

	test('can be marked rejected with a rejection reason', () => {
		const operation = SettlementOperation.request({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 4,
			betId: 12,
			amountInCents: 500,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		operation.markRejected(
			'insufficient_balance',
			new Date('2026-04-02T12:00:02.000Z'),
		);

		expect(operation.status).toBe('rejected');
		expect(operation.rejectionReason).toBe('insufficient_balance');
	});
});
