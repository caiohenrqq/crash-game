import { Bet } from './bet';
import { CrashPoint } from './crash-point';

export type RoundState = 'betting' | 'active' | 'crashed';

export class Round {
	private readonly currentBets: Bet[];

	private constructor(
		public readonly id: number,
		public readonly crashPoint: CrashPoint,
		public readonly createdAt: Date,
		private currentState: RoundState,
		bets: Bet[],
		public readonly activatedAt: Date | null,
		public readonly crashedAt: Date | null,
	) {
		this.currentBets = [...bets];
	}

	static start(props: {
		id: number;
		crashPoint: CrashPoint;
		createdAt: Date;
	}): Round {
		return new Round(
			props.id,
			props.crashPoint,
			props.createdAt,
			'betting',
			[],
			null,
			null,
		);
	}

	static rehydrate(props: {
		id: number;
		crashPoint: CrashPoint;
		createdAt: Date;
		state: RoundState;
		bets: Bet[];
		activatedAt: Date | null;
		crashedAt: Date | null;
	}): Round {
		return new Round(
			props.id,
			props.crashPoint,
			props.createdAt,
			props.state,
			props.bets,
			props.activatedAt,
			props.crashedAt,
		);
	}

	get state(): RoundState {
		return this.currentState;
	}

	get bets(): Bet[] {
		return [...this.currentBets];
	}

	placeBet(bet: Bet): void {
		if (this.currentState !== 'betting')
			throw new Error(`Round ${this.id} is not accepting bets`);

		const existingBet = this.currentBets.find(
			(currentBet) => currentBet.playerId === bet.playerId,
		);

		if (existingBet)
			throw new Error(
				`Bet already exists for player "${bet.playerId}" in round ${this.id}`,
			);

		this.currentBets.push(bet);
	}

	activate(activatedAt: Date): void {
		if (this.currentState !== 'betting')
			throw new Error(
				`Round ${this.id} cannot move to active from ${this.currentState}`,
			);

		this.currentState = 'active';
		(this as { activatedAt: Date }).activatedAt = activatedAt;
	}

	crash(crashedAt: Date): void {
		if (this.currentState !== 'active')
			throw new Error(
				`Round ${this.id} cannot move to crashed from ${this.currentState}`,
			);

		this.currentState = 'crashed';
		(this as { crashedAt: Date }).crashedAt = crashedAt;
	}
}
