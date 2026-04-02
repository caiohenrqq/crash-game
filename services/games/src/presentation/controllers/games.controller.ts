import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
} from '@nestjs/swagger';
import { CashOutBetUseCase } from '@/application/cash-out-bet.use-case';
import { GetCurrentRoundUseCase } from '@/application/get-current-round.use-case';
import { PlaceBetUseCase } from '@/application/place-bet.use-case';
import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { JwtAuthenticationGuard } from '@/infrastructure/auth/jwt-authentication.guard';
import { Public } from '@/infrastructure/auth/public.decorator';
import { AuthenticatedPlayerResponseDto } from '../dtos/authenticated-player-response.dto';
import { CashOutBetResponseDto } from '../dtos/cash-out-bet-response.dto';
import { CurrentRoundResponseDto } from '../dtos/current-round-response.dto';
import { HealthCheckResponseDto } from '../dtos/health-check-response.dto';
import { PlaceBetRequestDto } from '../dtos/place-bet-request.dto';
import { PlaceBetResponseDto } from '../dtos/place-bet-response.dto';

@Controller()
export class GamesController {
	constructor(
		private readonly getCurrentRoundUseCase: GetCurrentRoundUseCase,
		private readonly placeBetUseCase: PlaceBetUseCase,
		private readonly cashOutBetUseCase: CashOutBetUseCase,
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
	@ApiCreatedResponse({
		type: PlaceBetResponseDto,
	})
	@UseGuards(JwtAuthenticationGuard)
	@Post('bet')
	async placeBet(
		@Body() body: PlaceBetRequestDto,
		@Req() request: AuthenticatedRequest,
	): Promise<PlaceBetResponseDto> {
		const bet = await this.placeBetUseCase.execute({
			playerId: this.getAuthenticatedPlayerId(request),
			amountInCents: body.amountInCents,
		});

		return {
			betId: bet.id ?? 0,
			playerId: bet.playerId,
			amountInCents: bet.amountInCents,
			status: bet.status,
		};
	}

	@ApiBearerAuth()
	@ApiOkResponse({
		type: CashOutBetResponseDto,
	})
	@UseGuards(JwtAuthenticationGuard)
	@Post('bet/cashout')
	async cashOutBet(
		@Req() request: AuthenticatedRequest,
	): Promise<CashOutBetResponseDto> {
		const bet = await this.cashOutBetUseCase.execute({
			playerId: this.getAuthenticatedPlayerId(request),
		});

		return {
			betId: bet.id ?? 0,
			playerId: bet.playerId,
			amountInCents: bet.amountInCents,
			status: 'cashed_out',
			payoutInCents: bet.payoutInCents ?? 0,
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

	private getAuthenticatedPlayerId(request: AuthenticatedRequest): string {
		if (!request.authenticatedPlayer)
			throw new InternalServerErrorException(
				'Authenticated player is required',
			);

		return request.authenticatedPlayer.playerId;
	}
}
