import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { DuplicateWalletError } from '@/application/errors/duplicate-wallet.error';
import { WalletRepository } from '@/application/ports/wallet.repository';
import { Wallet } from '@/domain/wallet';
import type { WalletEntity } from './entities/wallet.entity';

@Injectable()
export class MikroOrmWalletRepository extends WalletRepository {
	constructor(
		private readonly walletRepository: EntityRepository<WalletEntity>,
	) {
		super();
	}

	async findByPlayerId(playerId: string): Promise<Wallet | null> {
		const walletEntity = await this.walletRepository.findOne({
			playerId,
		});

		if (!walletEntity) return null;

		return Wallet.rehydrate({
			playerId: walletEntity.playerId,
			balanceInCents: walletEntity.balanceInCents,
		});
	}

	async create(wallet: Wallet): Promise<Wallet> {
		const walletEntity = this.walletRepository.create({
			playerId: wallet.playerId,
			balanceInCents: wallet.balanceInCents,
		});

		try {
			await this.walletRepository
				.getEntityManager()
				.persist(walletEntity)
				.flush();
		} catch (error) {
			const databaseError = error as { code?: string };

			if (databaseError.code === '23505')
				throw new DuplicateWalletError(wallet.playerId);

			throw error;
		}

		return Wallet.rehydrate({
			playerId: walletEntity.playerId,
			balanceInCents: walletEntity.balanceInCents,
		});
	}
}
