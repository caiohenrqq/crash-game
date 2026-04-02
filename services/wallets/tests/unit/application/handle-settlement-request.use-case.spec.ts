import { describe, expect, mock, test } from 'bun:test';
import { HandleSettlementRequestUseCase } from '@/application/handle-settlement-request.use-case';
import type { SettlementCompletionPublisher } from '@/application/ports/settlement-completion.publisher';
import type { WalletRepository } from '@/application/ports/wallet.repository';
import type { WalletSettlementOperationRepository } from '@/application/ports/wallet-settlement-operation.repository';
import { Wallet } from '@/domain/wallet';
import { WalletSettlementOperation } from '@/domain/wallet-settlement-operation';

describe('HandleSettlementRequestUseCase', () => {
	test('debits the wallet, persists the operation, and publishes completion', async () => {
		const walletRepository: WalletRepository = {
			findByPlayerId: mock(async () =>
				Wallet.rehydrate({
					playerId: 'player-123',
					balanceInCents: 1000,
				}),
			),
			create: mock(async (wallet) => wallet),
			save: mock(async (wallet) => wallet),
		};
		const completionPublisher: SettlementCompletionPublisher = {
			publishCompleted: mock(async () => undefined),
		};
		const useCase = new HandleSettlementRequestUseCase(
			walletRepository,
			{
				findByOperationId: mock(async () => null),
				create: mock(async (operation) => operation),
				save: mock(async (operation) => operation),
				findUnpublished: mock(async () => []),
			} as WalletSettlementOperationRepository,
			completionPublisher,
		);

		const completion = await useCase.execute({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 250,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		expect(completion.status).toBe('succeeded');
		expect(walletRepository.save).toHaveBeenCalledTimes(1);
		expect(completionPublisher.publishCompleted).toHaveBeenCalledTimes(1);
	});

	test('returns the existing completion for a duplicate operation id', async () => {
		const completionPublisher: SettlementCompletionPublisher = {
			publishCompleted: mock(async () => undefined),
		};
		const useCase = new HandleSettlementRequestUseCase(
			{
				findByPlayerId: mock(async () => null),
				create: mock(async (wallet) => wallet),
				save: mock(async (wallet) => wallet),
			} as WalletRepository,
			{
				findByOperationId: mock(async () =>
					WalletSettlementOperation.rehydrate({
						operationId: 'operation-1',
						operationType: 'bet_debit',
						playerId: 'player-123',
						roundId: 7,
						betId: 11,
						amountInCents: 250,
						status: 'succeeded',
						rejectionReason: null,
						occurredAt: new Date('2026-04-02T12:00:00.000Z'),
						publishedAt: new Date('2026-04-02T12:00:01.000Z'),
					}),
				),
				create: mock(async (operation) => operation),
				save: mock(async (operation) => operation),
				findUnpublished: mock(async () => []),
			} as WalletSettlementOperationRepository,
			completionPublisher,
		);

		const completion = await useCase.execute({
			operationId: 'operation-1',
			operationType: 'bet_debit',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 250,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		expect(completion.status).toBe('succeeded');
		expect(completionPublisher.publishCompleted).toHaveBeenCalledTimes(0);
	});

	test('credits the wallet and publishes completion for cashout credit', async () => {
		const wallet = Wallet.rehydrate({
			playerId: 'player-123',
			balanceInCents: 1000,
		});
		const walletRepository: WalletRepository = {
			findByPlayerId: mock(async () => wallet),
			create: mock(async (currentWallet) => currentWallet),
			save: mock(async (currentWallet) => currentWallet),
		};
		const completionPublisher: SettlementCompletionPublisher = {
			publishCompleted: mock(async () => undefined),
		};
		const useCase = new HandleSettlementRequestUseCase(
			walletRepository,
			{
				findByOperationId: mock(async () => null),
				create: mock(async (operation) => operation),
				save: mock(async (operation) => operation),
				findUnpublished: mock(async () => []),
			} as WalletSettlementOperationRepository,
			completionPublisher,
		);

		const completion = await useCase.execute({
			operationId: 'operation-2',
			operationType: 'cashout_credit',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 450,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		expect(completion.status).toBe('succeeded');
		expect(wallet.balanceInCents).toBe(1450);
		expect(walletRepository.save).toHaveBeenCalledTimes(1);
	});

	test('publishes completion for crash loss without mutating the wallet balance', async () => {
		const wallet = Wallet.rehydrate({
			playerId: 'player-123',
			balanceInCents: 1000,
		});
		const walletRepository: WalletRepository = {
			findByPlayerId: mock(async () => wallet),
			create: mock(async (currentWallet) => currentWallet),
			save: mock(async (currentWallet) => currentWallet),
		};
		const completionPublisher: SettlementCompletionPublisher = {
			publishCompleted: mock(async () => undefined),
		};
		const useCase = new HandleSettlementRequestUseCase(
			walletRepository,
			{
				findByOperationId: mock(async () => null),
				create: mock(async (operation) => operation),
				save: mock(async (operation) => operation),
				findUnpublished: mock(async () => []),
			} as WalletSettlementOperationRepository,
			completionPublisher,
		);

		const completion = await useCase.execute({
			operationId: 'operation-3',
			operationType: 'crash_loss',
			playerId: 'player-123',
			roundId: 7,
			betId: 11,
			amountInCents: 300,
			occurredAt: new Date('2026-04-02T12:00:00.000Z'),
		});

		expect(completion.status).toBe('succeeded');
		expect(wallet.balanceInCents).toBe(1000);
		expect(walletRepository.save).toHaveBeenCalledTimes(0);
	});
});
