import { join } from 'node:path';
import { createPostgreSqlMikroOrmConfig } from '@crash/foundation/database/postgresql-mikro-orm';
import type { GamesConfig } from '@/infrastructure/config/games-config';
import { gamesConfig } from '@/infrastructure/config/games-config';
import { BetEntitySchema } from './entities/bet.entity';
import { RoundEntitySchema } from './entities/round.entity';

export function getMikroOrmConfig(config: GamesConfig) {
	return createPostgreSqlMikroOrmConfig({
		databaseUrl: config.databaseUrl,
		entities: [RoundEntitySchema, BetEntitySchema],
		migrationsPath: join(
			process.cwd(),
			'src/infrastructure/database/migrations',
		),
	});
}

export default getMikroOrmConfig(gamesConfig);
