import { EntitySchema } from '@mikro-orm/core';

export type BetEntity = {
	id: number;
	roundId: number;
	playerId: string;
	amountInCents: number;
	status:
		| 'pending_debit'
		| 'accepted'
		| 'debit_rejected'
		| 'cashed_out'
		| 'lost';
	payoutInCents: number | null;
};

export const BetEntitySchema = new EntitySchema<BetEntity>({
	name: 'BetEntity',
	tableName: 'bets',
	properties: {
		id: {
			type: 'number',
			primary: true,
			autoincrement: true,
		},
		roundId: {
			type: 'number',
			fieldName: 'round_id',
		},
		playerId: {
			type: 'string',
			fieldName: 'player_id',
		},
		amountInCents: {
			type: 'number',
			fieldName: 'amount_in_cents',
		},
		status: {
			type: 'string',
		},
		payoutInCents: {
			type: 'number',
			fieldName: 'payout_in_cents',
			nullable: true,
		},
	},
	indexes: [
		{
			properties: ['roundId', 'playerId'],
			name: 'bets_round_id_player_id_unique',
			type: 'unique',
		},
	],
});
