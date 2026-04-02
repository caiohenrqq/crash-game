import type { SettlementCompletion } from './settlement-requester';

export abstract class SettlementCompletionNotifier {
	abstract notify(completion: SettlementCompletion): void;
}
