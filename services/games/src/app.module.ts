import { createNestPostgreSqlMikroOrmModule } from '@crash/foundation/database/postgresql-mikro-orm';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JoseTokenVerifier } from './infrastructure/auth/jose-token-verifier';
import { JwtAuthenticationGuard } from './infrastructure/auth/jwt-authentication.guard';
import { TOKEN_VERIFIER } from './infrastructure/auth/token-verifier';
import { gamesConfig } from './infrastructure/config/games-config';
import { GamesController } from './presentation/controllers/games.controller';

@Module({
	imports: [
		createNestPostgreSqlMikroOrmModule({
			databaseUrl: gamesConfig.databaseUrl,
			migrationsPath: `${process.cwd()}/src/infrastructure/database/migrations`,
		}),
	],
	controllers: [GamesController],
	providers: [
		JwtAuthenticationGuard,
		{
			provide: APP_GUARD,
			useExisting: JwtAuthenticationGuard,
		},
		{
			provide: TOKEN_VERIFIER,
			useFactory: () =>
				new JoseTokenVerifier(
					gamesConfig.keycloakIssuerUrl,
					gamesConfig.keycloakAudience,
				),
		},
	],
})
export class AppModule {}
