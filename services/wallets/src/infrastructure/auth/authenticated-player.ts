export type AuthenticatedPlayer = {
	playerId: string;
	username?: string;
	email?: string;
};

type ValidatedTokenClaims = {
	sub?: string;
	preferred_username?: string;
	email?: string;
};

export function getAuthenticatedPlayer(
	claims: ValidatedTokenClaims,
): AuthenticatedPlayer {
	if (!claims.sub) {
		throw new Error('Validated token is missing required "sub" claim');
	}

	return {
		playerId: claims.sub,
		username: claims.preferred_username,
		email: claims.email,
	};
}
