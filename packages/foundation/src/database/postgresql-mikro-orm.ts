import { Migrator } from '@mikro-orm/migrations';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import type { DynamicModule } from '@nestjs/common';

type MikroOrmEntity = NonNullable<
	Parameters<typeof defineConfig>[0]['entities']
>[number];

export function createPostgreSqlMikroOrmConfig(options: {
	databaseUrl: string;
	migrationsPath: string;
	entities?: MikroOrmEntity[];
}): ReturnType<typeof defineConfig> {
	return defineConfig({
		clientUrl: options.databaseUrl,
		entities: options.entities ?? [],
		extensions: [Migrator],
		discovery: {
			warnWhenNoEntities: false,
		},
		migrations: {
			path: options.migrationsPath,
			glob: '!(*.d).{js,ts,cjs}',
		},
	});
}

export function createNestPostgreSqlMikroOrmModule(options: {
	databaseUrl: string;
	migrationsPath: string;
	entities?: MikroOrmEntity[];
}): DynamicModule | Promise<DynamicModule> {
	return MikroOrmModule.forRoot({
		driver: PostgreSqlDriver,
		...createPostgreSqlMikroOrmConfig(options),
		// isolated type boundary for the NestJS/MikroORM pkg typing mismatch.
	} as unknown as Parameters<typeof MikroOrmModule.forRoot>[0]) as unknown as
		| DynamicModule
		| Promise<DynamicModule>;
}
