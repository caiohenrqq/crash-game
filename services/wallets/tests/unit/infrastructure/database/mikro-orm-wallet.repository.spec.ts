import { describe, expect, mock, test } from 'bun:test';
import { DuplicateWalletError } from '@/application/errors/duplicate-wallet.error';
import { Wallet } from '@/domain/wallet';
import { MikroOrmWalletRepository } from '@/infrastructure/database/mikro-orm-wallet.repository';

describe('MikroOrmWalletRepository', () => {
	test('maps a persisted wallet entity into the domain model', async () => {
		const entityManager = {
			findOne: mock(async () => ({
				id: 1,
				playerId: 'player-123',
				balanceInCents: 250,
			})),
		};
		const repository = new MikroOrmWalletRepository({
			fork: mock(() => entityManager),
		} as never);

		const wallet = await repository.findByPlayerId('player-123');

		expect(wallet).toEqual(
			Wallet.rehydrate({
				playerId: 'player-123',
				balanceInCents: 250,
			}),
		);
	});

	test('translates unique violations into duplicate wallet errors', async () => {
		const entityManager = {
			create: mock((input) => input),
			persist: mock(() => ({
				flush: mock(async () => {
					throw {
						code: '23505',
					};
				}),
			})),
		};
		const repository = new MikroOrmWalletRepository({
			fork: mock(() => entityManager),
		} as never);

		await expect(
			repository.create(Wallet.create('player-123')),
		).rejects.toBeInstanceOf(DuplicateWalletError);
	});

	test('persists balance updates through save', async () => {
		const upsert = mock(async () => undefined);
		const repository = new MikroOrmWalletRepository({
			fork: mock(() => ({
				upsert,
			})),
		} as never);
		const wallet = Wallet.rehydrate({
			playerId: 'player-123',
			balanceInCents: 250,
		});

		wallet.credit(50);
		await repository.save(wallet);

		expect(upsert).toHaveBeenCalledTimes(1);
	});
});
