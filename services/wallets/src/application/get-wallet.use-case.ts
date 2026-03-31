import { Injectable } from '@nestjs/common';
import type { Wallet } from '@/domain/wallet';
import { WalletNotFoundError } from './errors/wallet-not-found.error';
import { WalletRepository } from './ports/wallet.repository';

@Injectable()
export class GetWalletUseCase {
	constructor(private readonly walletRepository: WalletRepository) {}

	async execute(input: { playerId: string }): Promise<Wallet> {
		const wallet = await this.walletRepository.findByPlayerId(input.playerId);

		if (!wallet) throw new WalletNotFoundError(input.playerId);

		return wallet;
	}
}
