import { Injectable } from '@nestjs/common';
import type { WalletSettlementRejectionReason } from '@/domain/wallet-settlement-operation';
import { WalletSettlementOperation } from '@/domain/wallet-settlement-operation';
import { SettlementCompletionPublisher } from './ports/settlement-completion.publisher';
import { WalletRepository } from './ports/wallet.repository';
import { WalletSettlementOperationRepository } from './ports/wallet-settlement-operation.repository';

@Injectable()
export class HandleSettlementRequestUseCase {
	constructor(
		private readonly walletRepository: WalletRepository,
		private readonly walletSettlementOperationRepository: WalletSettlementOperationRepository,
		private readonly settlementCompletionPublisher: SettlementCompletionPublisher,
	) {}

	async execute(input: {
		operationId: string;
		operationType: 'bet_debit' | 'cashout_credit' | 'crash_loss';
		playerId: string;
		roundId: number;
		betId: number | null;
		amountInCents: number;
		occurredAt: Date;
	}): Promise<{
		operationId: string;
		status: 'succeeded' | 'rejected';
		rejectionReason: WalletSettlementRejectionReason | null;
		completedAt: Date;
	}> {
		const existingOperation =
			await this.walletSettlementOperationRepository.findByOperationId(
				input.operationId,
			);

		if (existingOperation) {
			return {
				operationId: existingOperation.operationId,
				status:
					existingOperation.status === 'succeeded' ? 'succeeded' : 'rejected',
				rejectionReason: existingOperation.rejectionReason,
				completedAt: existingOperation.publishedAt ?? input.occurredAt,
			};
		}

		const operation = await this.walletSettlementOperationRepository.create(
			WalletSettlementOperation.request(input),
		);
		const completedAt = new Date();
		const wallet = await this.walletRepository.findByPlayerId(input.playerId);

		if (!wallet) {
			operation.markRejected('wallet_not_found');
			await this.walletSettlementOperationRepository.save(operation);
			const completion = this.toCompletion(operation, completedAt);
			await this.settlementCompletionPublisher.publishCompleted(completion);
			operation.markPublished(completedAt);
			await this.walletSettlementOperationRepository.save(operation);
			return completion;
		}

		try {
			if (input.operationType === 'bet_debit') {
				wallet.debit(input.amountInCents);
				await this.walletRepository.save(wallet);
			}
			if (input.operationType === 'cashout_credit') {
				wallet.credit(input.amountInCents);
				await this.walletRepository.save(wallet);
			}
			operation.markSucceeded();
		} catch {
			operation.markRejected('insufficient_balance');
		}

		await this.walletSettlementOperationRepository.save(operation);

		const completion = this.toCompletion(operation, completedAt);

		await this.settlementCompletionPublisher.publishCompleted(completion);
		operation.markPublished(completedAt);
		await this.walletSettlementOperationRepository.save(operation);

		return completion;
	}

	private toCompletion(
		operation: WalletSettlementOperation,
		completedAt: Date,
	): {
		operationId: string;
		status: 'succeeded' | 'rejected';
		rejectionReason: WalletSettlementRejectionReason | null;
		completedAt: Date;
	} {
		return {
			operationId: operation.operationId,
			status: operation.status === 'succeeded' ? 'succeeded' : 'rejected',
			rejectionReason: operation.rejectionReason,
			completedAt,
		};
	}
}
