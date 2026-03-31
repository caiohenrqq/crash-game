import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { TokenVerifier, ValidatedTokenClaims } from './token-verifier';

export class JoseTokenVerifier implements TokenVerifier {
	private readonly remoteJwkSet: ReturnType<typeof createRemoteJWKSet>;

	constructor(
		private readonly issuer: string,
		private readonly audience: string,
	) {
		this.remoteJwkSet = createRemoteJWKSet(
			new URL(`${issuer}/protocol/openid-connect/certs`),
		);
	}

	async verify(token: string): Promise<ValidatedTokenClaims> {
		const { payload } = await jwtVerify(token, this.remoteJwkSet, {
			issuer: this.issuer,
			audience: this.audience,
		});

		return {
			sub: payload.sub,
			preferred_username:
				typeof payload.preferred_username === 'string'
					? payload.preferred_username
					: undefined,
			email: typeof payload.email === 'string' ? payload.email : undefined,
		};
	}
}
