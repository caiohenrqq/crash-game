import { createNestPostgreSqlMikroOrmModule } from '@crash/foundation/database/postgresql-mikro-orm';
import {
	AuthenticatedPlayerThrottlerGuard,
	createHttpThrottlerOptions,
} from '@crash/foundation/nest/http-throttler';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { CashOutBetUseCase } from './application/cash-out-bet.use-case';
import {
	ACTIVE_ROUND_PHASE_MS,
	CurrentRoundMultiplierService,
} from './application/current-round-multiplier.service';
import { GetCurrentRoundUseCase } from './application/get-current-round.use-case';
import { InMemorySettlementCompletionCoordinator } from './application/in-memory-settlement-completion-coordinator';
import { PlaceBetUseCase } from './application/place-bet.use-case';
import { BetRepository } from './application/ports/bet.repository';
import { RoundRepository } from './application/ports/round.repository';
import { SettlementCompletionNotifier } from './application/ports/settlement-completion-notifier';
import { SettlementOperationRepository } from './application/ports/settlement-operation.repository';
import { SettlementRequester } from './application/ports/settlement-requester';
import { ProcessSettlementCompletionUseCase } from './application/process-settlement-completion.use-case';
import { RoundLifecycleService } from './application/round-lifecycle.service';
import { JoseTokenVerifier } from './infrastructure/auth/jose-token-verifier';
import { JwtAuthenticationGuard } from './infrastructure/auth/jwt-authentication.guard';
import { TOKEN_VERIFIER } from './infrastructure/auth/token-verifier';
import { RabbitMqGamesSettlementBroker } from './infrastructure/broker/rabbit-mq-games-settlement-broker';
import { gamesConfig } from './infrastructure/config/games-config';
import { BetEntitySchema } from './infrastructure/database/entities/bet.entity';
import { RoundEntitySchema } from './infrastructure/database/entities/round.entity';
import { SettlementOperationEntitySchema } from './infrastructure/database/entities/settlement-operation.entity';
import { MikroOrmBetRepository } from './infrastructure/database/mikro-orm-bet.repository';
import { MikroOrmRoundRepository } from './infrastructure/database/mikro-orm-round.repository';
import { MikroOrmSettlementOperationRepository } from './infrastructure/database/mikro-orm-settlement-operation.repository';
import { GamesController } from './presentation/controllers/games.controller';

@Module({
	imports: [
		ThrottlerModule.forRoot(createHttpThrottlerOptions(gamesConfig)),
		createNestPostgreSqlMikroOrmModule({
			databaseUrl: gamesConfig.databaseUrl,
			entities: [
				RoundEntitySchema,
				BetEntitySchema,
				SettlementOperationEntitySchema,
			],
			migrationsPath: `${process.cwd()}/src/infrastructure/database/migrations`,
		}),
		MikroOrmModule.forFeature([
			RoundEntitySchema,
			BetEntitySchema,
			SettlementOperationEntitySchema,
		]),
	],
	controllers: [GamesController],
	providers: [
		GetCurrentRoundUseCase,
		PlaceBetUseCase,
		CashOutBetUseCase,
		ProcessSettlementCompletionUseCase,
		InMemorySettlementCompletionCoordinator,
		CurrentRoundMultiplierService,
		RabbitMqGamesSettlementBroker,
		RoundLifecycleService,
		AuthenticatedPlayerThrottlerGuard,
		JwtAuthenticationGuard,
		{
			provide: ACTIVE_ROUND_PHASE_MS,
			useValue: gamesConfig.activeRoundPhaseMs,
		},
		{
			provide: APP_GUARD,
			useExisting: JwtAuthenticationGuard,
		},
		{
			provide: APP_GUARD,
			useExisting: AuthenticatedPlayerThrottlerGuard,
		},
		{
			provide: RoundRepository,
			useClass: MikroOrmRoundRepository,
		},
		{
			provide: BetRepository,
			useClass: MikroOrmBetRepository,
		},
		{
			provide: SettlementOperationRepository,
			useClass: MikroOrmSettlementOperationRepository,
		},
		{
			provide: SettlementCompletionNotifier,
			useExisting: InMemorySettlementCompletionCoordinator,
		},
		{
			provide: SettlementRequester,
			useExisting: RabbitMqGamesSettlementBroker,
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
export class AppModule {
	constructor(
		private readonly roundLifecycleService: RoundLifecycleService,
		private readonly rabbitMqGamesSettlementBroker: RabbitMqGamesSettlementBroker,
	) {
		void this.roundLifecycleService;
		void this.rabbitMqGamesSettlementBroker;
	}
}
