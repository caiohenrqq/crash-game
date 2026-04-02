import { beforeEach, describe, expect, test } from 'bun:test';
import {
	AuthenticatedPlayerThrottlerGuard,
	createHttpThrottlerOptions,
} from '@crash/foundation/nest/http-throttler';
import { createHttpExecutionContext } from '@crash/foundation/testing/http-execution-context';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorageService } from '@nestjs/throttler';

describe('createHttpThrottlerOptions', () => {
	test('returns a default throttler definition from shared service config', () => {
		expect(
			createHttpThrottlerOptions({
				rateLimitTtlMs: 30000,
				rateLimitMaxRequests: 25,
			}),
		).toEqual([
			{
				name: 'default',
				ttl: 30000,
				limit: 25,
				setHeaders: false,
			},
		]);
	});
});

describe('AuthenticatedPlayerThrottlerGuard', () => {
	let guard: AuthenticatedPlayerThrottlerGuard;

	beforeEach(async () => {
		guard = new AuthenticatedPlayerThrottlerGuard(
			createHttpThrottlerOptions({
				rateLimitTtlMs: 1000,
				rateLimitMaxRequests: 1,
			}),
			new ThrottlerStorageService(),
			new Reflector(),
		);
		await guard.onModuleInit();
	});

	test('tracks authenticated requests by player id', async () => {
		const handler = function routeHandler() {
			return undefined;
		};

		expect(
			await guard.canActivate(
				createHttpExecutionContext(
					{
						authenticatedPlayer: {
							playerId: 'player-123',
						},
						ip: '10.0.0.1',
					},
					handler,
				),
			),
		).toBe(true);

		await expect(
			guard.canActivate(
				createHttpExecutionContext(
					{
						authenticatedPlayer: {
							playerId: 'player-123',
						},
						ip: '10.0.0.2',
					},
					handler,
				),
			),
		).rejects.toThrow();

		expect(
			await guard.canActivate(
				createHttpExecutionContext(
					{
						authenticatedPlayer: {
							playerId: 'player-456',
						},
						ip: '10.0.0.1',
					},
					handler,
				),
			),
		).toBe(true);
	});
});
