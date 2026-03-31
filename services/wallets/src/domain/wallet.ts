export class Wallet {
	private currentBalanceInCents: number;

	private constructor(
		public readonly playerId: string,
		balanceInCents: number,
	) {
		this.assertPlayerId(playerId);
		this.assertIntegerCents(balanceInCents);

		if (balanceInCents < 0)
			throw new Error('Wallet balance cannot go negative');

		this.currentBalanceInCents = balanceInCents;
	}

	static create(playerId: string): Wallet {
		return new Wallet(playerId, 0);
	}

	static rehydrate(props: {
		playerId: string;
		balanceInCents: number;
	}): Wallet {
		return new Wallet(props.playerId, props.balanceInCents);
	}

	get balanceInCents(): number {
		return this.currentBalanceInCents;
	}

	credit(amountInCents: number): void {
		this.assertPositiveIntegerCents(amountInCents);
		this.currentBalanceInCents += amountInCents;
	}

	debit(amountInCents: number): void {
		this.assertPositiveIntegerCents(amountInCents);

		if (this.currentBalanceInCents - amountInCents < 0)
			throw new Error('Wallet balance cannot go negative');

		this.currentBalanceInCents -= amountInCents;
	}

	private assertPlayerId(playerId: string): void {
		if (!playerId.trim()) throw new Error('Wallet playerId is required');
	}

	private assertIntegerCents(amountInCents: number): void {
		if (!Number.isInteger(amountInCents))
			throw new Error('Wallet amounts must be integer cents');
	}

	private assertPositiveIntegerCents(amountInCents: number): void {
		this.assertIntegerCents(amountInCents);

		if (amountInCents <= 0)
			throw new Error('Wallet amounts must be greater than zero');
	}
}
