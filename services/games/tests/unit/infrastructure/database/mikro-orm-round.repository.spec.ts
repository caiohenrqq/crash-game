import { describe, expect, mock, test } from 'bun:test';
import { MikroOrmRoundRepository } from '@/infrastructure/database/mikro-orm-round.repository';

describe('MikroOrmRoundRepository', () => {
	test('loads current round bets with a stable ascending order', async () => {
		const find = mock(async (...args) => {
			const [entity] = args;

			if (entity.meta?.className === 'RoundEntity') {
				return [
					{
						id: 1,
						state: 'betting',
						crashPointInHundredths: 200,
						createdAt: new Date('2026-03-31T12:00:00.000Z'),
						activatedAt: null,
						crashedAt: null,
					},
				];
			}

			return [];
		});

		const repository = new MikroOrmRoundRepository({
			fork: mock(() => ({
				find,
			})),
		} as never);

		await repository.findCurrentRound();

		expect(find.mock.calls[1]?.[2]).toEqual({
			orderBy: {
				id: 'asc',
			},
		});
	});

	test('persists bet settlement fields when creating a round', async () => {
		const insert = mock(async () => undefined);
		const repository = new MikroOrmRoundRepository({
			fork: mock(() => ({
				find: mock(async () => []),
				insert,
			})),
		} as never);

		await repository.create({
			id: 1,
			state: 'betting',
			crashPoint: {
				inHundredths: 200,
			},
			createdAt: new Date('2026-03-31T12:00:00.000Z'),
			activatedAt: null,
			crashedAt: null,
			bets: [
				{
					id: 11,
					playerId: 'player-123',
					amountInCents: 300,
					status: 'pending_debit',
					payoutInCents: null,
				},
			],
		} as never);

		expect(insert).toHaveBeenNthCalledWith(2, expect.anything(), {
			roundId: 1,
			playerId: 'player-123',
			amountInCents: 300,
			status: 'pending_debit',
			payoutInCents: null,
		});
	});
});
