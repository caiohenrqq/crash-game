export const SETTLEMENT_EXCHANGE = 'settlement';
export const SETTLEMENT_REQUESTED_QUEUE = 'wallets.settlement.requested';
export const SETTLEMENT_COMPLETED_QUEUE = 'games.settlement.completed';
export const SETTLEMENT_REQUESTED_ROUTING_KEY = 'wallet.settlement.requested';
export const SETTLEMENT_COMPLETED_ROUTING_KEY = 'wallet.settlement.completed';

export type SettlementRequestedMessage = {
	operationId: string;
	operationType: 'bet_debit' | 'cashout_credit' | 'crash_loss';
	playerId: string;
	roundId: number;
	betId: number | null;
	amountInCents: number;
	occurredAt: string;
};

export type SettlementCompletedMessage = {
	operationId: string;
	status: 'succeeded' | 'rejected';
	rejectionReason:
		| 'wallet_not_found'
		| 'insufficient_balance'
		| 'duplicate_operation'
		| 'invalid_request'
		| null;
	completedAt: string;
};
