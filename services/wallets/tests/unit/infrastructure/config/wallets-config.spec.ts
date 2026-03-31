import { describe, expect, test } from 'bun:test';
import { loadWalletsConfig } from '@/infrastructure/config/wallets-config';

describe('loadWalletsConfig', () => {
	test('returns parsed service config from an explicit environment source', () => {
		const config = loadWalletsConfig({
			PORT: '4002',
			DATABASE_URL: 'postgresql://admin:admin@localhost:5432/wallets',
			RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
			KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
			KEYCLOAK_AUDIENCE: 'crash-game-client',
		});

		expect(config.port).toBe(4002);
		expect(config.databaseUrl).toBe(
			'postgresql://admin:admin@localhost:5432/wallets',
		);
	});
});
