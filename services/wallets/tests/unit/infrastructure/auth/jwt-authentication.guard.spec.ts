import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { createHttpExecutionContext } from '@crash/foundation/testing/http-execution-context';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { JwtAuthenticationGuard } from '@/infrastructure/auth/jwt-authentication.guard';
import { IS_PUBLIC_ROUTE } from '@/infrastructure/auth/public.decorator';
import { TOKEN_VERIFIER } from '@/infrastructure/auth/token-verifier';

describe('JwtAuthenticationGuard', () => {
	const verify = mock(async () => ({
		sub: 'player-123',
		preferred_username: 'player',
		email: 'player@crash-game.dev',
	}));

	const reflector = new Reflector();
	const guard = new JwtAuthenticationGuard(reflector, {
		verify,
	});

	beforeEach(() => {
		verify.mockClear();
	});

	test('attaches the authenticated player from a bearer token', async () => {
		const request: AuthenticatedRequest = {
			headers: {
				authorization: 'Bearer signed.jwt.token',
			},
		};

		const result = await guard.canActivate(createHttpExecutionContext(request));

		expect(result).toBe(true);
		expect(verify).toHaveBeenCalledWith('signed.jwt.token');
		expect(request.authenticatedPlayer).toEqual({
			playerId: 'player-123',
			username: 'player',
			email: 'player@crash-game.dev',
		});
	});

	test('rejects requests without a bearer token', async () => {
		await expect(
			guard.canActivate(
				createHttpExecutionContext({
					headers: {},
				}),
			),
		).rejects.toThrow('Missing bearer token');
	});

	test('allows public routes without requiring a bearer token', async () => {
		const handler = () => undefined;
		Reflect.defineMetadata(IS_PUBLIC_ROUTE, true, handler);
		const context = createHttpExecutionContext(
			{
				headers: {},
			},
			handler,
		);

		expect(await guard.canActivate(context)).toBe(true);
		expect(verify).not.toHaveBeenCalled();
	});
});

void TOKEN_VERIFIER;
