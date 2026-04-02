import {
	SETTLEMENT_COMPLETED_QUEUE,
	SETTLEMENT_COMPLETED_ROUTING_KEY,
	SETTLEMENT_EXCHANGE,
	SETTLEMENT_REQUESTED_ROUTING_KEY,
	type SettlementCompletedMessage,
	type SettlementRequestedMessage,
} from '@crash/foundation/messaging/settlement';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Channel, ConsumeMessage } from 'amqplib';
import { connect } from 'amqplib';
import { InMemorySettlementCompletionCoordinator } from '@/application/in-memory-settlement-completion-coordinator';
import { SettlementOperationRepository } from '@/application/ports/settlement-operation.repository';
import type {
	SettlementCompletion,
	SettlementRequester,
} from '@/application/ports/settlement-requester';
import { ProcessSettlementCompletionUseCase } from '@/application/process-settlement-completion.use-case';
import type { SettlementOperation } from '@/domain/settlement-operation';
import { loadGamesConfig } from '../config/games-config';

@Injectable()
export class RabbitMqGamesSettlementBroker
	implements SettlementRequester, OnModuleInit, OnModuleDestroy
{
	private connection: Awaited<ReturnType<typeof connect>> | null = null;
	private channel: Channel | null = null;

	constructor(
		private readonly processSettlementCompletionUseCaseOrChannel:
			| ProcessSettlementCompletionUseCase
			| Channel,
		private readonly settlementCompletionCoordinator?: InMemorySettlementCompletionCoordinator,
		private readonly settlementOperationRepository?: SettlementOperationRepository,
		private readonly providedChannel?: Channel,
	) {}

	async onModuleInit(): Promise<void> {
		if (this.channel) return;

		const channel = this.providedChannel
			? this.providedChannel
			: await this.createChannel();

		await channel.assertExchange(SETTLEMENT_EXCHANGE, 'direct', {
			durable: true,
		});
		await channel.assertQueue(SETTLEMENT_COMPLETED_QUEUE, {
			durable: true,
		});
		await channel.bindQueue(
			SETTLEMENT_COMPLETED_QUEUE,
			SETTLEMENT_EXCHANGE,
			SETTLEMENT_COMPLETED_ROUTING_KEY,
		);
		await channel.consume(
			SETTLEMENT_COMPLETED_QUEUE,
			(message) => void this.handleCompletedMessage(message),
		);
		this.channel = channel;
		await this.replayUnpublishedOperations();
	}

	async onModuleDestroy(): Promise<void> {
		await this.channel?.close();
		await this.connection?.close();
	}

	publishRequested(operation: SettlementOperation): Promise<void> {
		const requestedMessage: SettlementRequestedMessage = {
			operationId: operation.operationId,
			operationType: operation.operationType,
			playerId: operation.playerId,
			roundId: operation.roundId,
			betId: operation.betId,
			amountInCents: operation.amountInCents,
			occurredAt: operation.occurredAt.toISOString(),
		};

		this.getChannel().publish(
			SETTLEMENT_EXCHANGE,
			SETTLEMENT_REQUESTED_ROUTING_KEY,
			Buffer.from(JSON.stringify(requestedMessage)),
		);

		return Promise.resolve();
	}

	waitForCompletion(operationId: string): Promise<SettlementCompletion> {
		if (!this.settlementCompletionCoordinator)
			throw new Error('Settlement completion coordinator is required');

		return this.settlementCompletionCoordinator.waitForCompletion(operationId);
	}

	private async handleCompletedMessage(
		message: ConsumeMessage | null,
	): Promise<void> {
		if (!message) return;

		const completedMessage = JSON.parse(
			message.content.toString('utf8'),
		) as SettlementCompletedMessage;

		if ('execute' in this.processSettlementCompletionUseCaseOrChannel) {
			await this.processSettlementCompletionUseCaseOrChannel.execute({
				operationId: completedMessage.operationId,
				status: completedMessage.status,
				rejectionReason: completedMessage.rejectionReason,
				completedAt: new Date(completedMessage.completedAt),
			});
		}

		this.getChannel().ack(message);
	}

	private getChannel(): Channel {
		if (!this.channel) throw new Error('RabbitMQ channel is unavailable');

		return this.channel;
	}

	private async createChannel(): Promise<Channel> {
		const connection = await connect(loadGamesConfig().rabbitMqUrl);

		this.connection = connection;
		return connection.createChannel();
	}

	private async replayUnpublishedOperations(): Promise<void> {
		if (!this.settlementOperationRepository) return;

		const unpublishedOperations =
			await this.settlementOperationRepository.findUnpublished();

		for (const operation of unpublishedOperations) {
			await this.publishRequested(operation);
			operation.markPublished(new Date());
			await this.settlementOperationRepository.save(operation);
		}
	}
}
