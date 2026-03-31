import { describe, expect, test } from 'bun:test';

describe('getMikroOrmConfig', () => {
	test('builds a PostgreSQL config with service-local migrations', async () => {
		process.env.BETTING_PHASE_MS = '5000';
		process.env.ACTIVE_ROUND_PHASE_MS = '10000';
		const [{ loadGamesConfig }, { getMikroOrmConfig }] = await Promise.all([
			import('@/infrastructure/config/games-config'),
			import('@/infrastructure/database/mikro-orm.config'),
		]);
		const config = getMikroOrmConfig(
			loadGamesConfig({
				PORT: '4001',
				DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
				RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
				KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
				KEYCLOAK_AUDIENCE: 'crash-game-client',
				BETTING_PHASE_MS: '5000',
				ACTIVE_ROUND_PHASE_MS: '10000',
			}),
		);

		expect(config.clientUrl).toBe(
			'postgresql://admin:admin@localhost:5432/games',
		);
		expect(config.entities).toHaveLength(2);
		expect(config.discovery?.warnWhenNoEntities).toBe(false);
		expect(config.migrations?.path).toEndWith(
			'/src/infrastructure/database/migrations',
		);
		expect(config.migrations?.glob).toBe('!(*.d).{js,ts,cjs}');
	});

	test('uses the database URL from the parsed service config', async () => {
		process.env.BETTING_PHASE_MS = '5000';
		process.env.ACTIVE_ROUND_PHASE_MS = '10000';
		const [{ loadGamesConfig }, { getMikroOrmConfig }] = await Promise.all([
			import('@/infrastructure/config/games-config'),
			import('@/infrastructure/database/mikro-orm.config'),
		]);
		const config = getMikroOrmConfig(
			loadGamesConfig({
				PORT: '4001',
				DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
				RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
				KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
				KEYCLOAK_AUDIENCE: 'crash-game-client',
				BETTING_PHASE_MS: '5000',
				ACTIVE_ROUND_PHASE_MS: '10000',
			}),
		);

		expect(config.clientUrl).toBe(
			'postgresql://admin:admin@localhost:5432/games',
		);
	});
});
