import type { Wallet } from '@/domain/wallet';

export abstract class WalletRepository {
	abstract findByPlayerId(playerId: string): Promise<Wallet | null>;
	abstract create(wallet: Wallet): Promise<Wallet>;
}
