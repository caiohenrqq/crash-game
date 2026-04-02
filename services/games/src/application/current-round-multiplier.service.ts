import { Inject, Injectable } from '@nestjs/common';
import { Round } from '@/domain/round';

export const ACTIVE_ROUND_PHASE_MS = 'ACTIVE_ROUND_PHASE_MS';

@Injectable()
export class CurrentRoundMultiplierService {
	constructor(
		@Inject(ACTIVE_ROUND_PHASE_MS)
		private readonly activeRoundPhaseMs: number,
	) {}

	getCurrentMultiplierInHundredths(round: Round, now: Date): number {
		if (round.state !== 'active' || !round.activatedAt)
			throw new Error(`Round ${round.id} is not active`);

		const elapsedMs = Math.max(0, now.getTime() - round.activatedAt.getTime());
		const clampedElapsedMs = Math.min(this.activeRoundPhaseMs, elapsedMs);
		const growthInHundredths = round.crashPoint.inHundredths - 100;

		return (
			100 +
			Math.floor(
				(growthInHundredths * clampedElapsedMs) / this.activeRoundPhaseMs,
			)
		);
	}
}
