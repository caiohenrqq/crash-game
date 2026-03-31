export class CrashPoint {
	private constructor(private readonly valueInHundredths: number) {
		if (!Number.isInteger(valueInHundredths))
			throw new Error('Crash Point must use integer hundredths');

		if (valueInHundredths < 100)
			throw new Error('Crash Point must be at least 1.00x');
	}

	static fromHundredths(valueInHundredths: number): CrashPoint {
		return new CrashPoint(valueInHundredths);
	}

	get inHundredths(): number {
		return this.valueInHundredths;
	}

	toDisplayValue(): string {
		return (this.valueInHundredths / 100).toFixed(2);
	}
}
