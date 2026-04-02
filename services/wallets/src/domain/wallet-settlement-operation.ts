export type WalletSettlementOperationType =
	| 'bet_debit'
	| 'cashout_credit'
	| 'crash_loss';

export type WalletSettlementOperationStatus =
	| 'requested'
	| 'succeeded'
	| 'rejected';

export type WalletSettlementRejectionReason =
	| 'wallet_not_found'
	| 'insufficient_balance'
	| 'duplicate_operation'
	| 'invalid_request';

export class WalletSettlementOperation {
	private constructor(
		public readonly operationId: string,
		public readonly operationType: WalletSettlementOperationType,
		public readonly playerId: string,
		public readonly roundId: number,
		public readonly betId: number | null,
		public readonly amountInCents: number,
		private currentStatus: WalletSettlementOperationStatus,
		private currentRejectionReason: WalletSettlementRejectionReason | null,
		public readonly occurredAt: Date,
		private currentPublishedAt: Date | null,
	) {}

	static request(props: {
		operationId: string;
		operationType: WalletSettlementOperationType;
		playerId: string;
		roundId: number;
		betId: number | null;
		amountInCents: number;
		occurredAt: Date;
	}): WalletSettlementOperation {
		return new WalletSettlementOperation(
			props.operationId,
			props.operationType,
			props.playerId,
			props.roundId,
			props.betId,
			props.amountInCents,
			'requested',
			null,
			props.occurredAt,
			null,
		);
	}

	static rehydrate(props: {
		operationId: string;
		operationType: WalletSettlementOperationType;
		playerId: string;
		roundId: number;
		betId: number | null;
		amountInCents: number;
		status: WalletSettlementOperationStatus;
		rejectionReason: WalletSettlementRejectionReason | null;
		occurredAt: Date;
		publishedAt: Date | null;
	}): WalletSettlementOperation {
		return new WalletSettlementOperation(
			props.operationId,
			props.operationType,
			props.playerId,
			props.roundId,
			props.betId,
			props.amountInCents,
			props.status,
			props.rejectionReason,
			props.occurredAt,
			props.publishedAt,
		);
	}

	get status(): WalletSettlementOperationStatus {
		return this.currentStatus;
	}

	get rejectionReason(): WalletSettlementRejectionReason | null {
		return this.currentRejectionReason;
	}

	get publishedAt(): Date | null {
		return this.currentPublishedAt;
	}

	markSucceeded(): void {
		this.currentStatus = 'succeeded';
		this.currentRejectionReason = null;
	}

	markRejected(rejectionReason: WalletSettlementRejectionReason): void {
		this.currentStatus = 'rejected';
		this.currentRejectionReason = rejectionReason;
	}

	markPublished(publishedAt: Date): void {
		this.currentPublishedAt = publishedAt;
	}
}
