import { Injectable } from '@nestjs/common';
import { SettlementCompletionNotifier } from './ports/settlement-completion-notifier';
import type { SettlementCompletion } from './ports/settlement-requester';

@Injectable()
export class InMemorySettlementCompletionCoordinator
	implements SettlementCompletionNotifier
{
	private readonly pendingCompletions = new Map<
		string,
		(completion: SettlementCompletion) => void
	>();

	waitForCompletion(operationId: string): Promise<SettlementCompletion> {
		return new Promise((resolve) => {
			this.pendingCompletions.set(operationId, resolve);
		});
	}

	notify(completion: SettlementCompletion): void {
		const pendingCompletion = this.pendingCompletions.get(
			completion.operationId,
		);

		if (!pendingCompletion) return;

		this.pendingCompletions.delete(completion.operationId);
		pendingCompletion(completion);
	}
}
