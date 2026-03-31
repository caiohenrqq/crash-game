import type { Round } from '@/domain/round';

export abstract class RoundRepository {
	abstract findCurrentRound(): Promise<Round | null>;
	abstract save(round: Round): Promise<Round>;
	abstract create(round: Round): Promise<Round>;
	abstract getNextRoundId(): Promise<number>;
}
