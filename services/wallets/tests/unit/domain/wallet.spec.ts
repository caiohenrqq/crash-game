import { describe, expect, test } from 'bun:test';
import { Wallet } from '@/domain/wallet';

describe('Wallet', () => {
	test('creates a wallet with zero balance for a player', () => {
		const wallet = Wallet.create('player-123');

		expect(wallet.playerId).toBe('player-123');
		expect(wallet.balanceInCents).toBe(0);
	});

	test('credits the wallet with exact integer cents', () => {
		const wallet = Wallet.create('player-123');

		wallet.credit(150);

		expect(wallet.balanceInCents).toBe(150);
	});

	test('rejects non-integer money values', () => {
		const wallet = Wallet.create('player-123');

		expect(() => wallet.credit(10.5)).toThrow(
			'Wallet amounts must be integer cents',
		);
	});

	test('rejects debits that would make the balance negative', () => {
		const wallet = Wallet.create('player-123');

		expect(() => wallet.debit(1)).toThrow('Wallet balance cannot go negative');
	});
});
