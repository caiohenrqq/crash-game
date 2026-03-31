import { Injectable } from '@nestjs/common';
import { Wallet } from '@/domain/wallet';
import { DuplicateWalletError } from './errors/duplicate-wallet.error';
import { WalletRepository } from './ports/wallet.repository';

@Injectable()
export class CreateWalletUseCase {
	constructor(private readonly walletRepository: WalletRepository) {}

	async execute(input: { playerId: string }): Promise<Wallet> {
		const existingWallet = await this.walletRepository.findByPlayerId(
			input.playerId,
		);

		if (existingWallet) throw new DuplicateWalletError(input.playerId);

		return this.walletRepository.create(Wallet.create(input.playerId));
	}
}
