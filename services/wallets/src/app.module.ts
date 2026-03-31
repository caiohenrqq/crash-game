import { createNestPostgreSqlMikroOrmModule } from '@crash/foundation/database/postgresql-mikro-orm';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JoseTokenVerifier } from './infrastructure/auth/jose-token-verifier';
import { JwtAuthenticationGuard } from './infrastructure/auth/jwt-authentication.guard';
import { TOKEN_VERIFIER } from './infrastructure/auth/token-verifier';
import { walletsConfig } from './infrastructure/config/wallets-config';
import { WalletsController } from './presentation/controllers/wallets.controller';

@Module({
	imports: [
		createNestPostgreSqlMikroOrmModule({
			databaseUrl: walletsConfig.databaseUrl,
			migrationsPath: `${process.cwd()}/src/infrastructure/database/migrations`,
		}),
	],
	controllers: [WalletsController],
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
					walletsConfig.keycloakIssuerUrl,
					walletsConfig.keycloakAudience,
				),
		},
	],
})
export class AppModule {}
