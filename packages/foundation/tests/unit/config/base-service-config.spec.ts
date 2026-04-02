import { describe, expect, test } from 'bun:test';
import { createBaseServiceConfig } from '@crash/foundation/config/base-service-config';

describe('createBaseServiceConfig', () => {
	test('returns parsed shared service config from environment values', () => {
		const config = createBaseServiceConfig({
			PORT: '4001',
			DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
			RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
			KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
			KEYCLOAK_AUDIENCE: 'crash-game-client',
			NODE_ENV: 'development',
			ENABLE_API_DOCS: 'false',
			RATE_LIMIT_TTL_MS: '30000',
			RATE_LIMIT_MAX_REQUESTS: '25',
		});

		expect(config).toEqual({
			port: 4001,
			databaseUrl: 'postgresql://admin:admin@localhost:5432/games',
			rabbitMqUrl: 'amqp://admin:admin@localhost:5672',
			keycloakIssuerUrl: 'http://localhost:8080/realms/crash-game',
			keycloakAudience: 'crash-game-client',
			nodeEnv: 'development',
			apiDocsEnabled: false,
			rateLimitTtlMs: 30000,
			rateLimitMaxRequests: 25,
		});
	});

	test('defaults api docs to disabled in production and rate limiting to safe shared values', () => {
		const config = createBaseServiceConfig({
			PORT: '4001',
			DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
			RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
			KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
			KEYCLOAK_AUDIENCE: 'crash-game-client',
			NODE_ENV: 'production',
		});

		expect(config.apiDocsEnabled).toBe(false);
		expect(config.rateLimitTtlMs).toBe(60000);
		expect(config.rateLimitMaxRequests).toBe(60);
	});

	test('throws when a required environment variable is missing', () => {
		expect(() =>
			createBaseServiceConfig({
				PORT: '4001',
				DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
				RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
				KEYCLOAK_AUDIENCE: 'crash-game-client',
			}),
		).toThrow('Missing required environment variable "KEYCLOAK_ISSUER_URL"');
	});

	test('throws when port is not a positive integer', () => {
		expect(() =>
			createBaseServiceConfig({
				PORT: '-1',
				DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
				RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
				KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
				KEYCLOAK_AUDIENCE: 'crash-game-client',
			}),
		).toThrow('Environment variable "PORT" must be a positive integer');
	});

	test('throws when api docs env is not a boolean value', () => {
		expect(() =>
			createBaseServiceConfig({
				PORT: '4001',
				DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
				RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
				KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
				KEYCLOAK_AUDIENCE: 'crash-game-client',
				ENABLE_API_DOCS: 'sometimes',
			}),
		).toThrow(
			'Environment variable "ENABLE_API_DOCS" must be "true" or "false"',
		);
	});
});
