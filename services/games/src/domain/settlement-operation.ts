export type SettlementOperationType =
	| 'bet_debit'
	| 'cashout_credit'
	| 'crash_loss';

export type SettlementOperationStatus = 'requested' | 'succeeded' | 'rejected';

export type SettlementRejectionReason =
	| 'wallet_not_found'
	| 'insufficient_balance'
	| 'duplicate_operation'
	| 'invalid_request';

export class SettlementOperation {
	private constructor(
		public readonly operationId: string,
		public readonly operationType: SettlementOperationType,
		public readonly playerId: string,
		public readonly roundId: number,
		public readonly betId: number | null,
		public readonly amountInCents: number,
		private currentStatus: SettlementOperationStatus,
		private currentRejectionReason: SettlementRejectionReason | null,
		public readonly occurredAt: Date,
		private currentPublishedAt: Date | null,
		private currentCompletedAt: Date | null,
	) {}

	static request(props: {
		operationId: string;
		operationType: SettlementOperationType;
		playerId: string;
		roundId: number;
		betId: number | null;
		amountInCents: number;
		occurredAt: Date;
	}): SettlementOperation {
		return new SettlementOperation(
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
			null,
		);
	}

	static rehydrate(props: {
		operationId: string;
		operationType: SettlementOperationType;
		playerId: string;
		roundId: number;
		betId: number | null;
		amountInCents: number;
		status: SettlementOperationStatus;
		rejectionReason: SettlementRejectionReason | null;
		occurredAt: Date;
		publishedAt: Date | null;
		completedAt: Date | null;
	}): SettlementOperation {
		return new SettlementOperation(
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
			props.completedAt,
		);
	}

	get status(): SettlementOperationStatus {
		return this.currentStatus;
	}

	get rejectionReason(): SettlementRejectionReason | null {
		return this.currentRejectionReason;
	}

	get publishedAt(): Date | null {
		return this.currentPublishedAt;
	}

	get completedAt(): Date | null {
		return this.currentCompletedAt;
	}

	markPublished(publishedAt: Date): void {
		this.currentPublishedAt = publishedAt;
	}

	markSucceeded(completedAt: Date): void {
		this.currentStatus = 'succeeded';
		this.currentRejectionReason = null;
		this.currentCompletedAt = completedAt;
	}

	markRejected(
		rejectionReason: SettlementRejectionReason,
		completedAt: Date,
	): void {
		this.currentStatus = 'rejected';
		this.currentRejectionReason = rejectionReason;
		this.currentCompletedAt = completedAt;
	}
}
