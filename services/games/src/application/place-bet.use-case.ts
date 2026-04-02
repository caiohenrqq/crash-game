import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Bet } from '@/domain/bet';
import { SettlementOperation } from '@/domain/settlement-operation';
import { BetRepository } from './ports/bet.repository';
import { RoundRepository } from './ports/round.repository';
import { SettlementOperationRepository } from './ports/settlement-operation.repository';
import { SettlementRequester } from './ports/settlement-requester';

@Injectable()
export class PlaceBetUseCase {
	constructor(
		private readonly roundRepository: RoundRepository,
		private readonly betRepository: BetRepository,
		private readonly settlementOperationRepository: SettlementOperationRepository,
		private readonly settlementRequester: SettlementRequester,
	) {}

	async execute(input: {
		playerId: string;
		amountInCents: number;
	}): Promise<Bet> {
		const round = await this.roundRepository.findCurrentRound();

		if (!round) throw new Error('Current round is unavailable');
		if (round.state !== 'betting')
			throw new Error(`Round ${round.id} is not accepting bets`);

		const existingBet = await this.betRepository.findByRoundIdAndPlayerId(
			round.id,
			input.playerId,
		);

		if (existingBet)
			throw new Error(
				`Bet already exists for player "${input.playerId}" in round ${round.id}`,
			);

		const bet = await this.betRepository.create(
			Bet.place({
				roundId: round.id,
				playerId: input.playerId,
				amountInCents: input.amountInCents,
				status: 'pending_debit',
			}),
		);
		const operation = await this.settlementOperationRepository.create(
			SettlementOperation.request({
				operationId: randomUUID(),
				operationType: 'bet_debit',
				playerId: input.playerId,
				roundId: round.id,
				betId: bet.id,
				amountInCents: input.amountInCents,
				occurredAt: new Date(),
			}),
		);

		await this.settlementRequester.publishRequested(operation);
		operation.markPublished(new Date());
		await this.settlementOperationRepository.save(operation);

		const completion = await this.settlementRequester.waitForCompletion(
			operation.operationId,
		);

		const persistedBet = bet.id
			? await this.betRepository.findById(bet.id)
			: null;

		if (completion.status === 'succeeded') {
			if (!persistedBet) throw new Error(`Bet ${bet.id} was not found`);
			return persistedBet;
		}

		throw new Error(
			`Wallet debit rejected: ${completion.rejectionReason ?? 'invalid_request'}`,
		);
	}
}
