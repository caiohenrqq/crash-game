import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { SettlementOperationRepository } from '@/application/ports/settlement-operation.repository';
import { SettlementOperation } from '@/domain/settlement-operation';
import {
	type SettlementOperationEntity,
	SettlementOperationEntitySchema,
} from './entities/settlement-operation.entity';

@Injectable()
export class MikroOrmSettlementOperationRepository extends SettlementOperationRepository {
	constructor(private readonly entityManager: EntityManager) {
		super();
	}

	async create(operation: SettlementOperation): Promise<SettlementOperation> {
		await this.entityManager.fork().insert(SettlementOperationEntitySchema, {
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
			completedAt: operation.completedAt,
		});

		return operation;
	}

	async save(operation: SettlementOperation): Promise<SettlementOperation> {
		await this.entityManager.fork().nativeUpdate(
			SettlementOperationEntitySchema,
			{
				operationId: operation.operationId,
			},
			{
				status: operation.status,
				rejectionReason: operation.rejectionReason,
				publishedAt: operation.publishedAt,
				completedAt: operation.completedAt,
			},
		);

		return operation;
	}

	async findByOperationId(
		operationId: string,
	): Promise<SettlementOperation | null> {
		const operationEntity = await this.entityManager
			.fork()
			.findOne<SettlementOperationEntity>(SettlementOperationEntitySchema, {
				operationId,
			});

		if (!operationEntity) return null;

		return SettlementOperation.rehydrate({
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
			completedAt: operationEntity.completedAt,
		});
	}

	async findUnpublished(): Promise<SettlementOperation[]> {
		const operationEntities = await this.entityManager
			.fork()
			.find<SettlementOperationEntity>(SettlementOperationEntitySchema, {
				publishedAt: null,
			});

		return operationEntities.map((operationEntity) =>
			SettlementOperation.rehydrate({
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
				completedAt: operationEntity.completedAt,
			}),
		);
	}
}
