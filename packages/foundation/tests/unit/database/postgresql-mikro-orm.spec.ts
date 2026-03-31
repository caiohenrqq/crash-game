import { describe, expect, test } from 'bun:test';
import { createPostgreSqlMikroOrmConfig } from '@crash/foundation/database/postgresql-mikro-orm';

describe('createPostgreSqlMikroOrmConfig', () => {
	test('builds a PostgreSQL config with the provided database URL and migrations path', () => {
		const config = createPostgreSqlMikroOrmConfig({
			databaseUrl: 'postgresql://admin:admin@localhost:5432/games',
			migrationsPath:
				'/workspace/services/games/src/infrastructure/database/migrations',
		});

		expect(config.clientUrl).toBe(
			'postgresql://admin:admin@localhost:5432/games',
		);
		expect(config.entities).toEqual([]);
		expect(config.discovery?.warnWhenNoEntities).toBe(false);
		expect(config.migrations?.path).toBe(
			'/workspace/services/games/src/infrastructure/database/migrations',
		);
		expect(config.migrations?.glob).toBe('!(*.d).{js,ts,cjs}');
	});
});
