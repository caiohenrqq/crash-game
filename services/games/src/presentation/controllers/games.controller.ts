import {
	Controller,
	Get,
	InternalServerErrorException,
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { GetCurrentRoundUseCase } from '@/application/get-current-round.use-case';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { JwtAuthenticationGuard } from '@/infrastructure/auth/jwt-authentication.guard';
import { Public } from '@/infrastructure/auth/public.decorator';
import { AuthenticatedPlayerResponseDto } from '../dtos/authenticated-player-response.dto';
import { CurrentRoundResponseDto } from '../dtos/current-round-response.dto';
import { HealthCheckResponseDto } from '../dtos/health-check-response.dto';

@Controller()
export class GamesController {
	constructor(
		private readonly getCurrentRoundUseCase: GetCurrentRoundUseCase,
	) {}

	@Public()
	@Get('health')
	check(): HealthCheckResponseDto {
		return { status: 'ok', service: 'games' };
	}

	@Public()
	@ApiOkResponse({
		type: CurrentRoundResponseDto,
	})
	@Get('rounds/current')
	async currentRound(): Promise<CurrentRoundResponseDto> {
		const round = await this.getCurrentRoundUseCase.execute();

		if (!round)
			throw new InternalServerErrorException('Current round is unavailable');

		return {
			roundId: round.id,
			state: round.state,
			crashPoint:
				round.state === 'crashed' ? round.crashPoint.toDisplayValue() : null,
			bets: round.bets.map((bet) => ({
				playerId: bet.playerId,
				amountInCents: bet.amountInCents,
			})),
		};
	}

	@ApiBearerAuth()
	@ApiOkResponse({
		type: AuthenticatedPlayerResponseDto,
	})
	@UseGuards(JwtAuthenticationGuard)
	@Get('me')
	me(@Req() request: AuthenticatedRequest): AuthenticatedPlayerResponseDto {
		return request.authenticatedPlayer as AuthenticatedPlayerResponseDto;
	}
}
