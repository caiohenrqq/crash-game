import { describe, expect, mock, test } from 'bun:test';
import { InternalServerErrorException } from '@nestjs/common';
import { GamesController } from '@/presentation/controllers/games.controller';

describe('GamesController', () => {
	test('fails when no current round exists', async () => {
		const controller = new GamesController({
			execute: mock(async () => null),
		} as never);

		await expect(controller.currentRound()).rejects.toBeInstanceOf(
			InternalServerErrorException,
		);
	});
});
