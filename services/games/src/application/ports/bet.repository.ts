import type { Bet } from '@/domain/bet';

export abstract class BetRepository {
	abstract findByRoundIdAndPlayerId(
		roundId: number,
		playerId: string,
	): Promise<Bet | null>;
	abstract findById(id: number): Promise<Bet | null>;
	abstract create(bet: Bet): Promise<Bet>;
	abstract save(bet: Bet): Promise<Bet>;
	abstract findAcceptedByRoundId(roundId: number): Promise<Bet[]>;
}
