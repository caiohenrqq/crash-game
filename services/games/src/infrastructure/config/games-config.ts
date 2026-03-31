import {
	type BaseServiceConfig,
	createBaseServiceConfig,
	type EnvironmentSource,
	getPositiveInteger,
} from '@crash/foundation/config/base-service-config';

export type GamesConfig = BaseServiceConfig & {
	bettingPhaseMs: number;
	activeRoundPhaseMs: number;
};

export function loadGamesConfig(
	environment: EnvironmentSource = process.env,
): GamesConfig {
	const baseConfig = createBaseServiceConfig(environment);

	return {
		...baseConfig,
		bettingPhaseMs: getPositiveInteger(
			environment.BETTING_PHASE_MS,
			'BETTING_PHASE_MS',
		),
		activeRoundPhaseMs: getPositiveInteger(
			environment.ACTIVE_ROUND_PHASE_MS,
			'ACTIVE_ROUND_PHASE_MS',
		),
	};
}

export const gamesConfig = loadGamesConfig();
