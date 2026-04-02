export type EnvironmentSource = Record<string, string | undefined>;

export type BaseServiceConfig = {
	port: number;
	databaseUrl: string;
	rabbitMqUrl: string;
	keycloakIssuerUrl: string;
	keycloakAudience: string;
	nodeEnv: string;
	apiDocsEnabled: boolean;
	rateLimitTtlMs: number;
	rateLimitMaxRequests: number;
};

export function createBaseServiceConfig(
	environment: EnvironmentSource,
): BaseServiceConfig {
	return {
		port: getPositiveInteger(environment.PORT, 'PORT'),
		databaseUrl: getRequiredString(environment.DATABASE_URL, 'DATABASE_URL'),
		rabbitMqUrl: getRequiredString(environment.RABBITMQ_URL, 'RABBITMQ_URL'),
		keycloakIssuerUrl: getRequiredString(
			environment.KEYCLOAK_ISSUER_URL,
			'KEYCLOAK_ISSUER_URL',
		),
		keycloakAudience: getRequiredString(
			environment.KEYCLOAK_AUDIENCE,
			'KEYCLOAK_AUDIENCE',
		),
		nodeEnv: environment.NODE_ENV ?? 'development',
		apiDocsEnabled:
			getOptionalBoolean(environment.ENABLE_API_DOCS, 'ENABLE_API_DOCS') ??
			(environment.NODE_ENV ?? 'development') !== 'production',
		rateLimitTtlMs: getPositiveIntegerWithDefault(
			environment.RATE_LIMIT_TTL_MS,
			'RATE_LIMIT_TTL_MS',
			60000,
		),
		rateLimitMaxRequests: getPositiveIntegerWithDefault(
			environment.RATE_LIMIT_MAX_REQUESTS,
			'RATE_LIMIT_MAX_REQUESTS',
			60,
		),
	};
}

export function getRequiredString(
	value: string | undefined,
	key: string,
): string {
	if (!value) throw new Error(`Missing required environment variable "${key}"`);

	return value;
}

export function getPositiveInteger(
	value: string | undefined,
	key: string,
): number {
	const parsedValue = Number.parseInt(getRequiredString(value, key), 10);

	if (!Number.isInteger(parsedValue) || parsedValue <= 0)
		throw new Error(`Environment variable "${key}" must be a positive integer`);

	return parsedValue;
}

export function getPositiveIntegerWithDefault(
	value: string | undefined,
	key: string,
	defaultValue: number,
): number {
	if (!value) return defaultValue;

	return getPositiveInteger(value, key);
}

export function getOptionalBoolean(
	value: string | undefined,
	key: string,
): boolean | undefined {
	if (!value) return undefined;
	if (value === 'true') return true;
	if (value === 'false') return false;

	throw new Error(`Environment variable "${key}" must be "true" or "false"`);
}
