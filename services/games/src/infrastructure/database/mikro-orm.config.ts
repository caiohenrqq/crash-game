import { join } from 'node:path';
import { createPostgreSqlMikroOrmConfig } from '@crash/foundation/database/postgresql-mikro-orm';
import type { GamesConfig } from '@/infrastructure/config/games-config';
import { gamesConfig } from '@/infrastructure/config/games-config';

export function getMikroOrmConfig(config: GamesConfig) {
	return createPostgreSqlMikroOrmConfig({
		databaseUrl: config.databaseUrl,
		migrationsPath: join(
			process.cwd(),
			'src/infrastructure/database/migrations',
		),
	});
}

export default getMikroOrmConfig(gamesConfig);
