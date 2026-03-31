import { EntitySchema } from '@mikro-orm/core';

export type WalletEntity = {
	id: number;
	playerId: string;
	balanceInCents: number;
};

export const WalletEntitySchema = new EntitySchema<WalletEntity>({
	name: 'WalletEntity',
	tableName: 'wallets',
	properties: {
		id: {
			type: 'number',
			primary: true,
			autoincrement: true,
		},
		playerId: {
			type: 'string',
			unique: true,
		},
		balanceInCents: {
			type: 'number',
		},
	},
});
