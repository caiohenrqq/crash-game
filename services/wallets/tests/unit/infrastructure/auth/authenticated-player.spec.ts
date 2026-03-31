import { describe, expect, test } from 'bun:test';
import { getAuthenticatedPlayer } from '@/infrastructure/auth/authenticated-player';

describe('getAuthenticatedPlayer', () => {
	test('maps sub to playerId and keeps optional display fields', () => {
		const authenticatedPlayer = getAuthenticatedPlayer({
			sub: 'player-123',
			preferred_username: 'player',
			email: 'player@crash-game.dev',
		});

		expect(authenticatedPlayer).toEqual({
			playerId: 'player-123',
			username: 'player',
			email: 'player@crash-game.dev',
		});
	});

	test('throws when sub is missing', () => {
		expect(() =>
			getAuthenticatedPlayer({
				preferred_username: 'player',
			}),
		).toThrow('Validated token is missing required "sub" claim');
	});
});
