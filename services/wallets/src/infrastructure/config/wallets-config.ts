import {
	type BaseServiceConfig,
	createBaseServiceConfig,
	type EnvironmentSource,
} from '@crash/foundation/config/base-service-config';

export type WalletsConfig = BaseServiceConfig;

export function loadWalletsConfig(
	environment: EnvironmentSource = process.env,
): WalletsConfig {
	return createBaseServiceConfig(environment);
}

export const walletsConfig = loadWalletsConfig();
