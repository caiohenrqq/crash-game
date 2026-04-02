import { describe, expect, test } from 'bun:test';
import { InMemorySettlementCompletionCoordinator } from '@/application/in-memory-settlement-completion-coordinator';

describe('InMemorySettlementCompletionCoordinator', () => {
	test('waits for a completion and resolves when notified', async () => {
		const coordinator = new InMemorySettlementCompletionCoordinator();
		const waitingCompletion = coordinator.waitForCompletion('operation-1');

		coordinator.notify({
			operationId: 'operation-1',
			status: 'succeeded',
			rejectionReason: null,
			completedAt: new Date('2026-04-02T12:00:01.000Z'),
		});

		await expect(waitingCompletion).resolves.toEqual({
			operationId: 'operation-1',
			status: 'succeeded',
			rejectionReason: null,
			completedAt: new Date('2026-04-02T12:00:01.000Z'),
		});
	});
});
