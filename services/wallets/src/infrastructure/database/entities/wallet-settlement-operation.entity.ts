import { EntitySchema } from '@mikro-orm/core';

export type WalletSettlementOperationEntity = {
	operationId: string;
	operationType: 'bet_debit' | 'cashout_credit' | 'crash_loss';
	playerId: string;
	roundId: number;
	betId: number | null;
	amountInCents: number;
	status: 'requested' | 'succeeded' | 'rejected';
	rejectionReason:
		| 'wallet_not_found'
		| 'insufficient_balance'
		| 'duplicate_operation'
		| 'invalid_request'
		| null;
	occurredAt: Date;
	publishedAt: Date | null;
};

export const WalletSettlementOperationEntitySchema =
	new EntitySchema<WalletSettlementOperationEntity>({
		name: 'WalletSettlementOperationEntity',
		tableName: 'wallet_settlement_operations',
		properties: {
			operationId: {
				type: 'string',
				fieldName: 'operation_id',
				primary: true,
			},
			operationType: {
				type: 'string',
				fieldName: 'operation_type',
			},
			playerId: {
				type: 'string',
				fieldName: 'player_id',
			},
			roundId: {
				type: 'number',
				fieldName: 'round_id',
			},
			betId: {
				type: 'number',
				fieldName: 'bet_id',
				nullable: true,
			},
			amountInCents: {
				type: 'number',
				fieldName: 'amount_in_cents',
			},
			status: {
				type: 'string',
			},
			rejectionReason: {
				type: 'string',
				fieldName: 'rejection_reason',
				nullable: true,
			},
			occurredAt: {
				type: 'datetime',
				fieldName: 'occurred_at',
			},
			publishedAt: {
				type: 'datetime',
				fieldName: 'published_at',
				nullable: true,
			},
		},
	});
