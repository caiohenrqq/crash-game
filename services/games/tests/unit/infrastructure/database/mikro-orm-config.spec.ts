import { describe, expect, test } from 'bun:test';
import { loadGamesConfig } from '@/infrastructure/config/games-config';
import { getMikroOrmConfig } from '@/infrastructure/database/mikro-orm.config';

describe('getMikroOrmConfig', () => {
	test('builds a PostgreSQL config with service-local migrations', () => {
		const config = getMikroOrmConfig(
			loadGamesConfig({
				PORT: '4001',
				DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
				RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
				KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
				KEYCLOAK_AUDIENCE: 'crash-game-client',
			}),
		);

		expect(config.clientUrl).toBe(
			'postgresql://admin:admin@localhost:5432/games',
		);
		expect(config.entities).toEqual([]);
		expect(config.discovery?.warnWhenNoEntities).toBe(false);
		expect(config.migrations?.path).toEndWith(
			'/src/infrastructure/database/migrations',
		);
		expect(config.migrations?.glob).toBe('!(*.d).{js,ts,cjs}');
	});

	test('uses the database URL from the parsed service config', () => {
		const config = getMikroOrmConfig(
			loadGamesConfig({
				PORT: '4001',
				DATABASE_URL: 'postgresql://admin:admin@localhost:5432/games',
				RABBITMQ_URL: 'amqp://admin:admin@localhost:5672',
				KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/crash-game',
				KEYCLOAK_AUDIENCE: 'crash-game-client',
			}),
		);

		expect(config.clientUrl).toBe(
			'postgresql://admin:admin@localhost:5432/games',
		);
	});
});
