export class Bet {
	private constructor(
		public readonly playerId: string,
		public readonly amountInCents: number,
	) {
		if (!playerId.trim()) throw new Error('Bet playerId is required');
		if (!Number.isInteger(amountInCents))
			throw new Error('Bet amount must be integer cents');
		if (amountInCents <= 0)
			throw new Error('Bet amount must be greater than zero');
	}

	static place(props: { playerId: string; amountInCents: number }): Bet {
		return new Bet(props.playerId, props.amountInCents);
	}
}
