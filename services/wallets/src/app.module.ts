import { createNestPostgreSqlMikroOrmModule } from '@crash/foundation/database/postgresql-mikro-orm';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CreateWalletUseCase } from './application/create-wallet.use-case';
import { GetWalletUseCase } from './application/get-wallet.use-case';
import { WalletRepository } from './application/ports/wallet.repository';
import { JoseTokenVerifier } from './infrastructure/auth/jose-token-verifier';
import { JwtAuthenticationGuard } from './infrastructure/auth/jwt-authentication.guard';
import { TOKEN_VERIFIER } from './infrastructure/auth/token-verifier';
import { walletsConfig } from './infrastructure/config/wallets-config';
import { WalletEntitySchema } from './infrastructure/database/entities/wallet.entity';
import { MikroOrmWalletRepository } from './infrastructure/database/mikro-orm-wallet.repository';
import { WalletsController } from './presentation/controllers/wallets.controller';

@Module({
	imports: [
		createNestPostgreSqlMikroOrmModule({
			databaseUrl: walletsConfig.databaseUrl,
			entities: [WalletEntitySchema],
			migrationsPath: `${process.cwd()}/src/infrastructure/database/migrations`,
		}),
		MikroOrmModule.forFeature([WalletEntitySchema]),
	],
	controllers: [WalletsController],
	providers: [
		CreateWalletUseCase,
		GetWalletUseCase,
		JwtAuthenticationGuard,
		{
			provide: APP_GUARD,
			useExisting: JwtAuthenticationGuard,
		},
		{
			provide: WalletRepository,
			useClass: MikroOrmWalletRepository,
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
