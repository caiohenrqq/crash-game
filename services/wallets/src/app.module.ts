import { createNestPostgreSqlMikroOrmModule } from '@crash/foundation/database/postgresql-mikro-orm';
import {
	AuthenticatedPlayerThrottlerGuard,
	createHttpThrottlerOptions,
} from '@crash/foundation/nest/http-throttler';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { CreateWalletUseCase } from './application/create-wallet.use-case';
import { GetWalletUseCase } from './application/get-wallet.use-case';
import { HandleSettlementRequestUseCase } from './application/handle-settlement-request.use-case';
import { SettlementCompletionPublisher } from './application/ports/settlement-completion.publisher';
import { WalletRepository } from './application/ports/wallet.repository';
import { WalletSettlementOperationRepository } from './application/ports/wallet-settlement-operation.repository';
import { JoseTokenVerifier } from './infrastructure/auth/jose-token-verifier';
import { JwtAuthenticationGuard } from './infrastructure/auth/jwt-authentication.guard';
import { TOKEN_VERIFIER } from './infrastructure/auth/token-verifier';
import { RabbitMqWalletSettlementBroker } from './infrastructure/broker/rabbit-mq-wallet-settlement-broker';
import { walletsConfig } from './infrastructure/config/wallets-config';
import { WalletEntitySchema } from './infrastructure/database/entities/wallet.entity';
import { WalletSettlementOperationEntitySchema } from './infrastructure/database/entities/wallet-settlement-operation.entity';
import { MikroOrmWalletRepository } from './infrastructure/database/mikro-orm-wallet.repository';
import { MikroOrmWalletSettlementOperationRepository } from './infrastructure/database/mikro-orm-wallet-settlement-operation.repository';
import { WalletsController } from './presentation/controllers/wallets.controller';

@Module({
	imports: [
		ThrottlerModule.forRoot(createHttpThrottlerOptions(walletsConfig)),
		createNestPostgreSqlMikroOrmModule({
			databaseUrl: walletsConfig.databaseUrl,
			entities: [WalletEntitySchema, WalletSettlementOperationEntitySchema],
			migrationsPath: `${process.cwd()}/src/infrastructure/database/migrations`,
		}),
		MikroOrmModule.forFeature([
			WalletEntitySchema,
			WalletSettlementOperationEntitySchema,
		]),
	],
	controllers: [WalletsController],
	providers: [
		CreateWalletUseCase,
		GetWalletUseCase,
		HandleSettlementRequestUseCase,
		RabbitMqWalletSettlementBroker,
		AuthenticatedPlayerThrottlerGuard,
		JwtAuthenticationGuard,
		{
			provide: APP_GUARD,
			useExisting: JwtAuthenticationGuard,
		},
		{
			provide: APP_GUARD,
			useExisting: AuthenticatedPlayerThrottlerGuard,
		},
		{
			provide: WalletRepository,
			useClass: MikroOrmWalletRepository,
		},
		{
			provide: WalletSettlementOperationRepository,
			useClass: MikroOrmWalletSettlementOperationRepository,
		},
		{
			provide: SettlementCompletionPublisher,
			useExisting: RabbitMqWalletSettlementBroker,
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
export class AppModule {
	constructor(
		private readonly rabbitMqWalletSettlementBroker: RabbitMqWalletSettlementBroker,
	) {
		void this.rabbitMqWalletSettlementBroker;
	}
}
