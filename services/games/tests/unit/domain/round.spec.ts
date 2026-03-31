import { describe, expect, test } from 'bun:test';
import { Bet } from '@/domain/bet';
import { CrashPoint } from '@/domain/crash-point';
import { Round } from '@/domain/round';

describe('Round', () => {
	test('starts in betting state and accepts one bet per player', () => {
		const round = Round.start({
			id: 1,
			crashPoint: CrashPoint.fromHundredths(250),
			createdAt: new Date('2026-03-31T12:00:00.000Z'),
		});

		round.placeBet(
			Bet.place({
				playerId: 'player-123',
				amountInCents: 100,
			}),
		);

		expect(round.state).toBe('betting');
		expect(round.bets).toHaveLength(1);
	});

	test('rejects duplicate bets for the same player in a round', () => {
		const round = Round.start({
			id: 1,
			crashPoint: CrashPoint.fromHundredths(250),
			createdAt: new Date('2026-03-31T12:00:00.000Z'),
		});

		round.placeBet(
			Bet.place({
				playerId: 'player-123',
				amountInCents: 100,
			}),
		);

		expect(() =>
			round.placeBet(
				Bet.place({
					playerId: 'player-123',
					amountInCents: 200,
				}),
			),
		).toThrow('Bet already exists for player "player-123" in round 1');
	});

	test('moves from betting to active to crashed', () => {
		const round = Round.start({
			id: 1,
			crashPoint: CrashPoint.fromHundredths(250),
			createdAt: new Date('2026-03-31T12:00:00.000Z'),
		});

		round.activate(new Date('2026-03-31T12:00:05.000Z'));
		round.crash(new Date('2026-03-31T12:00:10.000Z'));

		expect(round.state).toBe('crashed');
		expect(round.activatedAt?.toISOString()).toBe('2026-03-31T12:00:05.000Z');
		expect(round.crashedAt?.toISOString()).toBe('2026-03-31T12:00:10.000Z');
	});

	test('rejects betting after the round starts', () => {
		const round = Round.start({
			id: 1,
			crashPoint: CrashPoint.fromHundredths(250),
			createdAt: new Date('2026-03-31T12:00:00.000Z'),
		});

		round.activate(new Date('2026-03-31T12:00:05.000Z'));

		expect(() =>
			round.placeBet(
				Bet.place({
					playerId: 'player-123',
					amountInCents: 100,
				}),
			),
		).toThrow('Round 1 is not accepting bets');
	});
});
