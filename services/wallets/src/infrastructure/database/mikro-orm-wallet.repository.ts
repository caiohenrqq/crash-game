import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { DuplicateWalletError } from '@/application/errors/duplicate-wallet.error';
import { WalletRepository } from '@/application/ports/wallet.repository';
import { Wallet } from '@/domain/wallet';
import {
	type WalletEntity,
	WalletEntitySchema,
} from './entities/wallet.entity';

@Injectable()
export class MikroOrmWalletRepository extends WalletRepository {
	constructor(private readonly entityManager: EntityManager) {
		super();
	}

	async findByPlayerId(playerId: string): Promise<Wallet | null> {
		const walletEntity = await this.entityManager
			.fork()
			.findOne<WalletEntity>(WalletEntitySchema, {
				playerId,
			});

		if (!walletEntity) return null;

		return Wallet.rehydrate({
			playerId: walletEntity.playerId,
			balanceInCents: walletEntity.balanceInCents,
		});
	}

	async create(wallet: Wallet): Promise<Wallet> {
		const walletEntity: Pick<WalletEntity, 'playerId' | 'balanceInCents'> = {
			playerId: wallet.playerId,
			balanceInCents: wallet.balanceInCents,
		};

		try {
			const entityManager = this.entityManager.fork();
			const entity = entityManager.create(WalletEntitySchema, walletEntity);

			await entityManager.persist(entity).flush();
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

	async save(wallet: Wallet): Promise<Wallet> {
		await this.entityManager.fork().upsert(WalletEntitySchema, {
			playerId: wallet.playerId,
			balanceInCents: wallet.balanceInCents,
		});

		return Wallet.rehydrate({
			playerId: wallet.playerId,
			balanceInCents: wallet.balanceInCents,
		});
	}
}
