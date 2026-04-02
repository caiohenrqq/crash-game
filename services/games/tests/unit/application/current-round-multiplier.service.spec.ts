import { describe, expect, test } from 'bun:test';
import { CurrentRoundMultiplierService } from '@/application/current-round-multiplier.service';
import { CrashPoint } from '@/domain/crash-point';
import { Round } from '@/domain/round';

describe('CurrentRoundMultiplierService', () => {
	test('computes a deterministic active-round multiplier from elapsed time', () => {
		const activatedAt = new Date('2026-04-02T12:00:10.000Z');
		const round = Round.start({
			id: 7,
			crashPoint: CrashPoint.fromHundredths(300),
			createdAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		round.activate(activatedAt);

		const service = new CurrentRoundMultiplierService(10_000);

		expect(
			service.getCurrentMultiplierInHundredths(
				round,
				new Date('2026-04-02T12:00:15.000Z'),
			),
		).toBe(200);
	});
});
