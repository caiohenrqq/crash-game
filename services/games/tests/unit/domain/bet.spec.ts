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
		expect(bet.roundId).toBeNull();
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

	test('supports settlement statuses for a persisted bet', () => {
		const bet = Bet.place({
			id: 9,
			roundId: 7,
			playerId: 'player-123',
			amountInCents: 100,
			status: 'pending_debit',
		});

		bet.markAccepted();

		expect(bet.id).toBe(9);
		expect(bet.roundId).toBe(7);
		expect(bet.status).toBe('accepted');
	});

	test('can be marked as debit rejected', () => {
		const bet = Bet.place({
			playerId: 'player-123',
			amountInCents: 100,
			status: 'pending_debit',
		});

		bet.markDebitRejected();

		expect(bet.status).toBe('debit_rejected');
	});
});
