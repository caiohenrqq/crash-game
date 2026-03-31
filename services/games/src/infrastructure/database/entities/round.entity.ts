import { EntitySchema } from '@mikro-orm/core';

export type RoundStateEntity = 'betting' | 'active' | 'crashed';

export type RoundEntity = {
	id: number;
	state: RoundStateEntity;
	crashPointInHundredths: number;
	createdAt: Date;
	activatedAt: Date | null;
	crashedAt: Date | null;
};

export const RoundEntitySchema = new EntitySchema<RoundEntity>({
	name: 'RoundEntity',
	tableName: 'rounds',
	properties: {
		id: {
			type: 'number',
			primary: true,
		},
		state: {
			type: 'string',
		},
		crashPointInHundredths: {
			type: 'number',
			fieldName: 'crash_point_in_hundredths',
		},
		createdAt: {
			type: 'datetime',
			fieldName: 'created_at',
		},
		activatedAt: {
			type: 'datetime',
			fieldName: 'activated_at',
			nullable: true,
		},
		crashedAt: {
			type: 'datetime',
			fieldName: 'crashed_at',
			nullable: true,
		},
	},
});
