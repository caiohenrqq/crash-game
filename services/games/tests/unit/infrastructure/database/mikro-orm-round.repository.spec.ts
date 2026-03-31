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
});
