import {
	SETTLEMENT_COMPLETED_ROUTING_KEY,
	SETTLEMENT_EXCHANGE,
	SETTLEMENT_REQUESTED_QUEUE,
	SETTLEMENT_REQUESTED_ROUTING_KEY,
	type SettlementRequestedMessage,
} from '@crash/foundation/messaging/settlement';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Channel, ConsumeMessage } from 'amqplib';
import { connect } from 'amqplib';
import { HandleSettlementRequestUseCase } from '@/application/handle-settlement-request.use-case';
import {
	type SettlementCompletionPublisher,
	type WalletSettlementCompletion,
} from '@/application/ports/settlement-completion.publisher';
import { WalletSettlementOperationRepository } from '@/application/ports/wallet-settlement-operation.repository';
import { loadWalletsConfig } from '../config/wallets-config';

@Injectable()
export class RabbitMqWalletSettlementBroker
	implements SettlementCompletionPublisher, OnModuleInit, OnModuleDestroy
{
	private connection: Awaited<ReturnType<typeof connect>> | null = null;
	private channel: Channel | null = null;

	constructor(
		private readonly handleSettlementRequestUseCase: HandleSettlementRequestUseCase,
		private readonly walletSettlementOperationRepository?: WalletSettlementOperationRepository,
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
		await channel.assertQueue(SETTLEMENT_REQUESTED_QUEUE, {
			durable: true,
		});
		await channel.bindQueue(
			SETTLEMENT_REQUESTED_QUEUE,
			SETTLEMENT_EXCHANGE,
			SETTLEMENT_REQUESTED_ROUTING_KEY,
		);
		await channel.consume(
			SETTLEMENT_REQUESTED_QUEUE,
			(message) => void this.handleRequestedMessage(message),
		);
		this.channel = channel;
		await this.replayUnpublishedCompletions();
	}

	async onModuleDestroy(): Promise<void> {
		await this.channel?.close();
		await this.connection?.close();
	}

	publishCompleted(completion: WalletSettlementCompletion): Promise<void> {
		this.getChannel().publish(
			SETTLEMENT_EXCHANGE,
			SETTLEMENT_COMPLETED_ROUTING_KEY,
			Buffer.from(
				JSON.stringify({
					operationId: completion.operationId,
					status: completion.status,
					rejectionReason: completion.rejectionReason,
					completedAt: completion.completedAt.toISOString(),
				}),
			),
		);

		return Promise.resolve();
	}

	private async handleRequestedMessage(
		message: ConsumeMessage | null,
	): Promise<void> {
		if (!message) return;

		const requestedMessage = JSON.parse(
			message.content.toString('utf8'),
		) as SettlementRequestedMessage;

		await this.handleSettlementRequestUseCase.execute({
			operationId: requestedMessage.operationId,
			operationType: requestedMessage.operationType,
			playerId: requestedMessage.playerId,
			roundId: requestedMessage.roundId,
			betId: requestedMessage.betId,
			amountInCents: requestedMessage.amountInCents,
			occurredAt: new Date(requestedMessage.occurredAt),
		});

		this.getChannel().ack(message);
	}

	private getChannel(): Channel {
		if (this.providedChannel) return this.providedChannel;
		if (!this.channel) throw new Error('RabbitMQ channel is unavailable');
		return this.channel;
	}

	private async createChannel(): Promise<Channel> {
		const connection = await connect(loadWalletsConfig().rabbitMqUrl);

		this.connection = connection;
		return connection.createChannel();
	}

	private async replayUnpublishedCompletions(): Promise<void> {
		if (!this.walletSettlementOperationRepository) return;

		const unpublishedOperations =
			await this.walletSettlementOperationRepository.findUnpublished();

		for (const operation of unpublishedOperations) {
			if (operation.status === 'requested') continue;

			await this.publishCompleted({
				operationId: operation.operationId,
				status: operation.status === 'succeeded' ? 'succeeded' : 'rejected',
				rejectionReason: operation.rejectionReason,
				completedAt: new Date(),
			});
			operation.markPublished(new Date());
			await this.walletSettlementOperationRepository.save(operation);
		}
	}
}
