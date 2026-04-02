import type { SettlementOperation } from '@/domain/settlement-operation';

export abstract class SettlementOperationRepository {
	abstract create(operation: SettlementOperation): Promise<SettlementOperation>;
	abstract save(operation: SettlementOperation): Promise<SettlementOperation>;
	abstract findByOperationId(
		operationId: string,
	): Promise<SettlementOperation | null>;
	abstract findUnpublished(): Promise<SettlementOperation[]>;
}
