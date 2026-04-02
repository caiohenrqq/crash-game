import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { RoundRepository } from '@/application/ports/round.repository';
import { Bet } from '@/domain/bet';
import { CrashPoint } from '@/domain/crash-point';
import { Round } from '@/domain/round';
import { type BetEntity, BetEntitySchema } from './entities/bet.entity';
import { type RoundEntity, RoundEntitySchema } from './entities/round.entity';

@Injectable()
export class MikroOrmRoundRepository extends RoundRepository {
	constructor(private readonly entityManager: EntityManager) {
		super();
	}

	async findCurrentRound(): Promise<Round | null> {
		const entityManager = this.entityManager.fork();
		const [roundEntity] = await entityManager.find<RoundEntity>(
			RoundEntitySchema,
			{},
			{
				orderBy: {
					id: 'desc',
				},
				limit: 1,
			},
		);

		if (!roundEntity) return null;

		const betEntities = await entityManager.find<BetEntity>(
			BetEntitySchema,
			{
				roundId: roundEntity.id,
			},
			{
				orderBy: {
					id: 'asc',
				},
			},
		);

		return Round.rehydrate({
			id: roundEntity.id,
			crashPoint: CrashPoint.fromHundredths(roundEntity.crashPointInHundredths),
			createdAt: roundEntity.createdAt,
			state: roundEntity.state,
			activatedAt: roundEntity.activatedAt,
			crashedAt: roundEntity.crashedAt,
			bets: betEntities.map((betEntity) =>
				Bet.place({
					id: betEntity.id,
					roundId: betEntity.roundId,
					playerId: betEntity.playerId,
					amountInCents: betEntity.amountInCents,
					status: betEntity.status,
					payoutInCents: betEntity.payoutInCents,
				}),
			),
		});
	}

	async save(round: Round): Promise<Round> {
		await this.entityManager.fork().nativeUpdate(
			RoundEntitySchema,
			{ id: round.id },
			{
				state: round.state,
				activatedAt: round.activatedAt,
				crashedAt: round.crashedAt,
			},
		);

		return round;
	}

	async create(round: Round): Promise<Round> {
		const entityManager = this.entityManager.fork();
		await entityManager.insert(RoundEntitySchema, {
			id: round.id,
			state: round.state,
			crashPointInHundredths: round.crashPoint.inHundredths,
			createdAt: round.createdAt,
			activatedAt: round.activatedAt,
			crashedAt: round.crashedAt,
		});

		for (const bet of round.bets) {
			await entityManager.insert(BetEntitySchema, {
				roundId: round.id,
				playerId: bet.playerId,
				amountInCents: bet.amountInCents,
				status: bet.status,
				payoutInCents: bet.payoutInCents,
			});
		}

		return round;
	}

	async getNextRoundId(): Promise<number> {
		const [latestRound] = await this.entityManager.fork().find<RoundEntity>(
			RoundEntitySchema,
			{},
			{
				orderBy: {
					id: 'desc',
				},
				limit: 1,
			},
		);

		return (latestRound?.id ?? 0) + 1;
	}
}
