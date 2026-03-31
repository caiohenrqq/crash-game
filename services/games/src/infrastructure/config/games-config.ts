import {
	type BaseServiceConfig,
	createBaseServiceConfig,
	type EnvironmentSource,
} from '@crash/foundation/config/base-service-config';

export type GamesConfig = BaseServiceConfig;

export function loadGamesConfig(
	environment: EnvironmentSource = process.env,
): GamesConfig {
	return createBaseServiceConfig(environment);
}

export const gamesConfig = loadGamesConfig();
