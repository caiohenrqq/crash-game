import { describe, expect, test } from 'bun:test';
import { loadGamesConfig } from '@/infrastructure/config/games-config';

describe('loadGamesConfig', () => {
	test('returns parsed service config from an explicit environment source', () => {
		const config = loadGamesConfig({
			PORT: '4001',
			DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
			RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
			KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
			KEYCLOAK_AUDIENCE: 'crash-game-client',
		});

		expect(config.port).toBe(4001);
		expect(config.databaseUrl).toBe(
			'postgresql://admin:admin@localhost:5432/games',
		);
	});
});
