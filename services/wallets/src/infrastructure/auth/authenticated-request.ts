import type { AuthenticatedPlayer } from './authenticated-player';

export type AuthenticatedRequest = {
	headers: {
		authorization?: string;
	};
	authenticatedPlayer?: AuthenticatedPlayer;
};
