export type BetStatus =
	| 'pending_debit'
	| 'accepted'
	| 'debit_rejected'
	| 'cashed_out'
	| 'lost';

export class Bet {
	private constructor(
		public readonly id: number | null,
		public readonly roundId: number | null,
		public readonly playerId: string,
		public readonly amountInCents: number,
		private currentStatus: BetStatus,
		private currentPayoutInCents: number | null,
	) {
		if (!playerId.trim()) throw new Error('Bet playerId is required');
		if (!Number.isInteger(amountInCents))
			throw new Error('Bet amount must be integer cents');
		if (amountInCents <= 0)
			throw new Error('Bet amount must be greater than zero');
	}

	static place(props: {
		id?: number | null;
		roundId?: number | null;
		playerId: string;
		amountInCents: number;
		status?: BetStatus;
		payoutInCents?: number | null;
	}): Bet {
		return new Bet(
			props.id ?? null,
			props.roundId ?? null,
			props.playerId,
			props.amountInCents,
			props.status ?? 'accepted',
			props.payoutInCents ?? null,
		);
	}

	get status(): BetStatus {
		return this.currentStatus;
	}

	get payoutInCents(): number | null {
		return this.currentPayoutInCents;
	}

	markAccepted(): void {
		this.currentStatus = 'accepted';
	}

	markDebitRejected(): void {
		this.currentStatus = 'debit_rejected';
	}

	markLost(): void {
		this.currentStatus = 'lost';
	}

	markCashedOut(payoutInCents: number): void {
		if (!Number.isInteger(payoutInCents))
			throw new Error('Bet payout must be integer cents');
		if (payoutInCents <= 0)
			throw new Error('Bet payout must be greater than zero');

		this.currentStatus = 'cashed_out';
		this.currentPayoutInCents = payoutInCents;
	}
}
