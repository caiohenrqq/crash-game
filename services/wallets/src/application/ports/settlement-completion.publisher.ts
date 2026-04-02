import type { WalletSettlementRejectionReason } from '@/domain/wallet-settlement-operation';

export type WalletSettlementCompletion = {
	operationId: string;
	status: 'succeeded' | 'rejected';
	rejectionReason: WalletSettlementRejectionReason | null;
	completedAt: Date;
};

export abstract class SettlementCompletionPublisher {
	abstract publishCompleted(
		completion: WalletSettlementCompletion,
	): Promise<void>;
}
