import { describe, expect, test } from 'bun:test';
import { WalletNotFoundError } from '@/application/errors/wallet-not-found.error';
import { GetWalletUseCase } from '@/application/get-wallet.use-case';
import { Wallet } from '@/domain/wallet';

describe('GetWalletUseCase', () => {
	test('returns the wallet for the authenticated player', async () => {
		const existingWallet = Wallet.create('player-123');
		existingWallet.credit(250);

		const useCase = new GetWalletUseCase({
			findByPlayerId: async () => existingWallet,
			create: async (wallet) => wallet,
			save: async (wallet) => wallet,
		});

		const wallet = await useCase.execute({
			playerId: 'player-123',
		});

		expect(wallet.playerId).toBe('player-123');
		expect(wallet.balanceInCents).toBe(250);
	});

	test('fails when the wallet does not exist', async () => {
		const useCase = new GetWalletUseCase({
			findByPlayerId: async () => null,
			create: async (wallet) => wallet,
			save: async (wallet) => wallet,
		});

		await expect(
			useCase.execute({
				playerId: 'player-123',
			}),
		).rejects.toBeInstanceOf(WalletNotFoundError);
	});
});
