export type EnvironmentSource = Record<string, string | undefined>;

export type BaseServiceConfig = {
	port: number;
	databaseUrl: string;
	rabbitMqUrl: string;
	keycloakIssuerUrl: string;
	keycloakAudience: string;
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
	};
}

export function getRequiredString(
	value: string | undefined,
	key: string,
): string {
	if (!value) {
		throw new Error(`Missing required environment variable "${key}"`);
	}

	return value;
}

export function getPositiveInteger(
	value: string | undefined,
	key: string,
): number {
	const parsedValue = Number.parseInt(getRequiredString(value, key), 10);

	if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
		throw new Error(`Environment variable "${key}" must be a positive integer`);
	}

	return parsedValue;
}
