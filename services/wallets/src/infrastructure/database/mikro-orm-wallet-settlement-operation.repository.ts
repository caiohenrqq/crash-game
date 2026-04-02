import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { WalletSettlementOperationRepository } from '@/application/ports/wallet-settlement-operation.repository';
import { WalletSettlementOperation } from '@/domain/wallet-settlement-operation';
import {
	type WalletSettlementOperationEntity,
	WalletSettlementOperationEntitySchema,
} from './entities/wallet-settlement-operation.entity';

@Injectable()
export class MikroOrmWalletSettlementOperationRepository extends WalletSettlementOperationRepository {
	constructor(private readonly entityManager: EntityManager) {
		super();
	}

	async findByOperationId(
		operationId: string,
	): Promise<WalletSettlementOperation | null> {
		const operationEntity = await this.entityManager
			.fork()
			.findOne<WalletSettlementOperationEntity>(
				WalletSettlementOperationEntitySchema,
				{
					operationId,
				},
			);

		if (!operationEntity) return null;

		return WalletSettlementOperation.rehydrate({
			operationId: operationEntity.operationId,
			operationType: operationEntity.operationType,
			playerId: operationEntity.playerId,
			roundId: operationEntity.roundId,
			betId: operationEntity.betId,
			amountInCents: operationEntity.amountInCents,
			status: operationEntity.status,
			rejectionReason: operationEntity.rejectionReason,
			occurredAt: operationEntity.occurredAt,
			publishedAt: operationEntity.publishedAt,
		});
	}

	async create(
		operation: WalletSettlementOperation,
	): Promise<WalletSettlementOperation> {
		await this.entityManager
			.fork()
			.insert(WalletSettlementOperationEntitySchema, {
				operationId: operation.operationId,
				operationType: operation.operationType,
				playerId: operation.playerId,
				roundId: operation.roundId,
				betId: operation.betId,
				amountInCents: operation.amountInCents,
				status: operation.status,
				rejectionReason: operation.rejectionReason,
				occurredAt: operation.occurredAt,
				publishedAt: operation.publishedAt,
			});

		return operation;
	}

	async save(
		operation: WalletSettlementOperation,
	): Promise<WalletSettlementOperation> {
		await this.entityManager.fork().nativeUpdate(
			WalletSettlementOperationEntitySchema,
			{
				operationId: operation.operationId,
			},
			{
				status: operation.status,
				rejectionReason: operation.rejectionReason,
				publishedAt: operation.publishedAt,
			},
		);

		return operation;
	}

	async findUnpublished(): Promise<WalletSettlementOperation[]> {
		const operationEntities = await this.entityManager
			.fork()
			.find<WalletSettlementOperationEntity>(
				WalletSettlementOperationEntitySchema,
				{
					publishedAt: null,
				},
			);

		return operationEntities.map((operationEntity) =>
			WalletSettlementOperation.rehydrate({
				operationId: operationEntity.operationId,
				operationType: operationEntity.operationType,
				playerId: operationEntity.playerId,
				roundId: operationEntity.roundId,
				betId: operationEntity.betId,
				amountInCents: operationEntity.amountInCents,
				status: operationEntity.status,
				rejectionReason: operationEntity.rejectionReason,
				occurredAt: operationEntity.occurredAt,
				publishedAt: operationEntity.publishedAt,
			}),
		);
	}
}
