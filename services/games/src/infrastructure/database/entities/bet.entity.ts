import { EntitySchema } from '@mikro-orm/core';

export type BetEntity = {
	id: number;
	roundId: number;
	playerId: string;
	amountInCents: number;
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
	},
	indexes: [
		{
			properties: ['roundId', 'playerId'],
			name: 'bets_round_id_player_id_unique',
			type: 'unique',
		},
	],
});
