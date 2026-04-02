import type { WalletSettlementOperation } from '@/domain/wallet-settlement-operation';

export abstract class WalletSettlementOperationRepository {
	abstract findByOperationId(
		operationId: string,
	): Promise<WalletSettlementOperation | null>;
	abstract create(
		operation: WalletSettlementOperation,
	): Promise<WalletSettlementOperation>;
	abstract save(
		operation: WalletSettlementOperation,
	): Promise<WalletSettlementOperation>;
	abstract findUnpublished(): Promise<WalletSettlementOperation[]>;
}
