import {
	CanActivate,
	type ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getAuthenticatedPlayer } from './authenticated-player';
import { IS_PUBLIC_ROUTE } from './public.decorator';
import { TOKEN_VERIFIER, type TokenVerifier } from './token-verifier';

@Injectable()
export class JwtAuthenticationGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		@Inject(TOKEN_VERIFIER) private readonly tokenVerifier: TokenVerifier,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (
			this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
				context.getHandler(),
				context.getClass(),
			])
		) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = getBearerToken(request.headers.authorization);
		const claims = await this.tokenVerifier.verify(token);

		request.authenticatedPlayer = getAuthenticatedPlayer(claims);

		return true;
	}
}

function getBearerToken(authorizationHeader: string | undefined): string {
	if (!authorizationHeader?.startsWith('Bearer ')) {
		throw new UnauthorizedException('Missing bearer token');
	}

	return authorizationHeader.slice('Bearer '.length);
}
