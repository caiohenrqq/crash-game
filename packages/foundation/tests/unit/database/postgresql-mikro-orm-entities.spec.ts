import { describe, expect, test } from 'bun:test';
import { createPostgreSqlMikroOrmConfig } from '@crash/foundation/database/postgresql-mikro-orm';

class TestEntity {}

describe('createPostgreSqlMikroOrmConfig entity support', () => {
	test('includes configured entities in the MikroORM config', () => {
		const config = createPostgreSqlMikroOrmConfig({
			databaseUrl: 'postgresql://admin:admin@localhost:5432/wallets',
			migrationsPath:
				'/workspace/services/wallets/src/infrastructure/database/migrations',
			entities: [TestEntity],
		});

		expect(config.entities).toEqual([TestEntity]);
	});
});
