import { describe, expect, test } from 'bun:test';
import { CreateWalletUseCase } from '@/application/create-wallet.use-case';
import { DuplicateWalletError } from '@/application/errors/duplicate-wallet.error';
import { Wallet } from '@/domain/wallet';

describe('CreateWalletUseCase', () => {
	test('creates a zero-balance wallet for a new player', async () => {
		const createdWallets: Wallet[] = [];
		const useCase = new CreateWalletUseCase({
			findByPlayerId: async () => null,
			create: async (wallet) => {
				createdWallets.push(wallet);
				return wallet;
			},
		});

		const wallet = await useCase.execute({
			playerId: 'player-123',
		});

		expect(createdWallets).toHaveLength(1);
		expect(wallet.playerId).toBe('player-123');
		expect(wallet.balanceInCents).toBe(0);
	});

	test('rejects duplicate wallet creation for the same player', async () => {
		const useCase = new CreateWalletUseCase({
			findByPlayerId: async () => Wallet.create('player-123'),
			create: async (wallet) => wallet,
		});

		await expect(
			useCase.execute({
				playerId: 'player-123',
			}),
		).rejects.toBeInstanceOf(DuplicateWalletError);
	});
});
