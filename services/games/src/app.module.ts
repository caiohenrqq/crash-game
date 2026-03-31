import { createNestPostgreSqlMikroOrmModule } from '@crash/foundation/database/postgresql-mikro-orm';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GetCurrentRoundUseCase } from './application/get-current-round.use-case';
import { RoundRepository } from './application/ports/round.repository';
import { RoundLifecycleService } from './application/round-lifecycle.service';
import { JoseTokenVerifier } from './infrastructure/auth/jose-token-verifier';
import { JwtAuthenticationGuard } from './infrastructure/auth/jwt-authentication.guard';
import { TOKEN_VERIFIER } from './infrastructure/auth/token-verifier';
import { gamesConfig } from './infrastructure/config/games-config';
import { BetEntitySchema } from './infrastructure/database/entities/bet.entity';
import { RoundEntitySchema } from './infrastructure/database/entities/round.entity';
import { MikroOrmRoundRepository } from './infrastructure/database/mikro-orm-round.repository';
import { GamesController } from './presentation/controllers/games.controller';

@Module({
	imports: [
		createNestPostgreSqlMikroOrmModule({
			databaseUrl: gamesConfig.databaseUrl,
			entities: [RoundEntitySchema, BetEntitySchema],
			migrationsPath: `${process.cwd()}/src/infrastructure/database/migrations`,
		}),
		MikroOrmModule.forFeature([RoundEntitySchema, BetEntitySchema]),
	],
	controllers: [GamesController],
	providers: [
		GetCurrentRoundUseCase,
		RoundLifecycleService,
		JwtAuthenticationGuard,
		{
			provide: APP_GUARD,
			useExisting: JwtAuthenticationGuard,
		},
		{
			provide: RoundRepository,
			useClass: MikroOrmRoundRepository,
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
	constructor(private readonly roundLifecycleService: RoundLifecycleService) {
		void this.roundLifecycleService;
	}
}
