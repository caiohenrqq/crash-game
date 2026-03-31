import { describe, expect, mock, test } from 'bun:test';
import { DuplicateWalletError } from '@/application/errors/duplicate-wallet.error';
import { Wallet } from '@/domain/wallet';
import { MikroOrmWalletRepository } from '@/infrastructure/database/mikro-orm-wallet.repository';

describe('MikroOrmWalletRepository', () => {
	test('maps a persisted wallet entity into the domain model', async () => {
		const repository = new MikroOrmWalletRepository({
			findOne: mock(async () => ({
				id: 1,
				playerId: 'player-123',
				balanceInCents: 250,
			})),
			create: mock((input) => input),
			getEntityManager: mock(() => ({
				persistAndFlush: mock(async () => undefined),
			})),
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
		const repository = new MikroOrmWalletRepository({
			findOne: mock(async () => null),
			create: mock((input) => input),
			getEntityManager: mock(() => ({
				persist: mock(() => ({
					flush: mock(async () => {
						throw {
							code: '23505',
						};
					}),
				})),
			})),
		} as never);

		await expect(
			repository.create(Wallet.create('player-123')),
		).rejects.toBeInstanceOf(DuplicateWalletError);
	});
});
