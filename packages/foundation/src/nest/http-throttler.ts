import { Injectable } from '@nestjs/common';
import {
	ThrottlerGuard,
	type ThrottlerModuleOptions,
	type ThrottlerOptions,
} from '@nestjs/throttler';

export function createHttpThrottlerOptions(config: {
	rateLimitTtlMs: number;
	rateLimitMaxRequests: number;
}): ThrottlerModuleOptions {
	return [
		{
			name: 'default',
			ttl: config.rateLimitTtlMs,
			limit: config.rateLimitMaxRequests,
			setHeaders: false,
		},
	] satisfies ThrottlerOptions[];
}

@Injectable()
export class AuthenticatedPlayerThrottlerGuard extends ThrottlerGuard {
	protected async getTracker(
		request: Record<string, unknown>,
	): Promise<string> {
		const authenticatedPlayer = request.authenticatedPlayer as
			| { playerId?: string }
			| undefined;

		if (authenticatedPlayer?.playerId)
			return `player:${authenticatedPlayer.playerId}`;

		if (Array.isArray(request.ips)) {
			const forwardedIp = request.ips.find(
				(ip): ip is string => typeof ip === 'string' && ip.length > 0,
			);

			if (forwardedIp) return forwardedIp;
		}

		if (typeof request.ip === 'string' && request.ip.length > 0)
			return request.ip;

		return super.getTracker(request);
	}
}
