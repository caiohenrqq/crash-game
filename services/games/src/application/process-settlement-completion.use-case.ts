import { Injectable } from '@nestjs/common';
import { BetRepository } from './ports/bet.repository';
import { SettlementCompletionNotifier } from './ports/settlement-completion-notifier';
import { SettlementOperationRepository } from './ports/settlement-operation.repository';
import { type SettlementCompletion } from './ports/settlement-requester';

@Injectable()
export class ProcessSettlementCompletionUseCase {
	constructor(
		private readonly betRepository: BetRepository,
		private readonly settlementOperationRepository: SettlementOperationRepository,
		private readonly settlementCompletionNotifier: SettlementCompletionNotifier,
	) {}

	async execute(completion: SettlementCompletion): Promise<void> {
		const operation =
			await this.settlementOperationRepository.findByOperationId(
				completion.operationId,
			);

		if (!operation)
			throw new Error(
				`Settlement operation "${completion.operationId}" was not found`,
			);

		if (operation.status !== 'requested') {
			this.settlementCompletionNotifier.notify(completion);
			return;
		}

		if (completion.status === 'succeeded') {
			operation.markSucceeded(completion.completedAt);
			if (operation.betId !== null) {
				const bet = await this.betRepository.findById(operation.betId);

				if (!bet) throw new Error(`Bet ${operation.betId} was not found`);

				if (operation.operationType === 'bet_debit') bet.markAccepted();
				if (operation.operationType === 'cashout_credit')
					bet.markCashedOut(operation.amountInCents);
				if (operation.operationType === 'crash_loss') bet.markLost();
				await this.betRepository.save(bet);
			}
		} else {
			operation.markRejected(
				completion.rejectionReason ?? 'invalid_request',
				completion.completedAt,
			);
			if (operation.betId !== null) {
				const bet = await this.betRepository.findById(operation.betId);

				if (!bet) throw new Error(`Bet ${operation.betId} was not found`);

				bet.markDebitRejected();
				await this.betRepository.save(bet);
			}
		}

		await this.settlementOperationRepository.save(operation);
		this.settlementCompletionNotifier.notify(completion);
	}
}
