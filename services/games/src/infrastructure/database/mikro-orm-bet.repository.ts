import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { BetRepository } from '@/application/ports/bet.repository';
import { Bet } from '@/domain/bet';
import { type BetEntity, BetEntitySchema } from './entities/bet.entity';

@Injectable()
export class MikroOrmBetRepository extends BetRepository {
	constructor(private readonly entityManager: EntityManager) {
		super();
	}

	async findByRoundIdAndPlayerId(
		roundId: number,
		playerId: string,
	): Promise<Bet | null> {
		const betEntity = await this.entityManager
			.fork()
			.findOne<BetEntity>(BetEntitySchema, {
				roundId,
				playerId,
			});

		if (!betEntity) return null;

		return this.mapEntityToDomain(betEntity);
	}

	async findById(id: number): Promise<Bet | null> {
		const betEntity = await this.entityManager
			.fork()
			.findOne<BetEntity>(BetEntitySchema, { id });

		if (!betEntity) return null;

		return this.mapEntityToDomain(betEntity);
	}

	async create(bet: Bet): Promise<Bet> {
		if (bet.roundId === null) throw new Error('Bet roundId is required');

		const id = await this.entityManager.fork().insert(BetEntitySchema, {
			roundId: bet.roundId,
			playerId: bet.playerId,
			amountInCents: bet.amountInCents,
			status: bet.status,
			payoutInCents: bet.payoutInCents,
		});

		return Bet.place({
			id,
			roundId: bet.roundId,
			playerId: bet.playerId,
			amountInCents: bet.amountInCents,
			status: bet.status,
			payoutInCents: bet.payoutInCents,
		});
	}

	async save(bet: Bet): Promise<Bet> {
		if (bet.id === null) throw new Error('Bet id is required');

		await this.entityManager.fork().nativeUpdate(
			BetEntitySchema,
			{ id: bet.id },
			{
				status: bet.status,
				payoutInCents: bet.payoutInCents,
			},
		);

		return bet;
	}

	async findAcceptedByRoundId(roundId: number): Promise<Bet[]> {
		const betEntities = await this.entityManager
			.fork()
			.find<BetEntity>(BetEntitySchema, {
				roundId,
				status: 'accepted',
			});

		return betEntities.map((betEntity) => this.mapEntityToDomain(betEntity));
	}

	private mapEntityToDomain(betEntity: BetEntity): Bet {
		return Bet.place({
			id: betEntity.id,
			roundId: betEntity.roundId,
			playerId: betEntity.playerId,
			amountInCents: betEntity.amountInCents,
			status: betEntity.status,
			payoutInCents: betEntity.payoutInCents,
		});
	}
}
