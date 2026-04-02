import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { SettlementOperation } from '@/domain/settlement-operation';
import { CurrentRoundMultiplierService } from './current-round-multiplier.service';
import { BetRepository } from './ports/bet.repository';
import { RoundRepository } from './ports/round.repository';
import { SettlementOperationRepository } from './ports/settlement-operation.repository';
import { SettlementRequester } from './ports/settlement-requester';

@Injectable()
export class CashOutBetUseCase {
	constructor(
		private readonly roundRepository: RoundRepository,
		private readonly betRepository: BetRepository,
		private readonly settlementOperationRepository: SettlementOperationRepository,
		private readonly settlementRequester: SettlementRequester,
		private readonly currentRoundMultiplierService: CurrentRoundMultiplierService,
	) {}

	async execute(input: { playerId: string; cashedOutAt?: Date }) {
		const round = await this.roundRepository.findCurrentRound();

		if (!round) throw new Error('Current round is unavailable');
		if (round.state !== 'active')
			throw new Error(`Round ${round.id} is not active`);

		const bet = await this.betRepository.findByRoundIdAndPlayerId(
			round.id,
			input.playerId,
		);

		if (!bet || bet.status !== 'accepted')
			throw new Error(
				`Accepted bet was not found for player "${input.playerId}" in round ${round.id}`,
			);

		const cashedOutAt = input.cashedOutAt ?? new Date();
		const multiplierInHundredths =
			this.currentRoundMultiplierService.getCurrentMultiplierInHundredths(
				round,
				cashedOutAt,
			);
		const payoutInCents = Math.floor(
			(bet.amountInCents * multiplierInHundredths) / 100,
		);
		const operation = await this.settlementOperationRepository.create(
			SettlementOperation.request({
				operationId: randomUUID(),
				operationType: 'cashout_credit',
				playerId: input.playerId,
				roundId: round.id,
				betId: bet.id,
				amountInCents: payoutInCents,
				occurredAt: cashedOutAt,
			}),
		);

		await this.settlementRequester.publishRequested(operation);
		operation.markPublished(new Date());
		await this.settlementOperationRepository.save(operation);

		const completion = await this.settlementRequester.waitForCompletion(
			operation.operationId,
		);

		if (completion.status !== 'succeeded')
			throw new Error(
				`Wallet credit rejected: ${completion.rejectionReason ?? 'invalid_request'}`,
			);

		if (!bet.id) throw new Error('Bet id is required');

		const persistedBet = await this.betRepository.findById(bet.id);

		if (!persistedBet) throw new Error(`Bet ${bet.id} was not found`);

		return persistedBet;
	}
}
