import { describe, expect, test } from 'bun:test';

describe('loadGamesConfig', () => {
	test('returns parsed service config from an explicit environment source', async () => {
		process.env.BETTING_PHASE_MS = '5000';
		process.env.ACTIVE_ROUND_PHASE_MS = '10000';
		const { loadGamesConfig } = await import(
			'@/infrastructure/config/games-config'
		);
		const config = loadGamesConfig({
			PORT: '4001',
			DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
			RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
			KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
			KEYCLOAK_AUDIENCE: 'crash-game-client',
			BETTING_PHASE_MS: '5000',
			ACTIVE_ROUND_PHASE_MS: '10000',
		});

		expect(config.port).toBe(4001);
		expect(config.databaseUrl).toBe(
			'postgresql://admin:admin@localhost:5432/games',
		);
		expect(config.bettingPhaseMs).toBe(5000);
		expect(config.activeRoundPhaseMs).toBe(10000);
	});
});
