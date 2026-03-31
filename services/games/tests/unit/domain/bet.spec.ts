import { describe, expect, test } from 'bun:test';
import { Bet } from '@/domain/bet';

describe('Bet', () => {
	test('creates a bet with exact integer cents', () => {
		const bet = Bet.place({
			playerId: 'player-123',
			amountInCents: 100,
		});

		expect(bet.playerId).toBe('player-123');
		expect(bet.amountInCents).toBe(100);
	});

	test('rejects non-integer amounts', () => {
		expect(() =>
			Bet.place({
				playerId: 'player-123',
				amountInCents: 100.5,
			}),
		).toThrow('Bet amount must be integer cents');
	});

	test('rejects blank player ids', () => {
		expect(() =>
			Bet.place({
				playerId: '   ',
				amountInCents: 100,
			}),
		).toThrow('Bet playerId is required');
	});
});
