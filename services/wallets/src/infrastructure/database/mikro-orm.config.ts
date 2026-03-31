import { join } from 'node:path';
import { createPostgreSqlMikroOrmConfig } from '@crash/foundation/database/postgresql-mikro-orm';
import type { WalletsConfig } from '@/infrastructure/config/wallets-config';
import { walletsConfig } from '@/infrastructure/config/wallets-config';

export function getMikroOrmConfig(config: WalletsConfig) {
	return createPostgreSqlMikroOrmConfig({
		databaseUrl: config.databaseUrl,
		migrationsPath: join(
			process.cwd(),
			'src/infrastructure/database/migrations',
		),
	});
}

export default getMikroOrmConfig(walletsConfig);
