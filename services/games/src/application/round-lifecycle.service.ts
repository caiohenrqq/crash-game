import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CrashPoint } from '@/domain/crash-point';
import { Round } from '@/domain/round';
import { gamesConfig } from '@/infrastructure/config/games-config';
import { RoundRepository } from './ports/round.repository';

@Injectable()
export class RoundLifecycleService implements OnModuleInit, OnModuleDestroy {
	private static ownsLifecycle = false;
	private timeoutId: ReturnType<typeof setTimeout> | null = null;

	constructor(private readonly roundRepository: RoundRepository) {}

	async onModuleInit(): Promise<void> {
		if (RoundLifecycleService.ownsLifecycle) return;

		RoundLifecycleService.ownsLifecycle = true;
		const currentRound = await this.ensureCurrentRound();

		this.scheduleRound(currentRound);
	}

	onModuleDestroy(): void {
		RoundLifecycleService.ownsLifecycle = false;
		if (this.timeoutId) clearTimeout(this.timeoutId);
	}

	private async ensureCurrentRound(): Promise<Round> {
		const currentRound = await this.roundRepository.findCurrentRound();

		if (!currentRound) {
			const createdRound = await this.createNextRound(new Date());

			return createdRound;
		}

		return this.reconcileRound(currentRound);
	}

	private async reconcileRound(round: Round): Promise<Round> {
		const now = new Date();
		const bettingEndsAt = new Date(
			round.createdAt.getTime() + gamesConfig.bettingPhaseMs,
		);

		if (round.state === 'betting' && now >= bettingEndsAt) {
			round.activate(bettingEndsAt);
			await this.roundRepository.save(round);
		}

		const activeEndsAt =
			round.activatedAt &&
			new Date(round.activatedAt.getTime() + gamesConfig.activeRoundPhaseMs);

		if (round.state === 'active' && activeEndsAt && now >= activeEndsAt) {
			round.crash(activeEndsAt);
			await this.roundRepository.save(round);
			return this.createNextRound(activeEndsAt);
		}

		if (round.state === 'crashed') return this.createNextRound(now);

		return round;
	}

	private scheduleRound(round: Round): void {
		if (this.timeoutId) clearTimeout(this.timeoutId);

		if (round.state === 'betting') {
			const delay = Math.max(
				0,
				round.createdAt.getTime() + gamesConfig.bettingPhaseMs - Date.now(),
			);

			this.timeoutId = setTimeout(async () => {
				round.activate(
					new Date(round.createdAt.getTime() + gamesConfig.bettingPhaseMs),
				);
				await this.roundRepository.save(round);
				this.scheduleRound(round);
			}, delay);
			return;
		}

		if (round.state === 'active' && round.activatedAt) {
			const activatedAt = round.activatedAt;
			const delay = Math.max(
				0,
				activatedAt.getTime() + gamesConfig.activeRoundPhaseMs - Date.now(),
			);

			this.timeoutId = setTimeout(async () => {
				const crashedAt = new Date(
					activatedAt.getTime() + gamesConfig.activeRoundPhaseMs,
				);
				round.crash(crashedAt);
				await this.roundRepository.save(round);
				const nextRound = await this.createNextRound(crashedAt);
				this.scheduleRound(nextRound);
			}, delay);
		}
	}

	private async createNextRound(createdAt: Date): Promise<Round> {
		const nextRoundId = await this.roundRepository.getNextRoundId();
		const round = Round.start({
			id: nextRoundId,
			crashPoint: CrashPoint.fromHundredths(200),
			createdAt,
		});

		return this.roundRepository.create(round);
	}
}
