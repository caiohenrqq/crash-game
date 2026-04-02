import { describe, expect, mock, test } from 'bun:test';
import { Bet } from '@/domain/bet';
import { MikroOrmBetRepository } from '@/infrastructure/database/mikro-orm-bet.repository';

describe('MikroOrmBetRepository', () => {
	test('maps a persisted bet entity into the domain model', async () => {
		const repository = new MikroOrmBetRepository({
			fork: mock(() => ({
				findOne: mock(async () => ({
					id: 11,
					roundId: 7,
					playerId: 'player-123',
					amountInCents: 300,
					status: 'pending_debit',
					payoutInCents: null,
				})),
				insert: mock(async () => 11),
				nativeUpdate: mock(async () => 1),
				find: mock(async () => []),
			})),
		} as never);

		const bet = await repository.findByRoundIdAndPlayerId(7, 'player-123');

		expect(bet).toEqual(
			Bet.place({
				id: 11,
				roundId: 7,
				playerId: 'player-123',
				amountInCents: 300,
				status: 'pending_debit',
				payoutInCents: null,
			}),
		);
	});

	test('persists a new pending bet and returns it with the inserted id', async () => {
		const insert = mock(async () => 11);
		const repository = new MikroOrmBetRepository({
			fork: mock(() => ({
				findOne: mock(async () => null),
				insert,
				nativeUpdate: mock(async () => 1),
				find: mock(async () => []),
			})),
		} as never);

		const bet = await repository.create(
			Bet.place({
				roundId: 7,
				playerId: 'player-123',
				amountInCents: 300,
				status: 'pending_debit',
			}),
		);

		expect(insert).toHaveBeenCalledTimes(1);
		expect(bet.id).toBe(11);
		expect(bet.roundId).toBe(7);
		expect(bet.status).toBe('pending_debit');
	});
});
