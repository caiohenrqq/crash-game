import type {
	SettlementOperation,
	SettlementRejectionReason,
} from '@/domain/settlement-operation';

export type SettlementCompletion = {
	operationId: string;
	status: 'succeeded' | 'rejected';
	rejectionReason: SettlementRejectionReason | null;
	completedAt: Date;
};

export abstract class SettlementRequester {
	abstract publishRequested(operation: SettlementOperation): Promise<void>;
	abstract waitForCompletion(
		operationId: string,
	): Promise<SettlementCompletion>;
}
