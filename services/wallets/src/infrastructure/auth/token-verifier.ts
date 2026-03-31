export const TOKEN_VERIFIER = Symbol('TOKEN_VERIFIER');

export type ValidatedTokenClaims = {
	sub?: string;
	preferred_username?: string;
	email?: string;
};

export interface TokenVerifier {
	verify(token: string): Promise<ValidatedTokenClaims>;
}
